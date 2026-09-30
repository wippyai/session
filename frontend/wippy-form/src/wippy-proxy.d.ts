import type { FormState, SubmitEnvelope, SubmitResult } from './lib/definition'

/**
 * Ambient module augmentation for the `artifactState(artifactId)` export
 * that the Web Host adds to `@wippy-fe/proxy` alongside this component.
 * The installed `@wippy-fe/proxy` version this package builds against may
 * predate that export, so this shim only provides TYPES for compilation —
 * `src/composables/use-form-state.ts` reads the real binding through the
 * module namespace object at runtime and treats a missing export as an
 * older-Host condition (see the comment there for why a named import is
 * unsafe here).
 *
 * Once `@wippy-fe/proxy` publishes `artifactState` for real, delete this
 * file — the published `.d.ts` takes over via normal declaration merging
 * with no consumer change needed. If the published shape ever diverges from
 * this shim, TypeScript will flag the mismatch at the `as` cast in
 * `use-form-state.ts`.
 */
declare module '@wippy-fe/proxy' {
  export function artifactState(artifactId: string): {
    get: () => Promise<FormState>
    submit: (envelope: SubmitEnvelope) => Promise<SubmitResult>
  }
}

// `on('@reconnect', …)` in `src/composables/use-form-state.ts` deliberately
// gets NO augmentation here: `on` is exported as a `const` of a generic
// function type, not an ambient `function` declaration, so a same-named
// `export function on(...)` in a `declare module '@wippy-fe/proxy'` block
// does not add an overload to it the way `artifactState` above does — it
// was tried and reverted, since it replaced `on`'s merged call signature
// outright and broke type-checking for every OTHER topic in this package.
// The `'@reconnect'` call site types itself honestly instead: its callback
// is declared with its real shape (`() => void`, no payload), which is
// structurally assignable to the installed types' catch-all `(data:
// WsMessage) => void` fallback for a topic they don't list yet — no cast to
// `any` needed. Revisit once the installed `@wippy-fe/proxy` types list
// `'@reconnect'` for real.
