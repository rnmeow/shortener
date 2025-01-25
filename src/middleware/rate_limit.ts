import { createRfcHttpError } from '@/errors/http_error'

export default defineEventHandler(async (event) => {
  const { success } = await event.context.rateLimiter.limit({
    key:
      (event.node.req.headers['cf-connecting-ip'] as string) ??
      'wh3RE_ArE_yOU_fr0M',
  })

  if (!success) {
    throw createRfcHttpError(event, 429, "Isn't this many requests excessive?")
  }
})
