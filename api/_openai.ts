import type { ChatCompletionMessageParam } from 'ai/prompts'
import OpenAI from 'openai'

export function initOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }
  // reads OPENAI_API_KEY by default
  return new OpenAI()
}

const openai = initOpenAI()

export async function streamGPTResponse(
  messages: ChatCompletionMessageParam[]
) {
  return openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  })
}
