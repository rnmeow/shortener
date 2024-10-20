import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'
import { html } from 'hono/html'

import { baseUrl } from '@/conf'

const factory = createFactory()

export const handlers = factory.createHandlers(logger(), (ctxt) =>
  ctxt.html(
    // prettier-ignore
    html`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>URL Shortner</title>
    <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
    <!-- <link rel="stylesheet" href="/static/css/style.css" /> -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A URL shortner, by Connor." />
    <meta name="author" content="Connor Kuo" />
    <meta property="og:title" content="URL Shortner" />
    <meta
        property="og:description"
        content="A URL shortner, by Connor."
      />
    <meta property="og:url" content="${new URL(baseUrl).href}" />
    <meta property="og:site_name" content="URL Shortner" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@guo_huan91271" />
  </head>
  <body></body>
</html>`,
  ),
)
