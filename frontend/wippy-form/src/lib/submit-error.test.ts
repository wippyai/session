import { describe, expect, it } from 'vitest'
import { classifySubmitError, validationErrorsOf } from './submit-error'

/** Builds a Host `ArtifactStateError`-shaped Error, as `@wippy-fe/proxy` throws it. */
function hostError(status: number | undefined, code?: string, extra?: {
  errors?: Record<string, { code: string, message: string }[]>
  formErrors?: { code: string, message: string }[]
}) {
  const err = new Error('host rejected the submission') as Error & {
    name: string
    status?: number
    code?: string
    errors?: Record<string, { code: string, message: string }[]>
    formErrors?: { code: string, message: string }[]
  }
  err.name = 'ArtifactStateError'
  err.status = status
  err.code = code
  if (extra?.errors)
    err.errors = extra.errors
  if (extra?.formErrors)
    err.formErrors = extra.formErrors
  return err
}

describe('classifySubmitError', () => {
  it('classifies a 401 as auth, not retryable, no reload', () => {
    const result = classifySubmitError(hostError(401))
    expect(result).toEqual({
      code: 'auth',
      message: 'You are signed out. Sign in again, then retry.',
      retryable: false,
      uncertain: false,
      shouldReload: false,
    })
  })

  it('classifies a 404 as not_found, not retryable, no reload', () => {
    const result = classifySubmitError(hostError(404))
    expect(result).toEqual({
      code: 'not_found',
      message: 'This form is no longer available.',
      retryable: false,
      uncertain: false,
      shouldReload: false,
    })
  })

  it('classifies a 409 already_submitted as shouldReload without retry', () => {
    const result = classifySubmitError(hostError(409, 'already_submitted'))
    expect(result.code).toBe('already_submitted')
    expect(result.retryable).toBe(false)
    expect(result.uncertain).toBe(false)
    expect(result.shouldReload).toBe(true)
  })

  it('classifies a 409 version_conflict as shouldReload without retry', () => {
    const result = classifySubmitError(hostError(409, 'version_conflict'))
    expect(result.code).toBe('version_conflict')
    expect(result.retryable).toBe(false)
    expect(result.uncertain).toBe(false)
    expect(result.shouldReload).toBe(true)
  })

  it('classifies any other 409 as a plain request_conflict without reload', () => {
    const result = classifySubmitError(hostError(409, 'something_else'))
    expect(result.code).toBe('request_conflict')
    expect(result.retryable).toBe(false)
    expect(result.uncertain).toBe(false)
    expect(result.shouldReload).toBe(false)
  })

  it('classifies a 429 as rate_limited and retryable', () => {
    const result = classifySubmitError(hostError(429))
    expect(result.code).toBe('rate_limited')
    expect(result.retryable).toBe(true)
    expect(result.uncertain).toBe(false)
    expect(result.shouldReload).toBe(false)
  })

  it('classifies a 500 as server_error and retryable', () => {
    const result = classifySubmitError(hostError(500))
    expect(result.code).toBe('server_error')
    expect(result.retryable).toBe(true)
    expect(result.uncertain).toBe(false)
    expect(result.shouldReload).toBe(false)
  })

  it('classifies a Host network_error (no response reached the client) as an uncertain, retryable network error', () => {
    const result = classifySubmitError(hostError(undefined, 'network_error'))
    expect(result.code).toBe('network_error')
    expect(result.retryable).toBe(true)
    expect(result.uncertain).toBe(true)
    expect(result.shouldReload).toBe(false)
  })

  it('does not treat a failure that never reached the server as uncertain', () => {
    const result = classifySubmitError(hostError(undefined))
    expect(result.code).toBe('unknown')
    expect(result.uncertain).toBe(false)
    expect(result.retryable).toBe(true)
  })

  it('treats a raw Axios error with a request but no response as uncertain', () => {
    const result = classifySubmitError({ request: {}, message: 'Network Error' })
    expect(result.code).toBe('network_error')
    expect(result.uncertain).toBe(true)
  })

  it('still classifies a raw Axios-shaped error (not the Host wrapper)', () => {
    const axiosError = {
      response: {
        status: 401,
        data: { code: 'unauthorized', message: 'nope' },
      },
    }
    const result = classifySubmitError(axiosError)
    expect(result.code).toBe('auth')
    expect(result.retryable).toBe(false)
    expect(result.uncertain).toBe(false)
  })

  it('does not crash on a non-Error rejection (e.g. a thrown string)', () => {
    expect(() => classifySubmitError('just a string')).not.toThrow()
    const result = classifySubmitError('just a string')
    expect(result.code).toBe('unknown')
    expect(result.message).toBe('Could not submit this form.')
    expect(result.retryable).toBe(true)
    expect(result.uncertain).toBe(false)
  })
})

describe('validationErrorsOf', () => {
  it('returns field and form errors for a 422 Host error', () => {
    const errors = { field1: [{ code: 'required', message: 'Required' }] }
    const formErrors = [{ code: 'stale', message: 'Stale' }]
    const result = validationErrorsOf(hostError(422, undefined, { errors, formErrors }))
    expect(result).toEqual({ errors, formErrors })
  })

  it('defaults to empty errors objects when the 422 Host error omits them', () => {
    const result = validationErrorsOf(hostError(422))
    expect(result).toEqual({ errors: {}, formErrors: [] })
  })

  it('returns null for a non-422 Host error', () => {
    expect(validationErrorsOf(hostError(409, 'request_conflict'))).toBeNull()
  })

  it('returns null for a raw Axios-shaped error, even with status 422', () => {
    const axiosError = { response: { status: 422, data: {} } }
    expect(validationErrorsOf(axiosError)).toBeNull()
  })

  it('returns null for a non-Error rejection', () => {
    expect(validationErrorsOf('just a string')).toBeNull()
  })
})
