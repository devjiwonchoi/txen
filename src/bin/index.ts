import 'dotenv/config'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

async function main() {
  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    prompt: 'Hello, world!',
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
}

main().catch(console.error)
