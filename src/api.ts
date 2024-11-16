import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'

import { handlers as revokeHandlers } from '@/routes/api/revoke'
import { handlers as shortenHandlers } from '@/routes/api/shorten'

import { middleware as authMiddleware } from '@/middlewares/auth'
import { middleware as methodRestrMiddleware } from '@/middlewares/method_restrict'

const api = new Hono({
  strict: false,
  router: new RegExpRouter(),
})

api.use(authMiddleware).use(methodRestrMiddleware(['PUT']))

api.all('/shorten', ...shortenHandlers).all('/revoke', ...revokeHandlers)

export { api }
