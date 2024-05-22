import type { Embedding } from 'ai'
import type { Section } from '../types'
import 'dotenv/config'

export async function getSections(embedding: Embedding) {
  try {
    const response = await fetch(`${process.env.API_URL}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embedding }),
    })
    const data = (await response.json()) as { sections: Section[] }

    return data.sections
  } catch (error) {
    throw new Error('Failed to fetch sections:', error as Error)
  }
}
