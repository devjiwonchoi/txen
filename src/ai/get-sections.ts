import type { Embedding } from 'ai'
import type { Section } from '../types'
import { API_URL } from '../constants'
import 'dotenv/config'

export async function getSections(embedding: Embedding) {
  try {
    const response = await fetch(`https://txenext.vercel.app/api/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embedding }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sections: ${response.statusText}`)
    }

    const data = (await response.json()) as { sections: Section[] }

    return data.sections
  } catch (error) {
    console.error(error)
  }
}
