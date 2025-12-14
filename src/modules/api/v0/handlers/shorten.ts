import { createFactory } from "hono/factory"
import { logger } from "hono/logger"

import { nanoid } from "nanoid/non-secure"

import { config } from "@/config"
import { formattedHttpError } from "@/errors/http_error"

import type { JsonResp } from "@/types/http_resp"

type ReqData = {
  slug?: string
  destination: string
}

const factory = createFactory<{
  Bindings: { DB: D1Database; TURNSTILE_53CR37: string }
}>()

const handlers = factory.createHandlers(logger(), async (ctxt) => {
  const { hostnamesBanned, randSlugSize, baseUrl } = config(
    ctxt.env.TURNSTILE_53CR37 === "1x0000000000000000000000000000000AA",
  )

  const body = await ctxt.req.json<ReqData>()

  if (!body.destination) {
    throw formattedHttpError(400, "Destination is required")
  }
  if (typeof body.destination !== "string") {
    throw formattedHttpError(400, "Destination must be a string")
  }
  if (body.destination.length <= 20) {
    throw formattedHttpError(
      400,
      "Destination is already short, just like your _____",
    )
  }

  let destUrl: URL
  try {
    destUrl = new URL(body.destination)
  } catch (_err) {
    throw formattedHttpError(400, "Destination must be a valid URL")
  }

  if (destUrl.protocol !== "https:") {
    throw formattedHttpError(400, "Destination must be an HTTPS site")
  }
  if (
    hostnamesBanned.has(destUrl.hostname) ||
    baseUrl.origin === destUrl.origin
  ) {
    throw formattedHttpError(
      400,
      "Destination hostname is banned or unavailable",
    )
  }

  if (body.slug && typeof body.slug !== "string") {
    throw formattedHttpError(400, "Slug must be a string")
  }
  if (body.slug && !/^[a-zA-Z0-9_-]{3,16}$/.test(body.slug)) {
    throw formattedHttpError(400, "Slug must be safe and 3–16 characters long")
  }

  const db = ctxt.env.DB

  if (body.slug === "api" || body.slug === "lib") {
    throw formattedHttpError(400, `Slug \`${body.slug}\` is not available`)
  }

  let slug = body.slug || nanoid(randSlugSize)
  const hasProvidedSlug: boolean = body.slug !== undefined

  for (;;) {
    try {
      const { success } = await db
        .prepare(`INSERT INTO URLs (slug, destination) VALUES (?, ?);`)
        .bind(slug, body.destination)
        .run()

      if (success) break
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message + (err.cause instanceof Error ? err.cause.message : "")
          : ""

      if (msg.includes("UNIQUE constraint failed")) {
        if (!hasProvidedSlug) {
          slug = nanoid(randSlugSize)

          continue
        }

        throw formattedHttpError(409, `Slug \`${slug}\` is already in use`)
      }

      throw formattedHttpError(500, "Error inserting data into the database")
    }
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
