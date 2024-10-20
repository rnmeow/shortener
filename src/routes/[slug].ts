import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import { genHttpException } from '@/errors/http_error'

const factory = createFactory<{
  Bindings: { VERIFICARTION_TOKEN: string; DB: D1Database }
}>()

export const handlers = factory.createHandlers(logger(), async (ctxt) => {
  const db = ctxt.env.DB

  // should've been checked in route with regexp
  const { slug } = ctxt.req.param()

  const { success: sqlReadSuccess, results } = await db
    .prepare(`SELECT destination FROM URLs WHERE slug = ?;`)
    .bind(slug)
    .all()

  if (!sqlReadSuccess || results.length > 1) {
    throw genHttpException(
      500,
      'There was a problem reading data from the SQL database',
    )
  }

  return ctxt.body(null, {
    status: 301,
    headers: {
      'Location': results[0].destination as string,
      'Cache-Control': 'max-age=3600',
    },
  })
})
