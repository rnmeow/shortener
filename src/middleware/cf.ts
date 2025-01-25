import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'

import * as schema from '@/db/schema/urls'
import type { RateLimit } from '@cloudflare/workers-types'

declare module 'h3' {
  interface H3EventContext {
    db: DrizzleD1Database<typeof schema>
    rateLimiter: RateLimit
  }
}

let cloudflare: any

export default defineEventHandler(async ({ context }) => {
  cloudflare = context.cloudflare || cloudflare

  const { DB, RATE_LIMITER } = (context.cloudflare || cloudflare).env
  context.db = drizzle(DB as D1Database, { schema: { ...schema } })
  context.rateLimiter = RATE_LIMITER as RateLimit
})
