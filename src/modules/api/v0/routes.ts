import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'

import { middleware as authMiddleware } from '@/middlewares/auth'
import { middleware as methodRestrMiddleware } from '@/middlewares/method_restrict'

import { handlers as shortenHandlers } from './handlers/shorten'

const routes = new Hono({ router: new RegExpRouter() })

routes
  .use(methodRestrMiddleware(['PUT']))
  .use(authMiddleware)

  .all('/shorten', ...shortenHandlers)

export { routes }
