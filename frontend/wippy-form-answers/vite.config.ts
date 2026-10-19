import { resolve } from 'node:path'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    wippyComponentPlugin(),
  ],
  build: {
    target: 'esnext',
    // The npm build scripts pass `--outDir`, so the output path is not set here.
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WippyFormAnswers',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      // The Host's import map serves these. The element uses no Vue, but
      // `@wippy-fe/webcomponent-core` imports `@iconify/vue`, which imports
      // `vue`, and a bundled Vue fails in the browser on its unreplaced
      // `process.env.NODE_ENV` checks.
      external: [
        'vue',
        '@iconify/vue',
        '@wippy-fe/proxy',
      ],
      // Keeps `define(import.meta.url, ...)` in the entry chunk. In a facade
      // chunk, `import.meta.url` lacks the `?declare-tag=` query and the tag
      // is never registered.
      preserveEntrySignatures: false,
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
