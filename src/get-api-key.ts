import prompts from 'prompts'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const txenConfigPath = join(process.cwd(), '.txen')

export async function getApiKey() {
  if (!existsSync(txenConfigPath)) {
    console.warn('OpenAI API key not found')

    const { apiKey } = await prompts({
      type: 'text',
      name: 'apiKey',
      message: 'Enter your OpenAI API key',
      validate: (apiKey: string) =>
        apiKey.startsWith('sk-') ? true : 'Invalid OpenAI API key',
    })

    if (typeof apiKey !== 'string') {
      console.error('Invalid OpenAI API key')
      process.exit(1)
    }

    await writeFile(txenConfigPath, apiKey, 'utf-8')
    return apiKey
  }

  const apiKey = await readFile(txenConfigPath, 'utf-8')
  if (!apiKey.startsWith('sk-')) {
    console.error('Invalid OpenAI API key')
    process.exit(1)
  }

  return apiKey
}
