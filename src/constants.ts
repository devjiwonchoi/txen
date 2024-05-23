import { join } from 'path'

export const TXEN_CONFIG_PATH = join(import.meta.dirname, '.txen')
export const BASE_URL = `https://${
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? 'txenext.vercel.app'
}`