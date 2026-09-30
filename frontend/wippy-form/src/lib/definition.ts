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
  /**
   * Server-only: the chat message text the assistant sees once this form is
   * answered. Purely informational for the backend/prompt side — the
   * component never reads or displays it.
   */
  answered_message?: string
}

/** One "Other" answer entry — the free-text, not-one-of-the-options shape. */
export interface OtherAnswer {
  other: string
}

/** A chosen option value with a note attached (question-card notes, V1). */
export interface NotedAnswer {
  value: string
  note: string
}

/** One item within a single field's answer: a plain option value, a noted option, or Other. */
export type SingleFieldAnswer = string | NotedAnswer | OtherAnswer

/** A single field's answer: one item (single choice), or an array of items (multiple choice). */
export type FieldAnswer = SingleFieldAnswer | Array<SingleFieldAnswer>

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
  delivery: null | 'pending' | 'running' | 'complete' | 'interrupted'
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

/** True for the `{ value, note }` shape a chosen option gets once it carries a note. */
export function isNotedAnswer(value: unknown): value is NotedAnswer {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && typeof (value as NotedAnswer).value === 'string' && typeof (value as NotedAnswer).note === 'string'
}

export function isFieldError(value: unknown): value is FieldError {
  return !!value && typeof value === 'object' && typeof (value as FieldError).code === 'string'
}

/** The option value a single answer item selects — a plain string, or a `{value, note}`'s `value`. */
function itemOptionValue(item: SingleFieldAnswer): string | null {
  if (typeof item === 'string')
    return item
  if (isNotedAnswer(item))
    return item.value
  return null
}

/** True when `answer` selects `optionValue` for a single- or multi-choice field (noted or not). */
export function answerHasOption(answer: FieldAnswer | undefined, optionValue: string): boolean {
  if (answer === undefined)
    return false
  if (Array.isArray(answer))
    return answer.some(v => itemOptionValue(v) === optionValue)
  return itemOptionValue(answer) === optionValue
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

/** The note attached to `optionValue` within `answer`, if any (empty string when none). */
export function answerNoteFor(answer: FieldAnswer | undefined, optionValue: string): string {
  if (answer === undefined)
    return ''
  const items = Array.isArray(answer) ? answer : [answer]
  const found = items.find(item => isNotedAnswer(item) && item.value === optionValue)
  return found && isNotedAnswer(found) ? found.note : ''
}
