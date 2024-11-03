import { createFactory } from 'hono/factory'
import { html } from 'hono/html'
import { logger } from 'hono/logger'

import { baseUrl } from '@/conf'

const factory = createFactory()

export const handlers = factory.createHandlers(logger(), (ctxt) =>
  ctxt.html(
    // prettier-ignore
    html`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />

    <title>URL Shortener</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A URL shortener, created by Connor." />
    <meta name="author" content="Connor Kuo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@guo_huan91271" />
    <meta property="og:title" content="URL Shortener" />
    <meta
      property="og:description"
      content="A URL shortener, created by Connor."
    />
    <meta property="og:url" content="${new URL(baseUrl).href}" />
    <meta property="og:site_name" content="URL Shortener" />
    <meta property="og:type" content="website" />
    <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net/" crossorigin />
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/" />

    <!-- picocss v2.0.6 -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2.0.6/css/pico.min.css"
      integrity="sha256-3V/VWRr9ge4h3MEXrYXAFNw/HxncLXt9EB6grMKSdMI="
      crossorigin="anonymous"
    />
  </head>
  <body>
    <div style="display: flex; min-height: 100vh; align-items: center;">
      <main class="container">
        <header>
          <h1>URL Shortener</h1>
        </header>

        <div x-data="{
          res: null,
          err: null,

          handleResp (req) {
            const data = JSON.parse(req.response)
            const dataType = req.getResponseHeader('Content-Type')

            this.res = dataType === 'application/json; charset=UTF-8' ? data : null
            this.err = dataType === 'application/problem+json; charset=utf-8' ? data : null
          }
        }">
          <form
            hx-put="/api/shorten"
            hx-trigger="submit"
            hx-ext="json-enc"
            hx-swap="none"
            x-on:htmx:after-request="handleResp($event.detail.xhr)"
          >
            <label for="destination">
              Long URL <span style="color: var(--pico-del-color);">*</span>
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
                  Auth Token <span style="color: var(--pico-del-color);">*</span>
                </label>
                <input
                  type="text"
                  name="auth-token"
                  x-bind:placeholder="crypto.randomUUID()"
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

            <button type="submit" class="contrast">
              Shorten!
            </button>
          </form>

          <p x-show="res">
            <span style="color: var(--pico-ins-color);">Successfully</span>
            shortened! The shortened URL is:
            <a x-bind:href="res?.shortenedUrl" x-text="res?.shortenedUrl"></a>
          </p>

          <p x-show="err">
            <span style="color: var(--pico-del-color);">HTTP Error</span>
            <span x-text="err?.code"></span>:
            <span x-text="err?.detail"></span>
          </p>
        </div>

        <footer>
          <small>&copy; 2024, Connor Kuo.</small>
        </footer>
      </main>
    </div>

    <!-- htmx v2.0.3 -->
    <script
      src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.3/dist/htmx.min.js"
      integrity="sha256-SRlVzRgQdH19e5zLk2QAr7dg4G0l1T5FcrZLZWOyeE4="
      crossorigin="anonymous"
    ></script>
    <!-- htmx ext json-enc -->
    <script
      src="https://cdn.jsdelivr.net/npm/htmx-ext-json-enc@2.0.1/json-enc.min.js"
      crossorigin="anonymous"
    ></script>
    <!-- alpinejs v3.14.3 -->
    <script
      src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"
      integrity="sha256-aJ9ROXjRHWn00zeU9ylsmlhqLlXeebtEfN28P0dPnwc="
      crossorigin="anonymous"
    ></script>
  </body>
</html>
`,
  ),
)
