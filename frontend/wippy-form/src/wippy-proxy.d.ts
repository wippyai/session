import type { FormState, SubmitEnvelope, SubmitResult } from './lib/definition'

/**
 * Types for the `artifactState(artifactId)` export the Web Host adds to
 * `@wippy-fe/proxy`. The installed proxy version predates it, so this file only
 * supplies types. The runtime reads the export through `hostExport` in
 * `src/lib/host-proxy.ts`. Delete this file once the published proxy types
 * declare `artifactState`.
 */
declare module '@wippy-fe/proxy' {
  export function artifactState(artifactId: string): {
    get: () => Promise<FormState>
    submit: (envelope: SubmitEnvelope) => Promise<SubmitResult>
  }
}
