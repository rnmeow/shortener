import { createMiddleware } from "hono/factory"

import { formattedHttpError } from "@/errors/http_error"

const middleware = (expMethods: string[]) =>
  createMiddleware(async (ctxt, next) => {
    await next()

    const reqMethod = ctxt.req.method

    if (!expMethods.includes(reqMethod)) {
      throw formattedHttpError(
        405,
        `This path doesn't support a/an \`${reqMethod}\` request`,
        {
          Allow: expMethods.join(", "),
        },
      )
    }
  })

export { middleware }
