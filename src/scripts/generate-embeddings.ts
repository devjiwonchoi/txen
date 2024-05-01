import fs from 'fs/promises'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import * as edgedb from 'edgedb'
import e from '../../dbschema/edgeql-js'
import { encode } from 'gpt-tokenizer'

dotenv.config()

function initOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  // reads OPENAI_API_KEY by default
  return new OpenAI()
}

export const openai = initOpenAIClient()

interface Section {
  id?: string
  tokens: number
  content: string
  embedding: number[]
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  return (
    await Promise.all(
      entries.map((entry) => {
        const { path } = entry
        if (entry.isFile()) return [path]
        if (entry.isDirectory()) return walk(path)
        return []
      })
    )
  ).flat()
}

async function prepareSectionsData(sectionPaths: string[]): Promise<Section[]> {
  const contents: string[] = []
  const sections: Section[] = []

  for (const path of sectionPaths) {
    const content = await fs.readFile(path, 'utf8')
    // OpenAI recommends replacing newlines with spaces for best results
    // when generating embeddings
    const contentTrimmed = content.replace(/\n/g, ' ')
    contents.push(contentTrimmed)
    sections.push({
      content,
      tokens: encode(content).length,
      embedding: [],
    })
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

;(async function storeEmbeddings() {
  const client = edgedb.createClient()

  console.log('created client')

  const sectionPaths = await walk('docs')

  console.log(`Discovered ${sectionPaths.length} sections`)

  const sections = await prepareSectionsData(sectionPaths)

  // Delete old data from the DB.
  await e.delete(e.Section).run(client)

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

  await query.run(client, { sections })
  console.log('Embedding generation complete')
})()
