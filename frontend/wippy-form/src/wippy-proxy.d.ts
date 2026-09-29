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
