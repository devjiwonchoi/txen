import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

export function formatMarkdown(text: string) {
  marked.use(markedTerminal() as any)
  return marked.parse(text)
}
