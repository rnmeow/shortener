import { cache } from "hono/cache"
import { createFactory } from "hono/factory"
import { logger } from "hono/logger"

import { formattedHttpError } from "@/errors/http_error"

const factory = createFactory<{ Bindings: { DB: D1Database } }>()

const handlers = factory.createHandlers(
  logger(),
  cache({
    cacheName: "_shortened_url",
    cacheControl: "max-age=3600", // 1 hour
  }),
  async (ctxt) => {
    const db = ctxt.env.DB

    // should've been checked in routes.ts with regexp
    const { slug } = ctxt.req.param() as { slug: string }

    let res
    try {
      res = await db
        .prepare(`SELECT destination FROM URLs WHERE slug = ?;`)
        .bind(slug)
        .first()
    } catch (_err) {
      throw formattedHttpError(500, "Error reading data from the database")
    }

    if (res === null) {
      throw formattedHttpError(
        404,
        "The requested page may have been removed or renamed",
      )
    }

    const destination = new URL(res.destination as string)

    destination.searchParams.set("utm_source", "a_má_zipped")
    destination.searchParams.set("utm_medium", "url_shortener")

    return ctxt.body(null, {
      status: 301,
      headers: new Headers({
        Location: destination.href,
      }),
    })
  },
)

export { handlers }
