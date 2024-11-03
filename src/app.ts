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

import { Hono, type Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { RegExpRouter } from 'hono/router/reg-exp-router'

import { WorkersKVStore } from '@hono-rate-limiter/cloudflare'
import { rateLimiter } from 'hono-rate-limiter'

import { handlers as redirectHandlers } from '@/routes/[slug]'
import { handlers as revokeHandlers } from '@/routes/api/revoke'
import { handlers as shortenHandlers } from '@/routes/api/shorten'
import { handlers as rootHandlers } from '@/routes/root'

import { stanHttpException } from '@/errors/http_error'

const app = new Hono<{ Bindings: { CACHE: KVNamespace } }>({
  router: new RegExpRouter(),
})

app.use((ctxt: Context, next) =>
  rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 mins
    limit: 30,
    standardHeaders: 'draft-6',
    keyGenerator: (ctxt) =>
      ctxt.req.header('cf-connecting-ip') ?? 'UNAUTHORIZED',
    store: new WorkersKVStore({ namespace: ctxt.env.CACHE }),
  })(ctxt, next),
)

app
  .get('/', ...rootHandlers)
  .get('/:slug{[a-zA-Z0-9_-]{3,64}}', ...redirectHandlers)

app
  .put('/api/shorten', ...shortenHandlers)
  .put('/api/revoke', ...revokeHandlers)

app.notFound(() => {
  throw stanHttpException(
    404,
    'The page you requested for might have been removed or renamed',
  )
})

app.onError((err, _ctxt) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  throw err
})

export default app
