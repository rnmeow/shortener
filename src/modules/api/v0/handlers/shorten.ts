import { createFactory } from "hono/factory"
import { logger } from "hono/logger"

import { nanoid } from "nanoid/non-secure"

import { config } from "@/config"
import { createRfcHttpError } from "@/errors/http_error"

import type { JsonResp } from "@/types/http_resp"

type ReqData = {
  slug?: string
  destination: string
}

const factory = createFactory<{
  Bindings: { DB: D1Database; TURNSTILE_53CR37: string }
}>()

const isSlugTaken = (db: D1Database, slug: string) =>
  db.prepare(`SELECT slug FROM URLs WHERE slug = ?;`).bind(slug).all()

const handlers = factory.createHandlers(logger(), async (ctxt) => {
  const { hostnamesBanned, randSlugSize, baseUrl } = config(
    ctxt.env.TURNSTILE_53CR37 === "1x0000000000000000000000000000000AA",
  )

  const body = await ctxt.req.json<ReqData>()

  if (!body.destination) {
    throw createRfcHttpError(400, "Destination is required")
  }
  if (typeof body.destination !== "string") {
    throw createRfcHttpError(400, "Destination must be a string")
  }
  if (body.destination.length <= 20) {
    throw createRfcHttpError(
      400,
      "Destination is already short, just like your _____",
    )
  }

  let destUrl: URL
  try {
    destUrl = new URL(body.destination)
  } catch (_err) {
    throw createRfcHttpError(400, "Destination must be a valid URL")
  }

  if (destUrl.protocol !== "https:") {
    throw createRfcHttpError(400, "Destination must be an HTTPS site")
  }
  if (
    hostnamesBanned.has(destUrl.hostname) ||
    baseUrl.origin === destUrl.origin
  ) {
    throw createRfcHttpError(
      400,
      "Destination hostname is banned or unavailable",
    )
  }

  if (body.slug && typeof body.slug !== "string") {
    throw createRfcHttpError(400, "Slug must be a string")
  }
  if (body.slug && !/^[a-zA-Z0-9_-]{3,64}$/g.test(body.slug)) {
    throw createRfcHttpError(400, "Slug must be safe and 3–64 characters long")
  }

  const db = ctxt.env.DB

  let slug = body.slug || nanoid(randSlugSize)
  if (!body.slug) {
    while ((await isSlugTaken(db, slug)).results.length !== 0) {
      slug = nanoid(randSlugSize)
    }
  } else if (
    slug === "api" ||
    slug === "lib" ||
    (await isSlugTaken(db, slug)).results.length !== 0
  ) {
    throw createRfcHttpError(400, `Slug \`${slug}\` is already in use`)
  }

  const { success } = await db
    .prepare(`INSERT INTO URLs (slug, destination) VALUES (?, ?);`)
    .bind(slug, body.destination)
    .run()

  if (!success) {
    throw createRfcHttpError(500, "Error inserting data into the database")
  }

  return ctxt.json<
    JsonResp & {
      shortenedUrl: string
    }
  >({
    timestamp: Date.now(),
    version: 0,
    status: "200 ok",
    message: "Operation succeeded :)",

    shortenedUrl: new URL(slug, baseUrl).href,
  })
})

export { handlers }
