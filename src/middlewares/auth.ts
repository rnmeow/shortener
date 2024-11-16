import { createMiddleware } from 'hono/factory'

import { tokenAvailDays } from '@/conf'
import { createRfcHttpError } from '@/errors/http_error'

async function sha256Hash(str: string): Promise<string> {
  const utf8Str = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8Str)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('')

  return hashHex
}

export const middleware = createMiddleware<{ Bindings: { _53CR37: string } }>(
  async (ctxt, next) => {
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
      `${tokenParts[0]}_${ctxt.env._53CR37}`,
    )
    if (magicalStrHash !== tokenParts[1]) {
      throw createRfcHttpError(401, 'Token invalid')
    }
  },
)
