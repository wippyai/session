/** The brand the Host stamps on every `ArtifactStateError`. See `lib/submit-error.ts`. */
const ARTIFACT_STATE_ERROR_BRAND = Symbol.for('wippy.artifactStateError')

interface HostErrorExtra {
  errors?: Record<string, Array<{ code: string, message: string }>>
  formErrors?: Array<{ code: string, message: string }>
}

/** An `ArtifactStateError` as `@wippy-fe/proxy` throws it. A missing status means the request got no response. */
export function hostError(status: number | undefined, code?: string, extra: HostErrorExtra = {}) {
  return Object.assign(new Error('The Host rejected the submission.'), {
    name: 'ArtifactStateError',
    [ARTIFACT_STATE_ERROR_BRAND]: true,
    status,
    code,
    ...extra,
  })
}
