import type { Embedding } from 'ai'
import { createHttpClient } from 'edgedb'
import { getSectionsQuery } from './_get-sections-query'

const edgedb = createHttpClient()

export async function POST(request: Request) {
  try {
    const { embedding } = (await request.json()) as { embedding: Embedding }
    const sections = await getSectionsQuery.run(edgedb, {
      target: embedding,
      matchThreshold: 0.3,
      matchCount: 8,
      minContentLength: 20,
    })

    return new Response(JSON.stringify({ sections }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response('Something went wrong', {
      status: 403,
    })
  }
}
