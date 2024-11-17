import { createMiddleware } from 'hono/factory'

import { createRfcHttpError } from '@/errors/http_error'

const middleware = createMiddleware<{
  Bindings: { TURNSTILE_53CR37: string }
}>(async (ctxt, next) => {
  await next()

  const token = ctxt.req.header('IMPORTANT-NO-OVERWRITE-CF-Turnstile-Response')
  const ip = ctxt.req.header('CF-Connecting-IP')

  if (!token) {
    throw createRfcHttpError(400, 'Missing Turnstile token. Skipped CAPTCHA?')
  }
  if (!ip) {
    throw createRfcHttpError(400, 'Missing origin IP')
  }

  const payload = {
    secret: ctxt.env.TURNSTILE_53CR37,
    response: token,
    remoteip: ip,
  }

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  const { success } = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  }).then((resp) =>
    resp.json<{
      success: boolean
    }>(),
  )

  if (!success) {
    throw createRfcHttpError(401, 'Authentication failed')
  }
})

export { middleware }
