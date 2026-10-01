import type {
  CheckboxFormField,
  DateFormField,
  EmailFormField,
  FieldAnswer,
  FieldError,
  FormField,
  NumberFormField,
  ScalarFormField,
  TextareaFormField,
  TextFormField,
} from './definition'
import { isOnStep, NUMBER_ABS_MAX, numberToPlainText, parseNumberText } from './decimal'
import { codePointLength, hasControlCharacters, isBlank, normalizeNewlines, trimAnswerText } from './text'

/**
 * Client-side rules and serialization for the six V2 standard fields,
 * mirroring the server contract (decisions D32). This is a convenience mirror
 * for the UI: it catches an obvious mistake before a round trip and shapes
 * the value exactly as the server will accept it. The Session state API
 * stays the authority and its 422 errors are what the form ultimately shows.
 * Error codes are the server's stable codes; messages never echo the value.
 *
 * Never evaluated in the browser: a text field's `pattern` (see `evaluateText`).
 */

/** What judging one field's draft gives: the wire answer (undefined = omitted) and any findings. */
export interface FieldOutcome {
  answer: FieldAnswer | undefined
  errors: FieldError[]
}

/** The three things every field type provides, for the dispatch table in `answers.ts`. */
export interface FieldHandler<F extends FormField> {
  /** Judges the draft the control holds and shapes the wire answer. */
  evaluate: (field: F, draft: FieldAnswer | undefined) => FieldOutcome
  /** The draft a control starts from: the stored answer, else the definition's default. */
  initialDraft: (field: F, wire: FieldAnswer | undefined) => FieldAnswer | undefined
  /** The answer as read-only text, or `null` when the field was left unanswered. */
  display: (field: F, wire: FieldAnswer | undefined) => string | null
}

export const TEXT_DEFAULT_MAX = 500
export const TEXT_MAX_CAP = 2000
export const TEXTAREA_MAX_CAP = 8000
const EMAIL_MAX = 254
const EMAIL_LOCAL_MAX = 64

export const REQUIRED_MESSAGE = 'This question is required.'

const OMITTED: FieldOutcome = { answer: undefined, errors: [] }

function fail(code: string, message: string): FieldOutcome {
  return { answer: undefined, errors: [{ code, message }] }
}

function missing(field: { required: boolean }): FieldOutcome {
  return field.required ? fail('required', REQUIRED_MESSAGE) : OMITTED
}

// ── text and textarea ────────────────────────────────────────────

/** The longest accepted text: the definition's own limit, never above the type's cap. */
export function effectiveMaxLength(field: TextFormField | TextareaFormField): number {
  if (field.type === 'textarea')
    return Math.min(field.max_length ?? TEXTAREA_MAX_CAP, TEXTAREA_MAX_CAP)
  return Math.min(field.max_length ?? TEXT_DEFAULT_MAX, TEXT_MAX_CAP)
}

function evaluateText(field: TextFormField | TextareaFormField, draft: FieldAnswer | undefined): FieldOutcome {
  const multiline = field.type === 'textarea'
  const typed = typeof draft === 'string' ? draft : ''
  // Stored exactly as typed; only line breaks are normalized.
  const text = multiline ? normalizeNewlines(typed) : typed
  // Control characters come first, as on the server: a text field holding
  // only a line break is a control character error, not an unanswered field.
  if (hasControlCharacters(text, multiline))
    return fail('invalid_text', 'Remove control characters from this answer.')
  if (isBlank(text))
    return missing(field)
  const length = codePointLength(text)
  const min = field.min_length ?? 0
  if (length < min)
    return fail('too_short', `Use at least ${min} characters.`)
  const max = effectiveMaxLength(field)
  if (length > max)
    return fail('too_long', `Use at most ${max} characters.`)
  // A text field's `pattern` is deliberately NOT checked here: it is written
  // by the agent, and a browser regex engine backtracks, so an overlapping
  // repeat such as `(a|a)*b` or `a*a*a*b` on a long value can freeze the
  // tab. The server checks it with a linear-time engine and answers 422
  // `pattern_mismatch`, which the form shows on this field like any other error.
  return { answer: text, errors: [] }
}

// ── email ────────────────────────────────────────────────────────

// WHATWG-style dot-atom local part (ASCII) and DNS-label domain with a dot.
const EMAIL_LOCAL = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*$/
const DOMAIN_LABEL = /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i

/** Bounded email syntax check, no deliverability claim: ASCII, one `@`, 64/254 length limits. */
export function isValidEmail(text: string): boolean {
  if (text.length > EMAIL_MAX)
    return false
  const parts = text.split('@')
  if (parts.length !== 2)
    return false
  const [local, domain] = parts
  if (local.length === 0 || local.length > EMAIL_LOCAL_MAX || !EMAIL_LOCAL.test(local))
    return false
  const labels = domain.split('.')
  return labels.length >= 2 && labels.every(label => DOMAIN_LABEL.test(label))
}

function evaluateEmail(field: EmailFormField, draft: FieldAnswer | undefined): FieldOutcome {
  const text = trimAnswerText(typeof draft === 'string' ? draft : '')
  if (text === '')
    return missing(field)
  if (!isValidEmail(text))
    return fail('invalid_email', 'Enter a valid email address.')
  return { answer: text, errors: [] }
}

