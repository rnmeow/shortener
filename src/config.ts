import { AppConfig } from '@/types/app_config'

const config = {
  baseUrl: 'https://a-ma.zip',
  randSlugSize: 5,
  tokenAvailDays: 365,
} satisfies AppConfig

export { config }
