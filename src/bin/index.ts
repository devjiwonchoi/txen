#!/usr/bin/env node
import { Command } from 'commander'
import { description, name, version } from 'package.json'
import { initOpenAI, setApiKey } from '@/ai'
import { ask } from '@/cli/ask'
import 'dotenv/config'

const program = new Command()

program.name(name).version(version).description(description)

program
  .command('ask')
  .description('ask any question about nextjs')
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
  .description('modify openai api key')
  .argument('[apiKey]')
  .action(async (apiKey?: string) => {
    await setApiKey(apiKey)
  })

program.parse()
