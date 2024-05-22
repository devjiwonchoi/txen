import type { OpenAIProvider } from '@ai-sdk/openai'
import { embed } from 'ai'
import { getSections } from './get-sections'

export async function getContext({
  openai,
  query,
}: {
  openai: OpenAIProvider
  query: string
}) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  })

  const sections = await getSections(embedding)

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
