#!/usr/bin/env node
import prompts from 'prompts'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { Command } from 'commander'
import { description, name, version } from '../../package.json'
import 'dotenv/config'

const program = new Command()

program.name(name).version(version).description(description)

program
  .command('ask')
  .description('Ask a question')
  .argument('[question]')
  .action(async (question) => {
    await ask(question)
  })

async function ask(prompt: string) {
  if (!prompt) {
    const { question } = await prompts({
      type: 'text',
      name: 'question',
      message: 'Ask a question',
    })
    prompt = question
  }

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    prompt,
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
}

program.parse()
