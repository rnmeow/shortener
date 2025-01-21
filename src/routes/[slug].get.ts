import { eq } from 'drizzle-orm'

import { urlsTable } from '@/db/schema/urls'
import { createRfcHttpError } from '@/errors/http_error'

export default defineEventHandler(
  async (event) => {
    // should've been checked in routes.ts with regexp
    const slug = getRouterParam(event, 'slug')!

    const res = (
      await event.context.db
        .select({ destination: urlsTable.destination })
        .from(urlsTable)
        .where(eq(urlsTable.slug, slug))
    ).at(0)

    console.log(res)

    if (!res) {
      throw createRfcHttpError(
        event,
        500,
        'Error reading data from the database',
      )
    }

    if (res.destination.length === 0) {
      throw createRfcHttpError(
        event,
        404,
        'The requested page may have been removed or renamed',
      )
    }

    return sendRedirect(event, res.destination, 301)
  },
  // { name: '_shortened_url', maxAge: 172800 /* 48 hours */ },
)
