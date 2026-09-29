import type { FormAnswers, FormState, SubmitAccepted, SubmitEnvelope, SubmitResult } from '../lib/definition'
import * as WippyProxy from '@wippy-fe/proxy'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormSubmit } from './use-form-submit'

vi.mock('@wippy-fe/proxy', () => ({
  artifactState: vi.fn(),
  on: vi.fn(() => () => {}),
}))

function mockArtifactState() {
  return vi.mocked(WippyProxy.artifactState)
}

/** `submit()` never calls `.get`, but the shared ambient type requires it. */
function artifactClient(submit: ReturnType<typeof vi.fn>) {
  return { get: vi.fn(), submit } as unknown as {
    get: () => Promise<FormState>
    submit: (envelope: SubmitEnvelope) => Promise<SubmitResult>
  }
}

/** Host `ArtifactStateError`-shaped rejection, as classified by submit-error.ts. */
function hostError(status: number | undefined, code?: string) {
  const err = new Error('rejected') as Error & { name: string, status?: number, code?: string }
  err.name = 'ArtifactStateError'
  err.status = status
  err.code = code
  return err
}

function accepted(overrides: Partial<SubmitAccepted> = {}): SubmitAccepted {
  return {
    success: true,
    artifact_id: 'artifact-1',
    request_id: 'ignored-server-echo',
    answer_message_id: 'msg-1',
    content_version: 2,
    status: 'idle',
    late: false,
    delivery: 'pending',
    replayed: false,
    ...overrides,
  }
}

const answersA: FormAnswers = { f1: 'a' }
const answersB: FormAnswers = { f1: 'b' }

beforeEach(() => {
  mockArtifactState().mockReset()
})

describe('useFormSubmit — request id issuance', () => {
  it('reuses the same request_id across attempts when the answers are unchanged', async () => {
    const submitFn = vi.fn().mockRejectedValue(hostError(409, 'request_conflict'))
    mockArtifactState().mockReturnValue(artifactClient(submitFn))

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
    mockArtifactState().mockReturnValue(artifactClient(submitFn))

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
      .mockResolvedValueOnce(accepted())
      .mockRejectedValueOnce(hostError(409, 'request_conflict'))
    mockArtifactState().mockReturnValue(artifactClient(submitFn))

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
      Object.assign(hostError(422), {
        errors: { f1: [{ code: 'required', message: 'Required' }] },
        formErrors: [{ code: 'stale', message: 'Stale' }],
      }),
    )
    mockArtifactState().mockReturnValue(artifactClient(submitFn))

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
        .mockResolvedValueOnce(accepted())
      mockArtifactState().mockReturnValue(artifactClient(submitFn))

      const artifactId = ref<string | null>('artifact-1')
      const { submit } = useFormSubmit(artifactId)

      const outcomePromise = submit(1, 1, answersA)
      await vi.advanceTimersByTimeAsync(800)
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
    mockArtifactState().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>('artifact-1')
    const { submit } = useFormSubmit(artifactId)
    const outcome = await submit(1, 1, answersA)

    expect(outcome.ok).toBe(false)
    expect(outcome.code).toBe('server_error')
    expect(submitFn).toHaveBeenCalledTimes(1)
  })

  it('returns the documented message and calls nothing when there is no artifact id', async () => {
    const submitFn = vi.fn()
    mockArtifactState().mockReturnValue(artifactClient(submitFn))

    const artifactId = ref<string | null>(null)
    const { submit } = useFormSubmit(artifactId)
    const outcome = await submit(1, 1, answersA)

    expect(outcome).toEqual({ ok: false, message: 'This form cannot be submitted here.' })
    expect(mockArtifactState()).not.toHaveBeenCalled()
    expect(submitFn).not.toHaveBeenCalled()
  })
})

describe('useFormSubmit — older Host without the artifactState export', () => {
  afterEach(() => {
    // Restore the mocked module shape for every other test in this file.
    mockArtifactState().mockReset()
  })

  it('returns the documented message and calls nothing when @wippy-fe/proxy has no artifactState export', async () => {
    const original = (WippyProxy as unknown as Record<string, unknown>).artifactState
    ;(WippyProxy as unknown as Record<string, unknown>).artifactState = undefined
    try {
      const artifactId = ref<string | null>('artifact-1')
      const { submit } = useFormSubmit(artifactId)
      const outcome = await submit(1, 1, answersA)

      expect(outcome).toEqual({ ok: false, message: 'This form needs a newer Web Host.' })
    }
    finally {
      (WippyProxy as unknown as Record<string, unknown>).artifactState = original
    }
  })
})
