import type { OpenAIProvider } from '@ai-sdk/openai'
import prompts from 'prompts'
import { streamText, embed } from 'ai'
import { getContext } from '../ai/get-context'
import { resolvePrompt } from '../ai/resolve-prompt'
import { formatMarkdown } from '../utils'

export async function ask({
  openai,
  prompt,
}: {
  openai: OpenAIProvider
  prompt: string
}) {
  if (!prompt) {
    const { question } = await prompts({
      type: 'text',
      name: 'question',
      message: 'Ask anything about Next.js',
    })
    prompt = question
  }

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: prompt,
  })

  const context = await getContext(embedding)
  const resolvedPrompt = resolvePrompt(prompt, context)

  const result = await streamText({
    model: openai('gpt-4o'),
    prompt: resolvedPrompt,
  })

  let fullText = ''

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
    fullText += chunk
  }

  // Clear the screen
  process.stdout.write('\x1b[2J')
  process.stdout.write('\x1b[H')

  const formattedFullText = await formatMarkdown(fullText)
  process.stdout.write(formattedFullText)
}
