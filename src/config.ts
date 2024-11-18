import { AppConfig } from '@/types/app_config'

const config = {
  baseUrl: new URL('https://a-ma.zip/'),
  randSlugSize: 5,
  hostnamesBanned: new Set(['s.shopee.tw', 'localhost', 'loopback']),
} satisfies AppConfig

export { config }
