import type { Ref } from 'vue'
import type { FieldError, FormAnswers, SubmitAccepted, SubmitEnvelope, SubmitResult } from '../lib/definition'
import type { SubmitErrorCode } from '../lib/submit-error'
import * as WippyProxy from '@wippy-fe/proxy'
import { ref } from 'vue'
import { generateRequestId } from '../lib/request-id'
import { classifySubmitError, validationErrorsOf } from '../lib/submit-error'

export interface SubmitOutcome {
  ok: boolean
  accepted?: SubmitAccepted
  fieldErrors?: Record<string, FieldError[]>
  formErrors?: FieldError[]
  message?: string
  code?: SubmitErrorCode
  retryable?: boolean
  shouldReload?: boolean
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function keyOfAnswers(answers: FormAnswers): string {
  // Field order in `answers` is already canonical (definition order) by
  // the time serializeAnswers() builds it, so JSON.stringify is a stable
  // fingerprint of "the same attempt" for request-id reuse below.
  return JSON.stringify(answers)
}

/**
 * Submission state machine for one form instance: request-id issuance and
 * reuse (a new request ID per submit attempt; the same ID while retrying an
 * uncertain outcome with unchanged answers; a new ID once the answers
 * change), one automatic retry for a genuinely
 * uncertain (no-response) network failure, and error classification.
 */
export function useFormSubmit(artifactId: Ref<string | null>) {
  const submitting = ref(false)
  const lastRequestId = ref<string | null>(null)
  const lastAnswersKey = ref<string | null>(null)

  function requestIdFor(answers: FormAnswers): string {
    const key = keyOfAnswers(answers)
    if (lastRequestId.value && lastAnswersKey.value === key)
      return lastRequestId.value
    const id = generateRequestId()
    lastRequestId.value = id
    lastAnswersKey.value = key
    return id
  }

  function resetIdentity(): void {
    lastRequestId.value = null
    lastAnswersKey.value = null
  }

  function getArtifactStateFn() {
    // See use-form-state.ts for why this reads the namespace object
    // instead of a named import.
    return (WippyProxy as unknown as Record<string, unknown>).artifactState as
      | ((id: string) => { submit: (envelope: SubmitEnvelope) => Promise<SubmitResult> })
      | undefined
  }

  async function submit(formVersion: number, expectedContentVersion: number, answers: FormAnswers): Promise<SubmitOutcome> {
    const id = artifactId.value
    if (!id)
      return { ok: false, message: 'This form cannot be submitted here.' }

    const artifactStateFn = getArtifactStateFn()
    if (typeof artifactStateFn !== 'function')
      return { ok: false, message: 'This form needs a newer Web Host.' }

    const requestId = requestIdFor(answers)
    const envelope: SubmitEnvelope = {
      form_version: formVersion,
      request_id: requestId,
      expected_content_version: expectedContentVersion,
      answers,
    }

    submitting.value = true
    try {
      let result: SubmitResult
      try {
        result = await artifactStateFn(id).submit(envelope)
      }
      catch (err) {
        // The Host client rejects a 422 with field errors attached.
        const invalid = validationErrorsOf(err)
        if (invalid)
          return { ok: false, fieldErrors: invalid.errors, formErrors: invalid.formErrors }
        const classified = classifySubmitError(err)
        if (!classified.uncertain) {
          return { ok: false, message: classified.message, code: classified.code, retryable: classified.retryable, shouldReload: classified.shouldReload }
        }
        // One silent same-request-id retry for a genuinely uncertain
        // (no-response) failure — replaying an already-accepted request
        // returns the original result (`replayed: true`), so this can't
        // duplicate the answer.
        await delay(800)
        try {
          result = await artifactStateFn(id).submit(envelope)
        }
        catch (err2) {
          const classified2 = classifySubmitError(err2)
          return { ok: false, message: classified2.message, code: classified2.code, retryable: true, shouldReload: classified2.shouldReload }
        }
      }

      resetIdentity()
      return { ok: true, accepted: result }
    }
    finally {
      submitting.value = false
    }
  }

  return { submitting, submit, resetIdentity }
}
