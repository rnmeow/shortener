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

import { Hono, type Context, type Next } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { HTTPException } from 'hono/http-exception'

import { rateLimiter } from 'hono-rate-limiter'
import { WorkersKVStore } from '@hono-rate-limiter/cloudflare'
import { KVNamespace } from 'cloudflare:worker'

import { handlers as rootHandlers } from '@/routes/root'
import { handlers as redirectHandlers } from '@/routes/[slug]'
import { handlers as shortenHandlers } from '@/routes/api/shorten'
import { handlers as revokeHandlers } from '@/routes/api/revoke'

import { genHttpException } from '@/errors/http_error'

const app = new Hono<{
  Bindings: { CACHE: KVNamespace }
}>({ router: new RegExpRouter() }).use((ctxt: Context, next: Next) =>
  rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 mins
    limit: 10,
    standardHeaders: 'draft-6',
    keyGenerator: (_ctxt) => crypto.randomUUID(),
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
  throw genHttpException(
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
