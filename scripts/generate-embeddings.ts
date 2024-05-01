import edgeql from 'dbschema/edgeql-js'
import { join } from 'path'
import { readdir, readFile } from 'fs/promises'
import { createClient as createEdgeDB } from 'edgedb'
import { encode } from 'gpt-tokenizer'
import { initOpenAI } from '@/utils/openai'

const openai = initOpenAI()

type Section = {
  id?: string
  tokens: number
  content: string
  embedding: number[]
}

async function getEntries(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const entryJobs = entries.map((entry) => {
    const entryPath = join(dir, entry.name)
    if (entry.isFile()) return [entryPath]
    if (entry.isDirectory()) return getEntries(entryPath)
    return []
  })
  return (await Promise.all(entryJobs)).flat().filter(Boolean)
}

function sectionizeContentByHeadings(content: string): string[] {
  const headings = content.match(/^#+\s.+/gm)
  if (!headings) return [content]
  const sections: string[] = []
  let start = 0
  for (const heading of headings) {
    const index = content.indexOf(heading, start)
    sections.push(content.slice(start, index))
    start = index
  }
  sections.push(content.slice(start))
  return sections
}

async function getSections(entries: string[]): Promise<Section[]> {
  const contents: string[] = []
  const sections: Section[] = []

  for (const entry of entries) {
    const content = await readFile(entry, 'utf8')
    // OpenAI recommends replacing newlines with spaces for best results
    // when generating embeddings
    const sectionizedContents = sectionizeContentByHeadings(content)
    for (const section of sectionizedContents) {
      if (!section.length) continue
      const contentTrimmed = section.replace(/\n/g, ' ')
      contents.push(contentTrimmed)
      sections.push({
        content: section,
        tokens: encode(section).length,
        embedding: [],
      })
    }
  }

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: contents,
  })

  embeddingResponse.data.forEach((item, i) => {
    const section = sections[i]
    if (!section) return
    section.embedding = item.embedding
  })

  return sections
}

async function storeEmbeddings() {
  const edgedb = createEdgeDB()
  const entries = await getEntries('docs')
  const sections = await getSections(entries)
  console.log(`Discovered ${sections.length} sections`)

  // Delete old data from the DB.
  await edgeql.delete(edgeql.Section).run(edgedb)

  // Bulk-insert all data into EdgeDB database.
  const query = edgeql.params({ sections: edgeql.json }, ({ sections }) => {
    return edgeql.for(edgeql.json_array_unpack(sections), (section) => {
      return edgeql.insert(edgeql.Section, {
        content: edgeql.cast(edgeql.str, section.content!),
        tokens: edgeql.cast(edgeql.int16, section.tokens!),
        embedding: edgeql.cast(edgeql.OpenAIEmbedding, section.embedding!),
      })
    })
  })

  await query.run(edgedb, { sections })
  console.log('Embedding generation complete')
}

async function main() {
  await storeEmbeddings()
}

main().catch((err) => console.error(err))
