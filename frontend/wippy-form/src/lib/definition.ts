/**
 * V1 (choice-only) form contract types: the definition the Session module
 * stores (`src/forms/definition.lua`) and the answers its state API accepts
 * (`src/forms/state_service.lua`). The server is the
 * authority for validation — these types exist so the component can render
 * and serialize without guessing shapes, not to re-implement server rules.
 */

export interface FormFieldOption {
  value: string
  label: string
  description?: string
}

export interface FormField {
  id: string
  type: 'choice'
  label: string
  description?: string
  required: boolean
  options: FormFieldOption[]
  multiple: boolean
  allow_other: boolean
}

export interface FormDefinition {
  title: string
  description?: string
  submit_label?: string
  fields: FormField[]
}

/** One "Other" answer entry — the only object shape allowed in an answer. */
export interface OtherAnswer {
  other: string
}

/** A single field's answer: one value (single choice), or an array (multiple choice). */
export type FieldAnswer = string | OtherAnswer | Array<string | OtherAnswer>

/** Answers keyed by field id. Optional unanswered fields are simply omitted. */
export type FormAnswers = Record<string, FieldAnswer>

export interface FieldError {
  code: string
  message: string
}

/** GET `/artifact/{id}/state` response body. */
export interface FormState {
  form_version: number
  artifact_id: string
  session_id: string
  status: 'active' | 'idle'
  stale: boolean
  late: boolean
  content_version: number
  definition: FormDefinition
  data: FormAnswers | null
  submitted_at: string | null
  answer_message_id: string | null
  delivery: null | 'pending' | 'complete'
}

/** POST `/artifact/{id}/state` request body. */
export interface SubmitEnvelope {
  form_version: number
  request_id: string
  expected_content_version: number
  answers: FormAnswers
}

/** 200 response body (accepted, including an exact replay). */
export interface SubmitAccepted {
  success: true
  artifact_id: string
  request_id: string
  answer_message_id: string
  content_version: number
  status: 'idle'
  late: boolean
  /** `complete` only on a replay of an answer the session already admitted. */
  delivery: 'pending' | 'complete'
  replayed: boolean
}

/**
 * What `artifactState(id).submit()` resolves with. Every failure, including a
 * 422 with field errors, rejects with the Host's `ArtifactStateError`.
 */
export type SubmitResult = SubmitAccepted

/** Shape of a 409 conflict body, when the transport surfaces it. */
export interface SubmitConflict {
  code: 'request_conflict' | 'already_submitted' | 'version_conflict'
  message?: string
}

function isOtherAnswer(value: unknown): value is OtherAnswer {
  return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as OtherAnswer).other === 'string'
}

export function isFieldError(value: unknown): value is FieldError {
  return !!value && typeof value === 'object' && typeof (value as FieldError).code === 'string'
}

/** True when `answer` selects `optionValue` for a single- or multi-choice field. */
export function answerHasOption(answer: FieldAnswer | undefined, optionValue: string): boolean {
  if (answer === undefined)
    return false
  if (Array.isArray(answer))
    return answer.some(v => typeof v === 'string' && v === optionValue)
  return typeof answer === 'string' && answer === optionValue
}

/** Extracts the "Other" free-text value from an answer, if present. */
export function answerOtherText(answer: FieldAnswer | undefined): string {
  if (answer === undefined)
    return ''
  if (Array.isArray(answer)) {
    const found = answer.find(isOtherAnswer)
    return found ? found.other : ''
  }
  return isOtherAnswer(answer) ? answer.other : ''
}

/** True when `answer` includes an "Other" entry. */
export function answerHasOther(answer: FieldAnswer | undefined): boolean {
  if (answer === undefined)
    return false
  if (Array.isArray(answer))
    return answer.some(isOtherAnswer)
  return isOtherAnswer(answer)
}
