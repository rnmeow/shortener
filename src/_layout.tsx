import { html } from 'hono/html'
import type { PropsWithChildren } from 'hono/jsx'

import { baseUrl } from '@/conf'

const Layout = (props: PropsWithChildren) =>
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

    <!-- picocss v2.0.6 -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/picocss/2.0.6/pico.min.css"
      integrity="sha512-UXfikgakSZBii5lkvmDCRO+IYWQhTtwMOJ+3EmGEA+oA82kvbSskgw3OI16Jx1kINgF8aqOkYE+c9h4m6muONg=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
  </head>
  <body>
    <div style="display: flex; min-height: 100vh; align-items: center;">${props.children}</div>

    <!-- htmx v2.0.3 -->
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/htmx/2.0.3/htmx.min.js"
      integrity="sha512-dQu3OKLMpRu85mW24LA1CUZG67BgLPR8Px3mcxmpdyijgl1UpCM1RtJoQP6h8UkufSnaHVRTUx98EQT9fcKohw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/htmx/2.0.3/ext/json-enc.min.js"
      integrity="sha512-j1k3ETNtJhZQDDFx26zOEVNermFueca+81zGri6ScAdHY2fjY+bbDTpujOxss9XihJpvhFXz6BRUQwmczQhDLw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/htmx/2.0.3/ext/response-targets.min.js"
      integrity="sha512-oNWPfY2nuUn0elKOQ9wukVpIQeIacgL7ZrDWgO8j+1IMZa9Xv5y6bgqPm7qbg0p8HLIEYoPXFe0jyajkUbrYrQ=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/htmx/2.0.3/ext/client-side-templates.min.js"
      integrity="sha512-2knGw66kGExoG8tIfLcWseEbZ6muYpoFmXVQqNXLlyu33dMaWsN+FDcuXMDT5zhm63R4yLfgdl9GTIX2Ob82yg=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
    <!-- mustache v4.2.0 -->
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.2.0/mustache.min.js"
      integrity="sha512-CswfmQmJj8DXhm29Qc5eLk5//2EW1CaI6de+RmRhSrWrXRhkBQ3795tuwJvT6DK6EF4IVqJIRmBg8EokL6c87g=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    ></script>
  </body>
</html>
`

export default Layout
