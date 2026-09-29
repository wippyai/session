export type SubmitErrorCode
  = | 'auth'
    | 'not_found'
    | 'request_conflict'
    | 'already_submitted'
    | 'version_conflict'
    | 'rate_limited'
    | 'server_error'
    | 'network_error'
    | 'unknown'

export interface ClassifiedSubmitError {
  code: SubmitErrorCode
  message: string
  /** True for a definite server rejection where retrying without a change won't help. */
  retryable: boolean
  /** True only for a genuinely uncertain outcome (no response reached the client). */
  uncertain: boolean
  /** True when the canonical form state should be re-fetched (another writer won). */
  shouldReload: boolean
}

interface AxiosLikeError {
  response?: {
    status: number
    data?: { code?: string, message?: string }
  }
  request?: unknown
  message?: string
}

/** Shape of the Host's `ArtifactStateError` (`@wippy-fe/proxy`). */
interface HostStateError {
  name?: string
  status?: number
  code?: string
  message?: string
  errors?: Record<string, { code: string, message: string }[]>
  formErrors?: { code: string, message: string }[]
}

function isAxiosLike(err: unknown): err is AxiosLikeError {
  return !!err && typeof err === 'object' && ('response' in err || 'request' in err)
}

function isHostStateError(err: unknown): err is HostStateError {
  return err instanceof Error && (err.name === 'ArtifactStateError' || 'status' in err || 'formErrors' in err)
}

/**
 * Normalize a rejection to `{ status, code, message, noResponse }`. The Host
 * client throws `ArtifactStateError` with top-level `status`/`code` and marks
 * a request that got no response with `code: 'network_error'`; a raw Axios
 * error is still accepted. `noResponse` is true only when the request was
 * sent and no response arrived, the one outcome where the server may or may
 * not have committed.
 */
function readFailure(err: unknown): { status?: number, code?: string, message?: string, known: boolean, noResponse: boolean } {
  if (isHostStateError(err))
    return { status: err.status, code: err.code, message: err.message, known: true, noResponse: err.status === undefined && err.code === 'network_error' }
  if (isAxiosLike(err)) {
    const noResponse = err.response === undefined && err.request !== undefined
    return { status: err.response?.status, code: err.response?.data?.code, message: err.response?.data?.message ?? err.message, known: true, noResponse }
  }
  return { known: false, message: err instanceof Error ? err.message : undefined, noResponse: false }
}

/** Field and form errors from a 422 rejection, if this is one. */
export function validationErrorsOf(err: unknown): { errors: Record<string, { code: string, message: string }[]>, formErrors: { code: string, message: string }[] } | null {
  if (!isHostStateError(err) || err.status !== 422)
    return null
  return { errors: err.errors ?? {}, formErrors: err.formErrors ?? [] }
}

/**
 * Classifies a submit failure by the state API's POST status and error
 * code (401, 404, 409 with `already_submitted` / `version_conflict` /
 * `request_conflict`, 422, 429, 5xx, no response). `submit()` in `use-form-submit.ts` uses `uncertain` to
 * decide whether a single automatic same-request-id retry is safe (no
 * response reached the client — the server may or may not have committed),
 * and `shouldReload` to tell the caller to refetch canonical state after a
 * conflict another writer already won.
 */
export function classifySubmitError(err: unknown): ClassifiedSubmitError {
  const failure = readFailure(err)
  if (failure.known) {
    const status = failure.status
    if (status === undefined) {
      // Request left the client but no response arrived (offline, DNS,
      // CORS, timeout): the server may have received and even committed
      // it. This is the one case where an automatic same-request-id retry
      // is safe, because replaying an already-accepted request returns the
      // original result with `replayed: true`.
      if (failure.noResponse)
        return { code: 'network_error', message: 'Network problem. Retrying…', retryable: true, uncertain: true, shouldReload: false }
      // Failed before a request was sent (e.g. a client-side bug): nothing
      // reached the server, so the user may try again but no auto-retry.
      return { code: 'unknown', message: failure.message ?? 'Could not submit this form.', retryable: true, uncertain: false, shouldReload: false }
    }
    if (status === 401)
      return { code: 'auth', message: 'You are signed out. Sign in again, then retry.', retryable: false, uncertain: false, shouldReload: false }
    if (status === 404)
      return { code: 'not_found', message: 'This form is no longer available.', retryable: false, uncertain: false, shouldReload: false }
    if (status === 409) {
      const conflictCode = failure.code
      if (conflictCode === 'already_submitted')
        return { code: 'already_submitted', message: 'This form was already answered.', retryable: false, uncertain: false, shouldReload: true }
      if (conflictCode === 'version_conflict')
        return { code: 'version_conflict', message: 'This form changed. Reloading the latest version.', retryable: false, uncertain: false, shouldReload: true }
      return { code: 'request_conflict', message: 'That answer no longer matches this attempt. Change something and try again.', retryable: false, uncertain: false, shouldReload: false }
    }
    if (status === 429)
      return { code: 'rate_limited', message: 'Too many attempts. Wait a moment and try again.', retryable: true, uncertain: false, shouldReload: false }
    if (status >= 500)
      return { code: 'server_error', message: 'The server could not save this. Try again.', retryable: true, uncertain: false, shouldReload: false }
    return { code: 'unknown', message: failure.message ?? 'Could not submit this form.', retryable: false, uncertain: false, shouldReload: false }
  }
  return { code: 'unknown', message: failure.message ?? 'Could not submit this form.', retryable: true, uncertain: false, shouldReload: false }
}
