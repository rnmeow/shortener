import { createMiddleware } from 'hono/factory'

import { tokenAvailDays } from '@/conf'
import { createRfcHttpError } from '@/errors/http_error'
import { sha256Hash } from '@/utils/sha256_hash'

export const middleware = createMiddleware(async (ctxt, next) => {
  await next()

  const authHeader = ctxt.req.header('Authentication')

  if (!authHeader) {
    throw createRfcHttpError(401, 'Authentication header is required')
  }
  if (!/^Bearer \S+$/g.test(authHeader)) {
    throw createRfcHttpError(
      401,
      'Authentication header must start with `Bearer `',
    )
  }

  const token = authHeader.slice(7)
  const tokenParts = token.split(':')

  const then = parseInt(tokenParts[0]),
    now = Math.floor(+new Date() / 1000)
  if (then + tokenAvailDays * 86400 < now) {
    throw createRfcHttpError(401, 'Token expired')
  }

  const magicalStrHash = await sha256Hash(
    `${tokenParts[0]}_${ctxt.env.JWT_SECRET}`,
  )
  if (magicalStrHash !== tokenParts[1]) {
    throw createRfcHttpError(401, 'Token invalid')
  }
})
