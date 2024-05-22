#!/usr/bin/env node
import prompts from 'prompts'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { Command } from 'commander'
import { description, name, version } from '../../package.json'
import 'dotenv/config'

const program = new Command()
const dirname = import.meta.dirname
const configPath = join(dirname, 'txen.json')
let prompt = ''

program.name(name).version(version).description(description)

program
  .command('ask')
  .description('Ask a question')
  .argument('[question]')
  .action(async (question, options) => {
    if (!question) {
      const { q } = await prompts({
        type: 'text',
        name: 'q',
        message: 'Ask a question',
      })
      question = q
    }
    prompt = question
  })

program
  .command('config')
  .description('Configure the CLI')
  .action(async () => {
    const config = await getConfig()
    await setConfig(config)
    process.exit(0)
  })

program.parse()

async function askForApiKey() {
  const { apiKey } = await prompts({
    type: 'text',
    name: 'apiKey',
    message: 'Provide your OpenAI API key',
    validate: (value) =>
      typeof value === 'string' && value.startsWith('sk-')
        ? true
        : 'Please provide a valid OpenAI API key',
  })
  return apiKey
}

async function getConfig() {
  if (!existsSync(configPath)) {
    await writeFile(configPath, JSON.stringify({}), 'utf-8')
  }

  const config = JSON.parse(await readFile(configPath, 'utf-8'))

  if (!config.apiKey) {
    const apiKey = await askForApiKey()
    config.apiKey = apiKey
    await setConfig(config)
  }

  return config
}

async function setConfig(config: any) {
  await writeFile(configPath, JSON.stringify(config), 'utf-8')
}

async function initAI() {
  const { apiKey } = await getConfig()
  const openai = createOpenAI({ apiKey })
  return openai
}

async function main() {
  const openai = await initAI()
  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    prompt,
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
}

main().catch(console.error)
