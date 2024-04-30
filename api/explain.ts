import type { ExplainParam } from './_types'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { streamGPTResponse } from './_openai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages }: ExplainParam = await req.json()

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await streamGPTResponse(messages)

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
