import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import { createRfcHttpError } from '@/errors/http_error'

const factory = createFactory<{
  Bindings: { VERIFICARTION_TOKEN: string; DB: D1Database }
}>()

export const handlers = factory.createHandlers(logger(), async (ctxt) => {
  const db = ctxt.env.DB

  // should've been checked in route with regexp
  const { slug } = ctxt.req.param()

  const { success, results } = await db
    .prepare(`SELECT destination FROM URLs WHERE slug = ?;`)
    .bind(slug)
    .all()

  if (!success || results.length > 1) {
    throw createRfcHttpError(500, 'Error reading data from the database')
  }
  if (results.length === 0) {
    throw createRfcHttpError(
      404,
      'The requested page may have been removed or renamed',
    )
  }

  return ctxt.body(null, {
    status: 301,
    headers: new Headers({
      'Location': results[0].destination as string,
      'Cache-Control': 'max-age=3600',
    }),
  })
})
