import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { TXEN_CONFIG_PATH } from './constants'
import { setApiKey } from './set-api-key'

export async function getApiKey() {
  if (!existsSync(TXEN_CONFIG_PATH)) {
    console.warn('OpenAI API key not found')

    const apiKey = await setApiKey()
    return apiKey
  }

  const apiKey = await readFile(TXEN_CONFIG_PATH, 'utf-8')
  if (!apiKey.startsWith('sk-')) {
    console.error('Invalid OpenAI API key')
    process.exit(1)
  }

  return apiKey
}
