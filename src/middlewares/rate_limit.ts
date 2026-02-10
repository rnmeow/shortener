import { createMiddleware } from "hono/factory"

import { formattedHttpError } from "@/errors/http_error"

const middleware = createMiddleware(async (ctxt, next) => {
  const { success } = await ctxt.env.RATE_LIMITER.limit({
    key: ctxt.req.header("cf-connecting-ip") ?? "wh3RE_ArE_yOU_fr0M",
  })

  if (!success) {
    throw formattedHttpError(429, "Isn't this many requests excessive?")
  }

  await next()
})

export { middleware }
