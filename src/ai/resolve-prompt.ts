import { stripIndents, oneLineTrim } from 'common-tags'

export function resolvePrompt(prompt: string, context: string) {
  const systemMessage = `
        As an enthusiastic Next.js expert keen to assist,
        respond to questions referencing the given Next.js
        sections.

        If unable to help based on documentation, respond
        with: "Sorry, I don't know how to help with that."`

  return stripIndents`
        ${oneLineTrim`${systemMessage}`}

        Next.js sections: """
        ${context}
        """

        Question: """
        ${prompt}
        """`
}
