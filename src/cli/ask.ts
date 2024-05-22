import type { OpenAIProvider } from '@ai-sdk/openai'
import prompts from 'prompts'
import { streamText } from 'ai'

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

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    prompt,
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
}
