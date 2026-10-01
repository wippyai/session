import type { FormAnswers, FormState, SubmitAccepted, SubmitEnvelope, SubmitResult } from '../lib/definition'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { acceptedResponse } from '../test-support/fixtures'
import { hostError } from '../test-support/host-error'
import { artifactStateMock, resetProxyMock, setArtifactStateExport } from '../test-support/proxy-control'
import { RETRY_DELAY_MS, useFormSubmit } from './use-form-submit'

/** `submit()` never calls `.get`, but the proxy type requires it. */
function artifactClient(submit: ReturnType<typeof vi.fn>) {
  return { get: vi.fn(), submit } as unknown as {
    get: () => Promise<FormState>
    submit: (envelope: SubmitEnvelope) => Promise<SubmitResult>
  }
}

const answersA: FormAnswers = { f1: 'a' }
const answersB: FormAnswers = { f1: 'b' }

beforeEach(resetProxyMock)

describe('useFormSubmit — request id issuance', () => {
  it('reuses the same request_id across attempts when the answers are unchanged', async () => {
    const submitFn = vi.fn().mockRejectedValue(hostError(409, 'request_conflict'))
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)

    await submit(1, 1, answersA)
    await submit(1, 1, answersA)

    expect(submitFn).toHaveBeenCalledTimes(2)
    const firstId = (submitFn.mock.calls[0][0] as SubmitEnvelope).request_id
    const secondId = (submitFn.mock.calls[1][0] as SubmitEnvelope).request_id
    expect(secondId).toBe(firstId)
  })

  it('issues a new request_id once the answers change', async () => {
    const submitFn = vi.fn().mockRejectedValue(hostError(409, 'request_conflict'))
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)

    await submit(1, 1, answersA)
    await submit(1, 1, answersB)

    const firstId = (submitFn.mock.calls[0][0] as SubmitEnvelope).request_id
    const secondId = (submitFn.mock.calls[1][0] as SubmitEnvelope).request_id
    expect(secondId).not.toBe(firstId)
  })

  it('resets identity after a successful submit, so a later identical attempt gets a fresh request_id', async () => {
    const submitFn = vi.fn()
      .mockResolvedValueOnce(acceptedResponse())
      .mockRejectedValueOnce(hostError(409, 'request_conflict'))
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)

    await submit(1, 1, answersA)
    await submit(1, 1, answersA)

    const firstId = (submitFn.mock.calls[0][0] as SubmitEnvelope).request_id
    const secondId = (submitFn.mock.calls[1][0] as SubmitEnvelope).request_id
    expect(secondId).not.toBe(firstId)
  })
})

