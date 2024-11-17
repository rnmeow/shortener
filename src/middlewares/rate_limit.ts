import { createMiddleware } from 'hono/factory'

import { createRfcHttpError } from '@/errors/http_error'

const middleware = createMiddleware(async (ctxt, next) => {
  await next()

  const { success } = await ctxt.env.RATE_LIMITER.limit({
    key: ctxt.req.header('cf-connecting-ip') ?? 'wh3RE_ArE_yOU_fr0M',
  })

  if (!success) {
    throw createRfcHttpError(429, "Isn't this many requests excessive?")
  }
})

export { middleware }
