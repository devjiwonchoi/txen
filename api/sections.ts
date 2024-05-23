import type { Embedding } from 'ai'
import { join } from 'node:path'
import { createHttpClient } from 'edgedb'

const { getSectionsQuery } = await import(
  join(process.cwd(), '/get-sections-query.js')
)

export async function POST(request: Request) {
  try {
    const { embedding } = (await request.json()) as { embedding: Embedding }

    const sections = await getSectionsQuery.run(createHttpClient(), {
      target: embedding,
      matchThreshold: 0.3,
      matchCount: 8,
      minContentLength: 20,
    })

    return new Response(JSON.stringify({ sections }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.log(error)
  }
}
