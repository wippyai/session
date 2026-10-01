/**
 * Form contract types: the definition the Session module stores
 * (`src/forms/definition.lua`) and the answers its state API accepts
 * (`src/forms/state_service.lua`). V1 forms hold `choice` fields only; V2
 * adds six standard fields (`text`, `textarea`, `number`, `email`, `date`,
 * `checkbox`). The server is the authority for validation — these types
 * exist so the component can render and serialize without guessing shapes;
 * `answers.ts` mirrors the server's rules for the client-side pre-check.
 */

/**
 * `form_version` values this component renders. 1 is a choice-only form, 2 is
 * a form with at least one standard (non-choice) field. A higher value keeps
 * the "needs a newer version" notice, so a V3 form never renders half-known.
 */
export const SUPPORTED_FORM_VERSIONS: ReadonlySet<number> = new Set([1, 2])

export function isSupportedFormVersion(version: number): boolean {
  return SUPPORTED_FORM_VERSIONS.has(version)
}

export interface FormFieldOption {
  value: string
  label: string
  description?: string
}

interface FormFieldBase {
  id: string
  label: string
  description?: string
  required: boolean
}

export interface ChoiceFormField extends FormFieldBase {
  type: 'choice'
  options: FormFieldOption[]
  multiple: boolean
  allow_other: boolean
}

export interface TextFormField extends FormFieldBase {
  type: 'text'
  min_length?: number
  max_length?: number
  /** Full-match pattern the server checks (RE2, linear time). The browser never evaluates it. */
  pattern?: string
  placeholder?: string
  default?: string
}

export interface TextareaFormField extends FormFieldBase {
  type: 'textarea'
  min_length?: number
  max_length?: number
  placeholder?: string
  default?: string
}

export interface NumberFormField extends FormFieldBase {
  type: 'number'
  min?: number
  max?: number
  step?: number
  integer?: boolean
  default?: number
}

export interface EmailFormField extends FormFieldBase {
  type: 'email'
  default?: string
}

export interface DateFormField extends FormFieldBase {
  type: 'date'
  /** Inclusive `YYYY-MM-DD` bounds. */
  min?: string
  max?: string
  default?: string
}

export interface CheckboxFormField extends FormFieldBase {
  type: 'checkbox'
  /** Only `false` is ever accepted: a default must never mark consent. */
  default?: false
}

/** A V2 standard field: one control, one scalar answer. */
export type ScalarFormField
  = | TextFormField
    | TextareaFormField
    | NumberFormField
    | EmailFormField
    | DateFormField
    | CheckboxFormField

export type FormField = ChoiceFormField | ScalarFormField

export type FormFieldType = FormField['type']

const KNOWN_FIELD_TYPES: ReadonlySet<string> = new Set<FormFieldType>(['choice', 'text', 'textarea', 'number', 'email', 'date', 'checkbox'])

/** True when this component can render a field of the given `type`. A future type is not known. */
export function isKnownFieldType(type: string): boolean {
  return KNOWN_FIELD_TYPES.has(type)
}

export function isChoiceField(field: FormField): field is ChoiceFormField {
  return field.type === 'choice'
}

export interface FormDefinition<F extends FormField = FormField> {
  title: string
  description?: string
  submit_label?: string
  fields: F[]
  /**
   * Server-only: the chat message text the assistant sees once this form is
   * answered. Purely informational for the backend/prompt side — the
   * component never reads or displays it.
   */
  answered_message?: string
}

/** A definition whose every field is a `choice`: the question card renders it. */
export type ChoiceFormDefinition = FormDefinition<ChoiceFormField>

/** True for a non-empty definition made only of `choice` fields (a V1 form). */
export function isChoiceDefinition(definition: FormDefinition): definition is ChoiceFormDefinition {
  return definition.fields.length > 0 && definition.fields.every(isChoiceField)
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

/** A choice field's answer: one item (single choice), or an array of items (multiple choice). */
export type ChoiceAnswer = SingleFieldAnswer | Array<SingleFieldAnswer>

/**
 * Any field's answer. On the wire a text-like field answers with a string, a
 * number field with a JSON number and a checkbox with a boolean. A form's
 * local draft holds the raw control value instead (a number field's draft is
 * the typed text, so a strict parser can judge exactly what was typed).
 */
export type FieldAnswer = ChoiceAnswer | number | boolean

/** Answers keyed by field id. Optional unanswered fields are simply omitted. */
export type FormAnswers = Record<string, FieldAnswer>

export interface FieldError {
  code: string
  message: string
}

/** GET `/artifact/{id}/state` response body. */
export interface FormState<D extends FormDefinition = FormDefinition> {
  form_version: number
  artifact_id: string
  session_id: string
  status: 'active' | 'idle'
  stale: boolean
  late: boolean
  content_version: number
  definition: D
  data: FormAnswers | null
  submitted_at: string | null
  answer_message_id: string | null
  delivery: null | 'pending' | 'running' | 'complete' | 'interrupted'
}

/** A form state whose definition is choice-only (renders as the question card). */
export type ChoiceFormState = FormState<ChoiceFormDefinition>

/** True for a loaded state whose definition is choice-only. */
export function isChoiceFormState(state: FormState): state is ChoiceFormState {
  return isChoiceDefinition(state.definition)
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

/** True for the `{ other: text }` shape of an own answer (the one guard for it; also read from a loaded or drafted answer). */
export function isOtherAnswer(value: unknown): value is OtherAnswer {
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
export function answerHasOption(answer: ChoiceAnswer | undefined, optionValue: string): boolean {
  if (answer === undefined)
    return false
  if (Array.isArray(answer))
    return answer.some(v => itemOptionValue(v) === optionValue)
  return itemOptionValue(answer) === optionValue
}

/** Extracts the "Other" free-text value from an answer, if present. */
export function answerOtherText(answer: ChoiceAnswer | undefined): string {
  if (answer === undefined)
    return ''
  if (Array.isArray(answer)) {
    const found = answer.find(isOtherAnswer)
    return found ? found.other : ''
  }
  return isOtherAnswer(answer) ? answer.other : ''
}

/** True when `answer` includes an "Other" entry. */
export function answerHasOther(answer: ChoiceAnswer | undefined): boolean {
  if (answer === undefined)
    return false
  if (Array.isArray(answer))
    return answer.some(isOtherAnswer)
  return isOtherAnswer(answer)
}

/** The note attached to `optionValue` within `answer`, if any (empty string when none). */
export function answerNoteFor(answer: ChoiceAnswer | undefined, optionValue: string): string {
  if (answer === undefined)
    return ''
  const items = Array.isArray(answer) ? answer : [answer]
  const found = items.find(item => isNotedAnswer(item) && item.value === optionValue)
  return found && isNotedAnswer(found) ? found.note : ''
}
