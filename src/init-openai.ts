import { createOpenAI } from '@ai-sdk/openai'
import { getApiKey } from './get-api-key'

export async function initOpenAI(apiKey?: string) {
  if (!apiKey) {
    apiKey = await getApiKey()
  }

  return createOpenAI({ apiKey })
}
