/**
 * The entire styling contract for this element: hide it, unconditionally.
 * It has no visible UI, so there are no other rules — no tokens, no parts,
 * no theme-dependent colors. See README.md "Styling API".
 *
 * A plain TS string rather than a `styles.css?inline`/`?raw` asset import
 * on purpose: empirically, under this repo's pinned Vite 6.4.3 + Vitest
 * 3.2.7, BOTH `?inline` and `?raw` text-asset imports resolved to an empty
 * string for every file tried (including this exact rule and a trivial
 * `body { color: red; }` control file), in the test run, a bare vitest
 * config with zero plugins, and a config with postcss explicitly
 * overridden — so it isn't specific to this package's own config. One CSS
 * rule doesn't need a separate stylesheet file's build-tool pipeline at
 * all; inlining it as a string sidesteps the issue entirely, for both
 * `vitest` and `vite build`.
 */
export const HIDDEN_HOST_CSS = ':host {\n  display: none;\n}\n'
