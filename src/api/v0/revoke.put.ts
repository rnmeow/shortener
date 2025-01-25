import { createRfcHttpError } from '@/errors/http_error'

export default defineEventHandler((event) => {
  throw createRfcHttpError(event, 501, 'Work in progress 🚧')
})
