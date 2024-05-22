import prompts from 'prompts'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { createOpenAI } from '@ai-sdk/openai'
import { TXEN_CONFIG_PATH } from './constants'

export async function initOpenAI(apiKey?: string) {
  if (!apiKey) {
    apiKey = await getApiKey()
  }

  return createOpenAI({ apiKey })
}

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
