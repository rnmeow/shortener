import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { HTTPException } from 'hono/http-exception'

import { handlers as webpageHandlers } from '@/routes/webpage'
import { handlers as redirectHandlers } from '@/routes/[slug]'
import { handlers as shortenHandlers } from '@/routes/api/shorten'
import { handlers as revokeHandlers } from '@/routes/api/revoke'

import { genHttpException } from '@/errors/http_error'

const app = new Hono({ router: new RegExpRouter() }).use(trimTrailingSlash())

app.get('/', ...webpageHandlers)
app.get('/:slug{[a-zA-Z0-9_-]{3,64}}/', ...redirectHandlers)

app.put('/api/shorten', ...shortenHandlers)
app.put('/api/revoke', ...revokeHandlers)

app.notFound(() => {
  throw genHttpException(
    404,
    'The page you requested for might have been removed or renamed',
  )
})

app.onError((err, _ctxt) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  throw err
})

export default app
