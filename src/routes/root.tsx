import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import Layout from '@/_layout'

const factory = createFactory()

export const handlers = factory.createHandlers(logger(), (ctxt) =>
  ctxt.html(
    <Layout>
      <main class="container" hx-ext="response-targets, client-side-templates">
        <header>
          <h1>URL Shortener</h1>
        </header>
        <form
          hx-put="/api/shorten"
          hx-ext="json-enc"
          hx-trigger="submit"
          hx-target=".res"
          hx-target-400=".res-400"
          mustache-template="templ"
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
                placeholder={crypto.randomUUID()}
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

        <template id="templ">
          {'{{ #shortenedUrl }}'}
          <span style="color: var(--pico-ins-color);">Successfully</span>{' '}
          shortened! The shortened URL is:{' '}
          <a href="{{ shortenedUrl }}">{'{{ shortenedUrl }}'}</a>.
          {'{{ /shortenedUrl }} {{ #code }}'}
          <span style="color: var(--pico-del-color);">HTTP Error</span>{' '}
          {'{{ code }}'}: {'{{ detail }}'}
          {'{{ /code }}'}
        </template>

        <p class="res res-400" />

        <footer>
          <small>&copy; 2024, Connor Kuo.</small>
        </footer>
      </main>
    </Layout>,
  ),
)
