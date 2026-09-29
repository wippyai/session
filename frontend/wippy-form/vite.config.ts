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
    // Built straight into the module's served directory — src/forms/ui/dist
    // is what src/forms/ui/_index.yaml's fs.directory entry points at, and
    // what `make build-ui` / `make.ps1 build-ui` runs. No separate copy step.
    outDir: resolve(__dirname, '../../src/forms/ui/dist'),
    emptyOutDir: true,
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
        '@wippy-fe/proxy',
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
