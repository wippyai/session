import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { vueOptions } from './vue-options'

/** A test config separate from vite.config.ts, so the build's output path, externals and library entry never reach the test runner. */
export default defineConfig({
  plugins: [vue(vueOptions)],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
    // Vitest turns CSS imports, including `?raw` and `?inline`, into an empty
    // string unless they are listed here. `styles.test.ts` reads the stylesheet
    // source, and the theme stylesheets are read by the contrast test and by the
    // `p-disabled` test.
    css: {
      include: [/styles\.css\?raw$/, /theme\/primevue\/[\w-]+\.css\?raw$/],
    },
  },
})
