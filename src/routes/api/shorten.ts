import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import { nanoid } from 'nanoid/non-secure'

import { baseUrl, randSlugSize } from '@/conf'
import { createRfcHttpError } from '@/errors/http_error'

import type { JsonResp } from '@/http_resp.d'

type ReqData = {
  slug?: string
  destination: string
}

const factory = createFactory<{ Bindings: { DB: D1Database } }>()

const isSlugTaken = (db: D1Database, slug: string) =>
  db.prepare(`SELECT slug FROM URLs WHERE slug = ?;`).bind(slug).all()

export const handlers = factory.createHandlers(logger(), async (ctxt) => {
  const body = await (ctxt.req.json() satisfies Promise<ReqData>)

  if (!body.destination) {
    throw createRfcHttpError(400, 'Destination is required')
  }
  if (typeof body.destination !== 'string') {
    throw createRfcHttpError(400, 'Destination must be a string')
  }
  if (
    !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9-()]{1,63}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)$/g.test(
      body.destination,
    )
  ) {
    throw createRfcHttpError(400, 'Destination must be a valid URL')
  }

  if (body.slug && typeof body.slug !== 'string') {
    throw createRfcHttpError(400, 'Slug must be a string')
  }
  if (body.slug && !/^[a-zA-Z0-9_-]{3,64}$/g.test(body.slug)) {
    throw createRfcHttpError(400, 'Slug must be safe and 3–64 characters long')
  }

  const db = ctxt.env.DB

  let slug = body.slug || nanoid(randSlugSize)
  if (!body.slug) {
    while ((await isSlugTaken(db, slug)).results.length !== 0) {
      slug = nanoid(randSlugSize)
    }
  } else if (
    slug === 'api' ||
    (await isSlugTaken(db, slug)).results.length !== 0
  ) {
    throw createRfcHttpError(400, `Slug \`${slug}\` is already in use`)
  }

  const { success } = await db
    .prepare(`INSERT INTO URLs (slug, destination) VALUES (?, ?);`)
    .bind(slug, body.destination)
    .run()

  if (!success) {
    throw createRfcHttpError(500, 'Error inserting data into the database')
  }

  return ctxt.json<
    JsonResp & {
      shortenedUrl: string
    }
  >({
    timestamp: Date.now(),
    version: 0,
    status: '200 ok',
    message: 'Operation succeeded :)',

    shortenedUrl: new URL(slug, baseUrl).href,
  })
})
