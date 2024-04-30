import type { ChatCompletionMessageParam } from 'ai/prompts'
import OpenAI from 'openai'

// process.env.OPENAI_API_KEY by default
const openai = new OpenAI()

export async function streamGPTResponse(
  messages: ChatCompletionMessageParam[]
) {
  return openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  })
}
