import { describe, expect, it } from 'vitest'
import { hostError } from '../test-support/host-error'
import { classifySubmitError, validationErrorsOf } from './submit-error'

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

  it('classifies a 413 (payload too large) as unknown, not retryable, using the server message', () => {
    const err = hostError(413, 'payload_too_large')
    err.message = 'The request body is too large.'
    const result = classifySubmitError(err)
    expect(result.code).toBe('unknown')
    expect(result.message).toBe('The request body is too large.')
    expect(result.retryable).toBe(false)
    expect(result.uncertain).toBe(false)
    expect(result.shouldReload).toBe(false)
  })

  it('classifies a 415 (unsupported media type) as unknown and not retryable', () => {
    const result = classifySubmitError(hostError(415, 'unsupported_media_type'))
    expect(result.code).toBe('unknown')
    expect(result.retryable).toBe(false)
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

  it('does not special-case an unbranded, Axios-shaped error: the Host client never throws one', () => {
    const axiosShaped = {
      response: {
        status: 401,
        data: { code: 'unauthorized', message: 'nope' },
      },
    }
    const result = classifySubmitError(axiosShaped)
    expect(result.code).toBe('unknown')
    expect(result.message).toBe('Could not submit this form.')
    expect(result.retryable).toBe(true)
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

  it('returns null for an unbranded, Axios-shaped error, even with status 422', () => {
    const axiosShaped = { response: { status: 422, data: {} } }
    expect(validationErrorsOf(axiosShaped)).toBeNull()
  })

  it('returns null for a non-Error rejection', () => {
    expect(validationErrorsOf('just a string')).toBeNull()
  })
})
