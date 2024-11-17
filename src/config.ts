import { AppConfig } from '@/types/app_config'

const config = {
  baseUrl: 'https://a-ma.zip',
  randSlugSize: 5,
  guestTokenAvailDays: 7,
  ultimateTokenAvailDays: 365,
} satisfies AppConfig

export { config }
