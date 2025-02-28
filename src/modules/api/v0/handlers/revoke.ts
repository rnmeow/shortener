import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import { createRfcHttpError } from '@/errors/http_error'

const factory = createFactory<{ Bindings: { DB: D1Database } }>()

const handlers = factory.createHandlers(logger(), async (_ctxt) => {
  throw createRfcHttpError(501, 'Work in progress 🚧')
})

export { handlers }
