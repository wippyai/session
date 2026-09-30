import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      // <wippy-loading>/<wippy-error> are custom elements the Host
      // auto-registers globally (loading.js) — tell Vue's compiler not to
      // warn trying to resolve them as SFC components.
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'wippy-loading' || tag === 'wippy-error',
        },
      },
    }),
    wippyComponentPlugin(),
  ],
  build: {
    target: 'esnext',
    // Output path is NOT hardcoded here — the npm `build`/`build:debug`
    // scripts pass `--outDir ../../src/forms/ui/dist --emptyOutDir` (what
    // src/forms/ui/_index.yaml's fs.directory entry points at, and what
    // `make build-ui` / `make.ps1 build-ui` run via `npm run build`).
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WippyForm',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      external: [
        'vue',
        'pinia',
        '@iconify/vue',
        '@wippy-fe/proxy',
      ],
      // Keeps define(import.meta.url, …) inside the entry chunk — without
      // this Rollup may hoist it into a facade chunk whose import.meta.url
      // lacks the ?declare-tag= query, and registration silently no-ops.
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
