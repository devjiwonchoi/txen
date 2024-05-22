import type { OpenAIProvider } from '@ai-sdk/openai'
import prompts from 'prompts'
import { streamText } from 'ai'
import { getContext } from '../ai/get-context'
import { resolvePrompt } from '../ai/resolve-prompt'

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
      message: 'Ask a question',
    })
    prompt = question
  }

  const context = await getContext({
    openai,
    query: prompt,
  })

  const resolvedPrompt = resolvePrompt(prompt, context)

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    prompt: resolvedPrompt,
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
}