// ── number ───────────────────────────────────────────────────────

function evaluateNumber(field: NumberFormField, draft: FieldAnswer | undefined): FieldOutcome {
  const parsed = parseNumberText(typeof draft === 'string' ? draft : '')
  if (parsed.kind === 'empty')
    return missing(field)
  if (parsed.kind === 'invalid' || Math.abs(parsed.value) > NUMBER_ABS_MAX)
    return fail('invalid_number', 'Enter a number, using a dot for decimals (for example 12 or -3.5).')
  const { value } = parsed
  if (field.integer && !Number.isInteger(value))
    return fail('not_integer', 'Enter a whole number.')
  if (field.min !== undefined && value < field.min)
    return fail('below_min', `Enter ${numberToPlainText(field.min)} or more.`)
  if (field.max !== undefined && value > field.max)
    return fail('above_max', `Enter ${numberToPlainText(field.max)} or less.`)
  if (field.step !== undefined && field.step > 0 && !isOnStep(value, field.min ?? 0, field.step)) {
    const from = field.min !== undefined ? ` starting at ${numberToPlainText(field.min)}` : ''
    return fail('not_on_step', `Enter a value in steps of ${numberToPlainText(field.step)}${from}.`)
  }
  return { answer: value, errors: [] }
}

// ── date ─────────────────────────────────────────────────────────

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function daysInMonth(year: number, month: number): number {
  if (month === 2)
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

/** True for a real calendar day written `YYYY-MM-DD` with a year from 0001 to 9999. */
export function isValidIsoDate(text: string): boolean {
  const match = ISO_DATE.exec(text)
  if (!match)
    return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
}

function evaluateDate(field: DateFormField, draft: FieldAnswer | undefined): FieldOutcome {
  const text = typeof draft === 'string' ? draft : ''
  if (isBlank(text))
    return missing(field)
  // Typed text that is not a date is an error, never a silently dropped value.
  if (!isValidIsoDate(text))
    return fail('invalid_date', 'Enter a valid date as YYYY-MM-DD.')
  // Both sides are fixed-width ISO text, so a plain string compare is a date compare.
  if (field.min && isValidIsoDate(field.min) && text < field.min)
    return fail('below_min', `Choose ${field.min} or later.`)
  if (field.max && isValidIsoDate(field.max) && text > field.max)
    return fail('above_max', `Choose ${field.max} or earlier.`)
  return { answer: text, errors: [] }
}

// ── checkbox ─────────────────────────────────────────────────────

function evaluateCheckbox(field: CheckboxFormField, draft: FieldAnswer | undefined): FieldOutcome {
  const checked = draft === true
  // Required means true. An optional false is a meaningful answer and is sent.
  if (field.required && !checked)
    return fail('required', REQUIRED_MESSAGE)
  return { answer: checked, errors: [] }
}

// ── the table ────────────────────────────────────────────────────

function textInitialDraft(field: { default?: string }, wire: FieldAnswer | undefined): FieldAnswer | undefined {
  if (typeof wire === 'string')
    return wire
  return typeof field.default === 'string' ? field.default : undefined
}

function textDisplay(_field: ScalarFormField, wire: FieldAnswer | undefined): string | null {
  return typeof wire === 'string' && !isBlank(wire) ? wire : null
}

const textHandler: FieldHandler<TextFormField> = { evaluate: evaluateText, initialDraft: textInitialDraft, display: textDisplay }
const textareaHandler: FieldHandler<TextareaFormField> = { evaluate: evaluateText, initialDraft: textInitialDraft, display: textDisplay }
const emailHandler: FieldHandler<EmailFormField> = { evaluate: evaluateEmail, initialDraft: textInitialDraft, display: textDisplay }
const dateHandler: FieldHandler<DateFormField> = { evaluate: evaluateDate, initialDraft: textInitialDraft, display: textDisplay }

const numberHandler: FieldHandler<NumberFormField> = {
  evaluate: evaluateNumber,
  // The draft of a number field is the typed text, so the strict parser sees what the user wrote.
  initialDraft: (field, wire) => {
    if (typeof wire === 'number')
      return numberToPlainText(wire)
    return typeof field.default === 'number' ? numberToPlainText(field.default) : undefined
  },
  display: (_field, wire) => typeof wire === 'number' ? numberToPlainText(wire) : null,
}

const checkboxHandler: FieldHandler<CheckboxFormField> = {
  evaluate: evaluateCheckbox,
  // Only `false` can be a default, so an unchecked start is always right.
  initialDraft: (_field, wire) => typeof wire === 'boolean' ? wire : false,
  display: (_field, wire) => typeof wire === 'boolean' ? (wire ? 'Yes' : 'No') : null,
}

/** One handler per V2 field type. `answers.ts` adds `choice` and dispatches on `field.type`. */
export const SCALAR_HANDLERS: { [T in ScalarFormField['type']]: FieldHandler<Extract<ScalarFormField, { type: T }>> } = {
  text: textHandler,
  textarea: textareaHandler,
  email: emailHandler,
  number: numberHandler,
  date: dateHandler,
  checkbox: checkboxHandler,
}
