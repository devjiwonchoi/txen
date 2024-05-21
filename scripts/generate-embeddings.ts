import e from 'dbschema/edgeql-js'
import { join } from 'path'
import { readdir, readFile } from 'fs/promises'
import { createClient as createEdgeDB } from 'edgedb'
import { encode } from 'gpt-tokenizer'
import { initOpenAI } from '@/utils/openai'

type Section = {
  id?: string
  tokens: number
  content: string
  embedding: number[]
}

const openai = initOpenAI()

function splitContentByHeadings(content: string): string[] {
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
  // OpenAI recommends replacing newlines with spaces for best results
  // when generating embeddings
  return sections.map((section) => section.replace(/\n/g, ' ')).filter(Boolean)
}

async function getSections(entries: string[]): Promise<Section[]> {
  const contents: string[] = []
  const sections: Section[] = []

  for (const entry of entries) {
    const content = await readFile(entry, 'utf8')
    contents.push(...splitContentByHeadings(content))
  }

  for (const content of contents) {
    sections.push({
      content,
      tokens: encode(content).length,
      embedding: [],
    })
  }

  console.log(`Discovered ${sections.length} sections`)
  if (process.env.NODE_ENV === 'test') {
    console.log('Exiting early in test environment')
    process.exit(0)
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

async function storeEmbeddings() {
  const edgedb = createEdgeDB()
  const entries = await getEntries('docs')
  console.log(`Discovered ${entries.length} entries`)
  const sections = await getSections(entries)

  // Delete old data from the DB.
  // TODO: do not delete all data, use checksum
  await e.delete(e.Section).run(edgedb)
  console.log('Deleted old data')

  // Bulk-insert all data into EdgeDB database.
  const query = e.params({ sections: e.json }, ({ sections }) => {
    return e.for(e.json_array_unpack(sections), (section) => {
      return e.insert(e.Section, {
        content: e.cast(e.str, section.content!),
        tokens: e.cast(e.int16, section.tokens!),
        embedding: e.cast(e.OpenAIEmbedding, section.embedding!),
      })
    })
  })

  await query.run(edgedb, { sections })
  console.log('Embedding generation complete')
}

async function main() {
  console.log('Generating embeddings')
  await storeEmbeddings()
}

main().catch((err) => console.error(err))
