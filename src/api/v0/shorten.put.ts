import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid/non-secure'

import { config } from '@/config'
import { urlsTable } from '@/db/schema/urls'
import { createRfcHttpError } from '@/errors/http_error'

import type { JsonResp } from '@/types/http_resp'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

type ReqData = {
  slug?: string
  destination: string
}

const isSlugTaken = async (
  db: DrizzleD1Database<typeof import('@/db/schema/urls')>,
  slug: string,
) =>
  (
    await db
      .select({ slug: urlsTable.slug })
      .from(urlsTable)
      .where(eq(urlsTable.slug, slug))
  ).length > 0

const { hostnamesBanned, randSlugSize, baseUrl } = config

export default defineCachedEventHandler(async (event) => {
  const body: ReqData = await readBody(event)

  if (!body.destination) {
    throw createRfcHttpError(event, 400, 'Destination is required')
  }
  if (typeof body.destination !== 'string') {
    throw createRfcHttpError(event, 400, 'Destination must be a string')
  }
  if (body.destination.length <= 20) {
    throw createRfcHttpError(
      event,
      400,
      'Destination is already short, just like your _____',
    )
  }

  let destUrl: URL
  try {
    destUrl = new URL(body.destination)
  } catch (_err) {
    throw createRfcHttpError(event, 400, 'Destination must be a valid URL')
  }

  if (destUrl.protocol !== 'https:') {
    throw createRfcHttpError(event, 400, 'Destination must be an HTTPS site')
  }
  if (
    hostnamesBanned.has(destUrl.hostname) ||
    baseUrl.origin === destUrl.origin
  ) {
    throw createRfcHttpError(
      event,
      400,
      'Destination hostname is banned or unavailable',
    )
  }

  if (body.slug && typeof body.slug !== 'string') {
    throw createRfcHttpError(event, 400, 'Slug must be a string')
  }
  if (body.slug && !/^[a-zA-Z0-9_-]{3,64}$/g.test(body.slug)) {
    throw createRfcHttpError(
      event,
      400,
      'Slug must be safe and 3–64 characters long',
    )
  }

  let slug = body.slug || nanoid(randSlugSize)
  if (!body.slug) {
    while (await isSlugTaken(event.context.db, slug)) {
      slug = nanoid(randSlugSize)
    }
  } else if (
    slug === 'api' ||
    slug === 'lib' ||
    (await isSlugTaken(event.context.db, slug))
  ) {
    throw createRfcHttpError(event, 400, `Slug \`${slug}\` is already in use`)
  }

  const res = await event.context.db
    .insert(urlsTable)
    .values({ slug, destination: body.destination })

  if (!res) {
    throw createRfcHttpError(
      event,
      500,
      'Error inserting data into the database',
    )
  }

  return <
    JsonResp & {
      shortenedUrl: string
    }
  >{
    timestamp: Date.now(),
    version: 0,
    status: '200 ok',
    message: 'Operation succeeded :)',

    shortenedUrl: new URL(slug, baseUrl).href,
  }
})
