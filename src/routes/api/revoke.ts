import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import { genHttpException } from '@/errors/http_error'

const factory = createFactory<{
  Bindings: { VERIFICARTION_TOKEN: string; DB: D1Database }
}>()

export const handlers = factory.createHandlers(logger(), async (_ctxt) => {
  throw genHttpException(501, 'Work in progress 🚧')
})
