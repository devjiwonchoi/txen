import edgeql from 'dbschema/edgeql-js'
import { stripIndents, oneLineTrim } from 'common-tags'
import { createHttpClient } from 'edgedb'
import { errors } from '@/utils/constants'
import { initOpenAI } from '@/utils/openai'

const openai = initOpenAI()
const edgedbClient = createHttpClient()

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query: string }
    const sanitizedQuery = query.trim()

    const flagged = await isQueryFlagged(query)

    if (flagged) throw new Error(errors.flagged)

    const embedding = await getEmbedding(query)

    const context = await getContext(embedding ?? [])

    const prompt = createFullPrompt(sanitizedQuery, context)

    const answer = await getOpenAiAnswer(prompt)

    return new Response(answer.body, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    })
  } catch (error: any) {
    console.error(error)

    const uiError = error.message || errors.default

    return new Response(uiError, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function isQueryFlagged(query: string) {
  const moderation = await openai.moderations.create({
    input: query,
  })
  return moderation.results[0]?.flagged
}

async function getEmbedding(query: string) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query.replaceAll('\n', ' '),
  })
  return embeddingResponse.data[0]?.embedding
}

const getSectionsQuery = edgeql.params(
  {
    target: edgeql.OpenAIEmbedding,
    matchThreshold: edgeql.float64,
    matchCount: edgeql.int16,
    minContentLength: edgeql.int16,
  },
  (params) => {
    return edgeql.select(edgeql.Section, (section) => {
      const dist = edgeql.ext.pgvector.cosine_distance(
        section.embedding,
        params.target
      )
      return {
        content: true,
        tokens: true,
        dist,
        filter: edgeql.op(
          edgeql.op(edgeql.len(section.content), '>', params.minContentLength),
          'and',
          edgeql.op(dist, '<', params.matchThreshold)
        ),
        order_by: {
          expression: dist,
          empty: edgeql.EMPTY_LAST,
        },
        limit: params.matchCount,
      }
    })
  }
)

async function getContext(embedding: number[]) {
  const sections = await getSectionsQuery.run(edgedbClient, {
    target: embedding,
    matchThreshold: 0.3,
    matchCount: 8,
    minContentLength: 20,
  })

  let tokenCount = 0
  let context = ''

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const content = section?.content
    tokenCount += section?.tokens ?? 0

    if (tokenCount >= 1500) {
      tokenCount -= section?.tokens ?? 0
      break
    }

    context += `${content?.trim()}\n---\n`
  }

  return context
}

function createFullPrompt(query: string, context: string) {
  const systemMessage = `
        As an enthusiastic Next.js expert keen to assist,
        respond to questions referencing the given Next.js
        sections.

        If unable to help based on documentation, respond
        with: "Sorry, I don't know how to help with that."`

  return stripIndents`
        ${oneLineTrim`${systemMessage}`}

        Next.js sections: """
        ${context}
        """

        Question: """
        ${query}
        """`
}

async function getOpenAiAnswer(prompt: string) {
  const completion = await openai.chat.completions
    .create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.1,
      stream: true,
    })
    .asResponse()

  return completion
}
