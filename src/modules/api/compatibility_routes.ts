import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'

import { middleware as authMiddleware } from '@/middlewares/auth'

import { routes as v0Routes } from './v0/routes'

const routes = new Hono({ router: new RegExpRouter() })

routes
  .use(authMiddleware)

  .route('/v0', v0Routes)

export { routes }
