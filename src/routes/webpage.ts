import { createFactory } from 'hono/factory'
import { html } from 'hono/html'
import { logger } from 'hono/logger'

import { middleware as methodRestrMiddleware } from '@/middlewares/method_restrict'

import { baseUrl } from '@/conf'

const factory = createFactory()

export const handlers = factory.createHandlers(
  logger(),
  methodRestrMiddleware(['GET']),
  (ctxt) =>
    ctxt.html(
      // prettier-ignore
      html`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>A-ma.zip URL Shortener</title>

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A URL shortener, created by Connor." />
    <meta name="author" content="Connor Kuo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@guo_huan91271" />
    <meta property="og:title" content="A-ma.zip URL Shortener" />
    <meta
      property="og:description"
      content="A URL shortener, created by Connor."
    />
    <meta property="og:url" content="${new URL(baseUrl).href}" />
    <meta property="og:site_name" content="A-ma.zip URL Shortener" />
    <meta property="og:type" content="website" />
    <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/lib/pico-2.0.6.min.css" />
  </head>
  <body>
    <div style="display: flex; min-height: 100vh; align-items: center">
      <main class="container" x-data="shortenerData">
        <header>
          <h1 style="text-transform: uppercase">A-ma.zip URL Shortener</h1>
        </header>

        <form @submit="onSubmit">
          <label for="destination">
            Long URL <span style="color: var(--pico-del-color)">*</span>
          </label>
          <input
            type="url"
            name="destination"
            placeholder="https://example.com/~4n/3x7reMe1Y-LOng/uRl?eV3N=w1TH&P4RamS"
            required
          />

          <div class="grid">
            <div>
              <label for="auth-token">
                Auth Token <span style="color: var(--pico-del-color)">*</span>
              </label>
              <input
                type="text"
                name="auth-token"
                placeholder="%unixTimeNow%:SHA256(%unixTimeNow%_%secret%)"
                required
              />
            </div>
            <div>
              <label for="slug">Slug</label>
              <input
                type="text"
                name="slug"
                placeholder="[a-zA-Z0-9_-]{3,64}"
              />
            </div>
          </div>

          <button type="submit" class="contrast">Shorten!</button>
        </form>

        <p x-show="res">
          <span style="color: var(--pico-ins-color)">Successfully</span>
          shortened! The shortened URL is:
          <a x-bind:href="res?.shortenedUrl" x-text="res?.shortenedUrl"></a>
        </p>

        <p x-show="err">
          <span style="color: var(--pico-del-color)">HTTP Error</span>
          <span x-text="err?.code"></span>:
          <span x-text="err?.detail"></span>
        </p>

        <p x-show="fat">
          <span style="color: var(--pico-del-color)">FATAL</span>:
          <span x-text="fat"></span>
        </p>

        <footer>&copy; 2024, Connor Kuo.</footer>
      </main>
    </div>

    <script src="/lib/alpinejs-3.14.3.min.js" defer></script>
    <script>
      const shortenerData = {
        res: null,
        err: null,
        fat: null,

        onSubmit(event) {
          event.preventDefault()

          const form = event.target
          const formData = new FormData(form)

          const payload = {
            destination: formData.get('destination'),
            slug: formData.get('slug'),
          }

          fetch('/api/shorten', {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: new Headers({
              'Content-Type': 'application/json',
              'Authentication': 'Bearer ' + formData.get('auth-token'),
            }),
          })
            .then(async (resp) => {
              const data = await resp.json()
              const dataType = resp.headers.get('Content-Type')

              if (dataType && dataType.includes('application/json')) {
                this.res = data
                this.err = null
                this.fat = null
              } else if (
                dataType &&
                dataType.includes('application/problem+json')
              ) {
                this.res = null
                this.err = data
                this.fat = null
              }
            })
            .catch((err) => {
              this.res = null
              this.err = null
              this.fat = err
            })
        },
      }
    </script>
  </body>
</html>
`,
    ),
)
