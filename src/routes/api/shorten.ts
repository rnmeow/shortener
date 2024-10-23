import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'
import { nanoid } from 'nanoid/non-secure'

import { baseUrl, randSlugSize } from '@/conf'
import { genHttpException } from '@/errors/http_error'

import type { JsonResp } from '@/http_resp.d'

type Request = {
  slug?: string
  destination: string
}

const factory = createFactory<{
  Bindings: { VERIFICARTION_TOKEN: string; DB: D1Database }
}>()

const isSlugTaken = (db: D1Database, slug: string) =>
  db.prepare(`SELECT slug FROM URLs WHERE slug = ?;`).bind(slug).all()

export const handlers = factory.createHandlers(logger(), async (ctxt) => {
  const body = (await ctxt.req.json()) satisfies Request

  // check POST inputs

  if (body.slug && typeof body.slug !== 'string') {
    throw genHttpException(400, 'The provided `slug` should be a string')
  } else if (body.slug && !/^[a-zA-Z0-9_-]{3,64}$/g.test(body.slug)) {
    throw genHttpException(
      400,
      'The provided `slug` should be safe and between 3 to 64 digits',
    )
  } else if (!body.destination) {
    throw genHttpException(
      400,
      'It is required to provide the `destination` field',
    )
  } else if (typeof body.destination !== 'string') {
    throw genHttpException(400, 'The provided `destination` should be a string')
  } else if (
    !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9-()]{1,63}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)$/g.test(
      body.destination,
    )
  ) {
    throw genHttpException(
      400,
      'The provided `destination` should be a valid URL',
    )
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
    throw genHttpException(400, 'The provided `slug` is already taken')
  }

  const { success: sqlInsertSuccess } = await db
    .prepare(`INSERT INTO URLs (slug, destination) VALUES (?, ?);`)
    .bind(slug, body.destination)
    .run()

  if (!sqlInsertSuccess) {
    throw genHttpException(
      500,
      'There was a problem inserting data to the SQL database',
    )
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
