import { cache } from "hono/cache"
import { createFactory } from "hono/factory"
import { logger } from "hono/logger"

import { formattedHttpError } from "@/errors/http_error"

const factory = createFactory<{ Bindings: { DB: D1Database } }>()

const handlers = factory.createHandlers(
  logger(),
  cache({
    cacheName: "_shortened_url",
    cacheControl: "max-age=172800", // 48 hours
  }),
  async (ctxt) => {
    const db = ctxt.env.DB

    // should've been checked in routes.ts with regexp
    const { slug } = ctxt.req.param()

    const { success, results } = await db
      .prepare(`SELECT destination FROM URLs WHERE slug = ?;`)
      .bind(slug)
      .all()

    if (!success || results.length > 1) {
      throw formattedHttpError(500, "Error reading data from the database")
    }
    if (results.length === 0) {
      throw formattedHttpError(
        404,
        "The requested page may have been removed or renamed",
      )
    }

    return ctxt.body(null, {
      status: 301,
      headers: new Headers({
        "Location": results[0].destination as string,
        "Cache-Control": "max-age=3600",
      }),
    })
  },
)

export { handlers }
