import { resolve } from 'node:path'

import alias from '@rollup/plugin-alias'
import nitroCloudflareBindings from 'nitro-cloudflare-dev'

import type { NitroConfig } from 'nitropack'

export default {
  srcDir: 'src',
  publicAssets: [{ dir: 'www' }],
  preset: 'cloudflare-module',

  runtimeConfig: { nitro: { envPrefix: '' } },
  rollupConfig: {
    plugins: [
      alias({
        entries: [
          {
            find: '@',
            replacement: resolve('./src'),
          },
        ],
      }),
    ],
  },

  compatibilityDate: '2025-01-20',
  modules: [nitroCloudflareBindings],
} satisfies NitroConfig
