import type { ArtifactFormSubmitEnvelope } from '@wippy-fe/proxy'
import type { HostFormAnswers } from './lib/answers'
import type { FormState, SubmitEnvelope, SubmitResult } from './lib/definition'

/**
 * Widens `artifactState(artifactId)` for forms with standard fields. The
 * published `@wippy-fe/proxy` 0.0.67 types declare choice forms only, so this
 * file only supplies types. `get` keeps the Host's loose stored answers, which
 * `normalizeHostAnswers` reads, and `submit` is a method that also takes the
 * Host's envelope, so the Host's narrower client stays assignable to this one
 * in tests. Delete this file once the published proxy types declare standard
 * fields.
 */
declare module '@wippy-fe/proxy' {
  export function artifactState(artifactId: string): {
    get: () => Promise<Omit<FormState, 'data'> & { data: HostFormAnswers | null }>
    submit(envelope: SubmitEnvelope | ArtifactFormSubmitEnvelope): Promise<SubmitResult>
  }
}
