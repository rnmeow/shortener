import { createMiddleware } from 'hono/factory'

import { createRfcHttpError } from '@/errors/http_error'

export const middleware = (expMethods: string[]) =>
  createMiddleware(async (ctxt, next) => {
    await next()

    const reqMethod = ctxt.req.method

    if (!expMethods.includes(reqMethod)) {
      throw createRfcHttpError(
        405,
        `This path doesn\'t support a/an \`${reqMethod}\` request`,
        {
          Allow: expMethods.join(', '),
        },
      )
    }
  })
