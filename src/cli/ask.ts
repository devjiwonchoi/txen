import type { OpenAIProvider } from '@ai-sdk/openai'
import prompts from 'prompts'
import { streamText } from 'ai'
import { getContext } from '../ai/get-context'
import { resolvePrompt } from '../ai/resolve-prompt'
import { formatMarkdown } from 'src/utils'

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

  const context = await getContext({
    openai,
    query: prompt,
  })

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
