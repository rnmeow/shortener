/**
 * Copyright (C) 2024, Connor Kuo.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { RegExpRouter } from 'hono/router/reg-exp-router'

import type { RateLimit } from '@cloudflare/workers-types'

import { handlers as redirectHandlers } from '@/routes/[slug]'
import { handlers as revokeHandlers } from '@/routes/api/revoke'
import { handlers as shortenHandlers } from '@/routes/api/shorten'
import { handlers as webpageHandlers } from '@/routes/webpage'

import { middleware as rateLimitMiddleware } from '@/middlewares/rate_limit'

import { createRfcHttpError } from '@/errors/http_error'

const app = new Hono<{ Bindings: { RATE_LIMITER: RateLimit } }>({
  strict: false,
  router: new RegExpRouter(),
})

app.use(rateLimitMiddleware)

app
  .get('/', ...webpageHandlers)
  .get('/:slug{[a-zA-Z0-9_-]{3,64}}', ...redirectHandlers)

app
  .put('/api/shorten', ...shortenHandlers)
  .put('/api/revoke', ...revokeHandlers)

app.notFound(() => {
  throw createRfcHttpError(
    404,
    'The requested page may have been removed or renamed',
  )
})

app.onError((err, _ctxt) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  throw err
})

export default app
