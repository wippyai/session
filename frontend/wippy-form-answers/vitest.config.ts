import { defineConfig } from 'vitest/config'

/** A test config separate from vite.config.ts, so the build's output path, externals and library entry never reach the test runner. */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
    // Vitest turns CSS imports into an empty string unless they are listed here,
    // and `index.test.ts` checks the injected `:host` rule.
    css: {
      include: [/styles\.css\?inline$/],
    },
  },
})
