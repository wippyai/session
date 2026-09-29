import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/**
 * Test-only config, separate from vite.config.ts so the build's outDir /
 * rollup externals / lib entry never interact with the test runner. Tests
 * live next to the code they cover (`*.test.ts`).
 */
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'wippy-loading' || tag === 'wippy-error',
        },
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
  },
})
