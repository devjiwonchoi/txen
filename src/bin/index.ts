#!/usr/bin/env node
import arg from 'arg'

const args = arg({
  // Types
  '--help': Boolean,
  '--version': Boolean,
  '--verbose': arg.COUNT, // Counts the number of times --verbose is passed
  '--port': Number, // --port <number> or --port=<number>
  '--name': String, // --name <string> or --name=<string>
  '--tag': [String], // --tag <string> or --tag=<string>

  // Aliases
  '-v': '--verbose',
  '-n': '--name', // -n <string>; result is stored in --name
  '--label': '--name', // --label <string> or --label=<string>;
  //     result is stored in --name
})