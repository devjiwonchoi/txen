import prompts from 'prompts'
import { writeFile } from 'fs/promises'
import { TXEN_CONFIG_PATH } from './constants'

export async function setApiKey(apiKey?: string) {
  if (!apiKey) {
    const { k } = await prompts({
      type: 'text',
      name: 'k',
      message: 'Enter your OpenAI API key',
      validate: (k: string) =>
        k.startsWith('sk-') ? true : 'Invalid OpenAI API key',
    })

    if (typeof k !== 'string') {
      console.error('Invalid OpenAI API key')
      process.exit(1)
    }

    apiKey = k
  }

  await writeFile(TXEN_CONFIG_PATH, apiKey, 'utf-8')
  return apiKey
}
