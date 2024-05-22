import { join } from 'path'

export const TXEN_CONFIG_PATH = join(process.cwd(), '.txen')
export const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://txenext.vercel.app/api'
    : 'http://localhost:3000/api'