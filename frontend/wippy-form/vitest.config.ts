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
    // Vitest stubs CSS imports (incl. `?raw`/`?inline`) to an empty string
    // by default (`css: false`) — fine for every component test, which
    // never needs real style text, but `styles.test.ts` reads the actual
    // `styles.css` source via `?raw` to assert a rule exists (the only way
    // to regression-test a pure-CSS fix; this suite has no visual/computed-
    // style harness). Scoped to that one import so every other test's CSS
    // handling is unchanged.
    css: {
      include: [/styles\.css\?raw$/],
    },
  },
})
