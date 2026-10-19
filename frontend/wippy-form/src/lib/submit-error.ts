import type { FieldError } from './definition'
import { SUBMIT_FAILED_MESSAGE } from './messages'

export type SubmitErrorCode
  = | 'auth'
    | 'not_found'
    | 'request_conflict'
    | 'already_submitted'
    | 'version_conflict'
    | 'server_error'
    | 'network_error'
    | 'unknown'

export interface ClassifiedSubmitError {
  code: SubmitErrorCode
  message: string
  /** True for a definite server rejection where retrying without a change won't help. */
  retryable: boolean
  /** True only when no response reached the client, so the server may or may not have saved the answer. */
  uncertain: boolean
  /** True when the canonical form state should be fetched again because another writer won. */
  shouldReload: boolean
}

/** A failed submit as the card shows it. */
export interface SubmitBanner {
  message: string
  retryable?: boolean
}

/**
 * The brand the Host's `ArtifactStateError` carries on every instance. It is
 * read from the global symbol registry, so it matches an error thrown by any
 * bundle's copy of the Host's proxy, which `instanceof` would not. The proxy
 * exports `isArtifactStateError` since 0.0.65, but a Host with an older proxy
 * does not. A named import of it would fail when the module is linked, and the
 * component would crash instead of showing its "needs a newer Web Host"
 * notice, so the brand is checked here, as `hostExport` does for
 * `artifactState`.
 */
const ARTIFACT_STATE_ERROR_BRAND = Symbol.for('wippy.artifactStateError')

/** The shape of the Host's `ArtifactStateError`. */
interface HostStateError {
  status?: number
  code?: string
  message?: string
  errors?: Record<string, FieldError[]>
  formErrors?: FieldError[]
}

function isHostStateError(err: unknown): err is HostStateError {
  return typeof err === 'object' && err !== null && (err as Record<PropertyKey, unknown>)[ARTIFACT_STATE_ERROR_BRAND] === true
}

/**
 * `noResponse` is true when the request was sent and no response arrived, the
 * only outcome where the server may have saved the answer. The Host client marks
 * it with the code `network_error` and no status.
 */
function readFailure(err: unknown): { status?: number, code?: string, message?: string, known: boolean, noResponse: boolean } {
  if (isHostStateError(err))
    return { status: err.status, code: err.code, message: err.message, known: true, noResponse: err.status === undefined && err.code === 'network_error' }
  return { known: false, message: err instanceof Error ? err.message : undefined, noResponse: false }
}

/** The field and form errors of a 422 rejection, or `null` for any other error. */
export function validationErrorsOf(err: unknown): { errors: Record<string, FieldError[]>, formErrors: FieldError[] } | null {
  if (!isHostStateError(err) || err.status !== 422)
    return null
  return { errors: err.errors ?? {}, formErrors: err.formErrors ?? [] }
}

/**
 * Classifies a failed submit by the status and code of the state API's
 * response. Statuses with no copy of their own (400, 403, 413, 415) are
 * `unknown` and show the server's message. A 422 is handled by
 * `validationErrorsOf` before this is called. `uncertain` marks the one case
 * where a single automatic retry with the same request id is safe, and
 * `shouldReload` asks the caller to fetch the canonical state again.
 */
export function classifySubmitError(err: unknown): ClassifiedSubmitError {
  const failure = readFailure(err)
  if (failure.known) {
    const status = failure.status
    if (status === undefined) {
      // The server may have saved the answer, and replaying an accepted
      // request returns the original result, so one automatic retry is safe.
      if (failure.noResponse)
        return { code: 'network_error', message: 'Network problem. Retrying…', retryable: true, uncertain: true, shouldReload: false }
      // The request was never sent, so the user may try again but nothing is retried automatically.
      return { code: 'unknown', message: failure.message ?? SUBMIT_FAILED_MESSAGE, retryable: true, uncertain: false, shouldReload: false }
    }
    if (status === 401)
      return { code: 'auth', message: 'You are signed out. Sign in again, then retry.', retryable: false, uncertain: false, shouldReload: false }
    if (status === 404)
      return { code: 'not_found', message: 'This form is no longer available.', retryable: false, uncertain: false, shouldReload: false }
    if (status === 409) {
      if (failure.code === 'already_submitted')
        return { code: 'already_submitted', message: 'This form was already answered.', retryable: false, uncertain: false, shouldReload: true }
      if (failure.code === 'version_conflict')
        return { code: 'version_conflict', message: 'This form changed. Reloading the latest version.', retryable: false, uncertain: false, shouldReload: true }
      return { code: 'request_conflict', message: 'That answer no longer matches this attempt. Change something and try again.', retryable: false, uncertain: false, shouldReload: false }
    }
    if (status >= 500)
      return { code: 'server_error', message: 'The server could not save this. Try again.', retryable: true, uncertain: false, shouldReload: false }
    return { code: 'unknown', message: failure.message ?? SUBMIT_FAILED_MESSAGE, retryable: false, uncertain: false, shouldReload: false }
  }
  return { code: 'unknown', message: failure.message ?? SUBMIT_FAILED_MESSAGE, retryable: true, uncertain: false, shouldReload: false }
}
