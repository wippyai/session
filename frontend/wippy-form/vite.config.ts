import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'
import { vueOptions } from './vue-options'

export default defineConfig({
  plugins: [
    vue(vueOptions),
    wippyComponentPlugin(),
  ],
  build: {
    target: 'esnext',
    // The npm build scripts pass `--outDir`, so the output path is not set here.
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
