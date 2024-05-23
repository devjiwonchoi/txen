import type { Embedding } from 'ai'
import type { Section } from 'src/types'

async function fetchSections(embedding: Embedding) {
  try {
    const response = await fetch('https://txenext.vercel.app/api/sections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embedding }),
    })
    return (await response.json()) as { sections: Section[] }
  } catch (error) {
    throw new Error('Failed to fetch sections')
  }
}

export async function getContext(embedding: Embedding) {
  const { sections } = await fetchSections(embedding)

  let tokenCount = 0
  let context = ''

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const content = section?.content
    tokenCount += section?.tokens ?? 0

    if (tokenCount >= 1500) {
      tokenCount -= section?.tokens ?? 0
      break
    }

    context += `${content?.trim()}\n---\n`
  }

  return context
}
