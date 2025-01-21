import { createRfcHttpError } from '@/errors/http_error'

export default defineEventHandler(async (event) => {
  if (!event.path.includes('/api')) {
    return
  }

  const token: string = (await readBody(event))[
    'IMPORTANT-NO-OVERWRITE-CF-Turnstile-Response'
  ]
  const ip = getRequestIP(event) ?? event.node.req.headers['CF-Connecting-IP']

  if (!token) {
    throw createRfcHttpError(
      event,
      400,
      'Missing Turnstile token. Skipped CAPTCHA?',
    )
  }
  if (
    !ip &&
    event.context.cloudflare.env.TURNSTILE_53CR37 !==
      '1x0000000000000000000000000000000AA'
  ) {
    throw createRfcHttpError(event, 400, 'Missing origin IP')
  }

  const payload = {
    secret: event.context.cloudflare.env.TURNSTILE_53CR37,
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
    throw createRfcHttpError(event, 401, 'Authentication failed')
  }
})
