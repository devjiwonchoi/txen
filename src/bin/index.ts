#!/usr/bin/env node
import { Command } from 'commander'
import { description, name, version } from 'package.json'
import { initOpenAI } from '@/init-openai'
import { ask } from '@/cli/ask'
import 'dotenv/config'
import { setApiKey } from '@/set-api-key'

const program = new Command()

program.name(name).version(version).description(description)

program
  .command('ask')
  .description('Ask a question')
  .argument('[question]')
  .action(async (prompt: string) => {
    const openai = await initOpenAI(process.env.OPENAI_API_KEY)
    await ask({
      openai,
      prompt,
    })
  })

program
  .command('config')
  .description('Modify OpenAI API key')
  .argument('[apiKey]')
  .action(async (apiKey?: string) => {
    await setApiKey(apiKey)
  })

program.parse()
