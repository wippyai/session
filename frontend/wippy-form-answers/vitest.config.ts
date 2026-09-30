import { defineConfig } from 'vitest/config'

/**
 * Test-only config, separate from vite.config.ts so the build's outDir /
 * rollup externals / lib entry never interact with the test runner. Tests
 * live next to the code they cover (`*.test.ts`).
 */
export default defineConfig({
  css: {
    // Same guard as vite.config.ts (see its comment): this package has no
    // CSS files today, but keeps PostCSS config auto-detection from
    // reaching the unrelated gen-2-chat repo root's postcss.config.js if
    // one is ever added.
    postcss: {
      plugins: [],
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
    // Vitest stubs CSS imports (incl. `?raw`/`?inline`) to an empty string
    // by default (`css: false`) — `vite build` always resolves the real
    // text regardless (verified: the production bundle contains the actual
    // rule), so this only matters for `index.test.ts`'s assertion on the
    // injected `:host { display: none }` rule. Same fix as the sibling
    // `wippy-form` package's `vitest.config.ts`, scoped to this one import.
    css: {
      include: [/styles\.css\?inline$/],
    },
  },
})