describe('useFormSubmit — outcomes', () => {
  it('returns fieldErrors/formErrors for a 422 rejection, with no retry', async () => {
    const submitFn = vi.fn().mockRejectedValue(
      hostError(422, undefined, {
        errors: { f1: [{ code: 'required', message: 'Required' }] },
        formErrors: [{ code: 'stale', message: 'Stale' }],
      }),
    )
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)
    const outcome = await submit(1, 1, answersA)

    expect(outcome.ok).toBe(false)
    expect(outcome.fieldErrors).toEqual({ f1: [{ code: 'required', message: 'Required' }] })
    expect(outcome.formErrors).toEqual([{ code: 'stale', message: 'Stale' }])
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  it('retries exactly once, with the same request_id, for an uncertain (no-status) failure', async () => {
    vi.useFakeTimers()
    try {
      const submitFn = vi.fn()
        .mockRejectedValueOnce(hostError(undefined, 'network_error'))
        .mockResolvedValueOnce(acceptedResponse())
      artifactStateMock().mockReturnValue(artifactClient(submitFn))

      const artifactId = ref<string | null>('artifact-1')
      const { submit } = useFormSubmit(artifactId)

      const outcomePromise = submit(1, 1, answersA)
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      const outcome = await outcomePromise

      expect(outcome.ok).toBe(true)
      expect(submitFn).toHaveBeenCalledTimes(2)
      const firstId = (submitFn.mock.calls[0][0] as SubmitEnvelope).request_id
      const secondId = (submitFn.mock.calls[1][0] as SubmitEnvelope).request_id
      expect(secondId).toBe(firstId)
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('does not retry a definite failure such as a 500', async () => {
    const submitFn = vi.fn().mockRejectedValue(hostError(500))
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)
    const outcome = await submit(1, 1, answersA)

    expect(outcome.ok).toBe(false)
    expect(outcome.code).toBe('server_error')
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  it('returns the documented message and calls nothing when there is no artifact id', async () => {
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>(null)
    const { submit } = useFormSubmit(artifactId)
    const outcome = await submit(1, 1, answersA)

    expect(outcome).toEqual({ ok: false, message: 'This form cannot be submitted here.' })
    expect(artifactStateMock()).not.toHaveBeenCalled()
    expect(submitFn).not.toHaveBeenCalled()
  })
})

describe('useFormSubmit — exhausted-retry copy', () => {
  it('does not say "Retrying…" once the one automatic retry has also failed with no response', async () => {
    vi.useFakeTimers()
    try {
      const submitFn = vi.fn()
        .mockRejectedValueOnce(hostError(undefined, 'network_error'))
        .mockRejectedValueOnce(hostError(undefined, 'network_error'))
      artifactStateMock().mockReturnValue(artifactClient(submitFn))

      const artifactId = ref<string | null>('artifact-1')
      const { submit } = useFormSubmit(artifactId)

      const outcomePromise = submit(1, 1, answersA)
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      const outcome = await outcomePromise

      expect(outcome.ok).toBe(false)
      expect(outcome.message).toBe('Network problem. Your answer may not have been saved. Check your connection, then select Retry.')
      expect(outcome.message).not.toContain('Retrying')
      expect(outcome.retryable).toBe(true)
      expect(submitFn).toHaveBeenCalledTimes(2)
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('useFormSubmit — retry outcome mapping', () => {
  it('maps a 422 on the retry attempt itself to field errors, not a generic message', async () => {
    vi.useFakeTimers()
    try {
      const submitFn = vi.fn()
        .mockRejectedValueOnce(hostError(undefined, 'network_error'))
        .mockRejectedValueOnce(hostError(422, undefined, {
          errors: { f1: [{ code: 'required', message: 'Required' }] },
          formErrors: [],
        }))
      artifactStateMock().mockReturnValue(artifactClient(submitFn))

      const artifactId = ref<string | null>('artifact-1')
      const { submit } = useFormSubmit(artifactId)

      const outcomePromise = submit(1, 1, answersA)
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      const outcome = await outcomePromise

      expect(outcome.ok).toBe(false)
      expect(outcome.fieldErrors).toEqual({ f1: [{ code: 'required', message: 'Required' }] })
      expect(submitFn).toHaveBeenCalledTimes(2)
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('does not force retryable=true for a definite (non-uncertain) failure on the retry attempt', async () => {
    vi.useFakeTimers()
    try {
      const submitFn = vi.fn()
        .mockRejectedValueOnce(hostError(undefined, 'network_error'))
        .mockRejectedValueOnce(hostError(409, 'request_conflict'))
      artifactStateMock().mockReturnValue(artifactClient(submitFn))

      const artifactId = ref<string | null>('artifact-1')
      const { submit } = useFormSubmit(artifactId)

      const outcomePromise = submit(1, 1, answersA)
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      const outcome = await outcomePromise

      expect(outcome.ok).toBe(false)
      expect(outcome.code).toBe('request_conflict')
      // Retrying without a change cannot fix a 409 request_conflict, so Retry is not offered.
      expect(outcome.retryable).toBe(false)
      expect(outcome.message).toBe('That answer no longer matches this attempt. Change something and try again.')
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('useFormSubmit — rebind safety', () => {
  it('drops a result that resolves after the artifact id changed mid-flight', async () => {
    let resolveSubmit: ((r: SubmitAccepted) => void) | undefined
    const pending = new Promise<SubmitAccepted>((resolve) => { resolveSubmit = resolve })
    const submitFn = vi.fn().mockReturnValue(pending)
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)

    const outcomePromise = submit(1, 1, answersA)
    // The Host rebinds this component to a different artifact while the
    // request is still in flight (e.g. a double-buffered w-page swap).
    artifactId.value = 'artifact-2'
    await nextTick()
    resolveSubmit?.(acceptedResponse())

    const outcome = await outcomePromise
    expect(outcome.ok).toBe(false)
    expect(outcome.ignored).toBe(true)
    expect(outcome.accepted).toBeUndefined()
  })

  it('resets request-id identity once the artifact id changes', async () => {
    const submitFn = vi.fn().mockRejectedValue(hostError(409, 'request_conflict'))
    artifactStateMock().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)

    await submit(1, 1, answersA)
    artifactId.value = 'artifact-2'
    await nextTick() // let the artifactId watcher run resetIdentity() first
    await submit(1, 1, answersA)

    const firstId = (submitFn.mock.calls[0][0] as SubmitEnvelope).request_id
    const secondId = (submitFn.mock.calls[1][0] as SubmitEnvelope).request_id
    expect(secondId).not.toBe(firstId)
  })
})

describe('useFormSubmit — older Host without the artifactState export', () => {
  it('returns the documented message and calls nothing when @wippy-fe/proxy has no artifactState export', async () => {
    setArtifactStateExport(undefined)
    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)
    const outcome = await submit(1, 1, answersA)

    expect(outcome).toEqual({ ok: false, message: 'This form needs a newer Web Host.' })
  })
})
