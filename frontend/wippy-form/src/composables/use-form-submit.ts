import type { Ref } from 'vue'
import type { FieldError, FormAnswers, SubmitAccepted, SubmitEnvelope, SubmitResult } from '../lib/definition'
import type { SubmitErrorCode } from '../lib/submit-error'
import { ref, watch } from 'vue'
import { hostExport } from '../lib/host-proxy'
import { CANNOT_SUBMIT_MESSAGE, NEEDS_NEWER_HOST_MESSAGE } from '../lib/messages'
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
  /** True when the artifact was rebound to another id while this attempt was in flight. The caller must not apply this result. */
  ignored?: boolean
}

/** Shown once the one automatic retry of a request that got no response has also failed. */
const RETRY_EXHAUSTED_MESSAGE = 'Network problem. Your answer may not have been saved. Check your connection, then select Retry.'

/** How long to wait before the one automatic retry of a request that got no response. */
export const RETRY_DELAY_MS = 800

const IGNORED: SubmitOutcome = { ok: false, ignored: true }

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** The outcome of a rejected attempt. `exhausted` is true for the automatic retry, which must not promise another one. */
function outcomeFromError(err: unknown, { exhausted }: { exhausted: boolean }): SubmitOutcome {
  const invalid = validationErrorsOf(err)
  if (invalid)
    return { ok: false, fieldErrors: invalid.errors, formErrors: invalid.formErrors }
  const classified = classifySubmitError(err)
  const noResponseAgain = exhausted && classified.uncertain
  return {
    ok: false,
    message: noResponseAgain ? RETRY_EXHAUSTED_MESSAGE : classified.message,
    code: classified.code,
    retryable: classified.retryable,
    shouldReload: classified.shouldReload,
  }
}

/**
 * Sends the answers of one form. A new attempt gets a new request id. The
 * same id is reused while the answers stay the same, so a repeat of an
 * attempt with an uncertain outcome cannot save the answer twice. A request
 * that got no response is retried once automatically.
 */
export function useFormSubmit(artifactId: Ref<string | null>) {
  const submitting = ref(false)
  const lastRequestId = ref<string | null>(null)
  const lastAnswersKey = ref<string | null>(null)

  // Bumped when the artifact id changes, so an attempt started for the previous
  // artifact can tell its result is stale. A new artifact also starts a new
  // request id.
  let generation = 0
  watch(artifactId, () => {
    generation++
    resetIdentity()
  })

  function requestIdFor(answers: FormAnswers): string {
    // Answers are built in definition order, so the JSON is the same for the same attempt.
    const key = JSON.stringify(answers)
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

  async function submit(formVersion: number, expectedContentVersion: number, answers: FormAnswers): Promise<SubmitOutcome> {
    const id = artifactId.value
    if (!id)
      return { ok: false, message: CANNOT_SUBMIT_MESSAGE }

    const artifactState = hostExport('artifactState')
    if (typeof artifactState !== 'function')
      return { ok: false, message: NEEDS_NEWER_HOST_MESSAGE }

    const myGeneration = generation
    const isStale = () => myGeneration !== generation
    const envelope: SubmitEnvelope = {
      form_version: formVersion,
      request_id: requestIdFor(answers),
      expected_content_version: expectedContentVersion,
      answers,
    }
    const send = (): Promise<SubmitResult> => artifactState(id).submit(envelope)

    submitting.value = true
    try {
      let result: SubmitResult
      try {
        result = await send()
      }
      catch (err) {
        if (isStale())
          return IGNORED
        if (!classifySubmitError(err).uncertain)
          return outcomeFromError(err, { exhausted: false })
        // No response: the server may have saved the answer, and replaying an
        // accepted request returns the original result, so retry once.
        await delay(RETRY_DELAY_MS)
        if (isStale())
          return IGNORED
        try {
          result = await send()
        }
        catch (retryErr) {
          return isStale() ? IGNORED : outcomeFromError(retryErr, { exhausted: true })
        }
      }

      if (isStale())
        return IGNORED
      resetIdentity()
      return { ok: true, accepted: result }
    }
    finally {
      submitting.value = false
    }
  }

  return { submitting, submit }
}
