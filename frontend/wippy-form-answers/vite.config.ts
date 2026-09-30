import { resolve } from 'node:path'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    wippyComponentPlugin(),
  ],
  css: {
    // This package has no CSS files today (the one hiding rule is a plain
    // TS string in src/lib/hidden-css.ts — see its own comment for why:
    // an unrelated Vite/Vitest text-asset-import quirk, not this). Kept
    // as a guard for if a CSS file is ever added back: Vite's PostCSS
    // config auto-detection walks UP from any CSS file through every
    // parent directory until it finds one, which unscoped reaches the
    // gen-2-chat repo root's own postcss.config.js (tailwindcss +
    // autoprefixer, configured for that repo's own FE, not this package)
    // — confirmed reachable (its "content option missing" Tailwind
    // warning appears without this override). An inline empty config
    // stops that upward search here instead of silently inheriting it.
    postcss: {
      plugins: [],
    },
  },
  build: {
    target: 'esnext',
    // Output path is NOT hardcoded here — the npm `build`/`build:debug`
    // scripts pass `--outDir ../../src/forms/ui/answers-dist --emptyOutDir`
    // (what src/forms/ui/_index.yaml's ui_fs_answers fs.directory entry
    // points at, and what `make build-ui` / `make.ps1 build-ui` run via
    // `npm run build`).
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
      // Served by the Host import map, as for wippy-form. The element uses
      // no Vue itself, but @wippy-fe/webcomponent-core imports @iconify/vue,
      // which imports vue; bundling them would ship Vue's unreplaced
      // `process.env.NODE_ENV` checks and fail at load time in the browser.
      external: [
        'vue',
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
