#!/usr/bin/env node
import prompts from 'prompts'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Command } from 'commander'
import { ask } from '../cli/ask'
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

program.parse()
