import type { ArtifactFormAnswers, ArtifactFormChoiceAnswer } from '@wippy-fe/proxy'
import type {
  ChoiceAnswer,
  ChoiceFormField,
  FieldAnswer,
  FieldError,
  FormAnswers,
  FormDefinition,
  FormField,
  SingleFieldAnswer,
} from './definition'
import type { FieldOutcome } from './scalar-answers'
import { answerHasOption, answerHasOther, answerNoteFor, answerOtherText, isChoiceField, isNotedAnswer, isOtherAnswer } from './definition'
import { REQUIRED_MESSAGE } from './messages'
import { ownValue } from './own'
import { evaluateScalar, scalarDisplay, scalarInitialDraft } from './scalar-answers'
import { codePointLength, lengthLimitMessage, trimAnswerText } from './text'

/**
 * The answer rules the component checks before sending, and the answer
 * shapes it sends. They repeat the Session state API's rules so the user sees
 * an error before a round trip; the server still checks every answer, and its
 * 422 field and form errors are what the component finally shows. The choice
 * rules live here; the six standard fields live in `scalar-answers.ts`.
 */

/** The server rejects Other text and notes longer than these, counted in Unicode code points. */
export const OTHER_TEXT_MAX = 2000
export const NOTE_TEXT_MAX = 1000

const BLANK_OTHER_MESSAGE = 'Enter the other answer.'

/**
 * The form's local draft, keyed by field id: the raw value of each control (a
 * choice answer, the typed text of a text-like or number field, a checkbox's
 * boolean).
 */
export type AnswerDraft = Record<string, FieldAnswer | undefined>

/** True when the trimmed text is longer than `max` code points. An emoji counts as one, as on the server. */
export function exceedsLength(raw: string, max: number): boolean {
  return codePointLength(trimAnswerText(raw)) > max
}

/** What is wrong with the Other text of a choice, or `null`: it is blank, or longer than `OTHER_TEXT_MAX`. */
function otherTextError(text: string): FieldError | null {
  if (trimAnswerText(text) === '')
    return { code: 'blank', message: BLANK_OTHER_MESSAGE }
  if (exceedsLength(text, OTHER_TEXT_MAX))
    return { code: 'too_long', message: lengthLimitMessage(OTHER_TEXT_MAX) }
  return null
}

/**
 * True for a choice's error about its Other text (blank or too long), the
 * one where the text box, not the group, is what needs fixing.
 */
export function isOtherTextError(error: FieldError): boolean {
  return error.code === 'blank' || error.code === 'too_long'
}

/** The wire shape of a chosen option: the plain value, or `{ value, note }` once the trimmed note is not blank. */
export function buildNotedValue(value: string, note: string): SingleFieldAnswer {
  const trimmed = trimAnswerText(note)
  return trimmed ? { value, note: trimmed } : value
}

// ── choice ───────────────────────────────────────────────────────

/** A choice field's draft, or `undefined` when it does not have the field's shape (an array for several answers, one item otherwise). */
function choiceDraft(field: ChoiceFormField, draft: FieldAnswer | undefined): ChoiceAnswer | undefined {
  if (typeof draft === 'number' || typeof draft === 'boolean' || Array.isArray(draft) !== !!field.multiple)
    return undefined
  return draft
}

/**
 * Serializes one choice field's draft into the wire answer: the chosen
 * options in definition order, each with its trimmed note when it is not
 * blank, then the trimmed Other text when it is not blank. `undefined` when
 * nothing is left (an unanswered optional field).
 */
function serializeChoiceAnswer(field: ChoiceFormField, draft: ChoiceAnswer | undefined): ChoiceAnswer | undefined {
  const items: SingleFieldAnswer[] = field.options
    .filter(option => answerHasOption(draft, option.value))
    .map(option => buildNotedValue(option.value, answerNoteFor(draft, option.value)))
  const other = trimAnswerText(answerOtherText(draft))
  if (other)
    items.push({ other })
  if (field.multiple)
    return items.length > 0 ? items : undefined
  return items[0]
}

/**
 * A choice's `answer` is always the plain serialization (an over-long Other
 * is never truncated, a blank one is dropped); `errors` say whether it may
 * be sent. A standard field is stricter: it has no answer while it has a finding.
 */
function evaluateChoice(field: ChoiceFormField, raw: FieldAnswer | undefined): FieldOutcome {
  const draft = choiceDraft(field, raw)
  const answer = serializeChoiceAnswer(field, draft)
  const otherError = answerHasOther(draft) ? otherTextError(answerOtherText(draft)) : null
  // Serializing a blank Other would silently drop it, so the form asks for
  // the text instead, as the server would. It is also the more precise
  // message for a required field.
  if (otherError)
    return { answer, errors: [otherError] }
  if (field.options.some(option => exceedsLength(answerNoteFor(answer, option.value), NOTE_TEXT_MAX)))
    return { answer, errors: [{ code: 'too_long', message: lengthLimitMessage(NOTE_TEXT_MAX) }] }
  if (answer === undefined && field.required)
    return { answer, errors: [{ code: 'required', message: REQUIRED_MESSAGE }] }
  return { answer, errors: [] }
}

/** Builds an edit draft from a previously accepted/loaded answer for a choice field. */
function choiceInitialDraft(field: ChoiceFormField, wire: FieldAnswer | undefined): FieldAnswer | undefined {
  if (wire === undefined)
    return undefined
  return field.multiple
    ? (Array.isArray(wire) ? [...wire] : [wire as SingleFieldAnswer])
    : wire
}

/** Judges one field's draft: the wire answer (`undefined` = omit it) and any client-side findings. */
export function evaluateField(field: FormField, draft: FieldAnswer | undefined): FieldOutcome {
  return isChoiceField(field) ? evaluateChoice(field, draft) : evaluateScalar(field, draft)
}

/**
 * Serializes one field's draft into the wire answer, or `undefined` when it
 * should be omitted. Any field type.
 */
export function serializeFieldAnswer(field: FormField, draft: FieldAnswer | undefined): FieldAnswer | undefined {
  return evaluateField(field, draft).answer
}

/** Serializes the full draft into a submit-ready `FormAnswers` object. */
export function serializeAnswers(definition: FormDefinition, draft: AnswerDraft): FormAnswers {
  const out: FormAnswers = {}
  for (const field of definition.fields) {
    const value = serializeFieldAnswer(field, ownValue(draft, field.id))
    if (value !== undefined)
      out[field.id] = value
  }
  return out
}

/**
 * Client-side findings for every field the current draft plainly fails,
 * keyed by field id (fields with no finding are absent).
 */
export function validateAnswers(definition: FormDefinition, draft: AnswerDraft): Record<string, FieldError[]> {
  const out: Record<string, FieldError[]> = {}
  for (const field of definition.fields) {
    const { errors } = evaluateField(field, ownValue(draft, field.id))
    if (errors.length > 0)
      out[field.id] = errors
  }
  return out
}

/**
 * A stable text for a draft, to tell whether the user changed anything since
 * the form opened: field order follows the definition, and an empty value
 * (nothing typed, nothing ticked) counts as no value at all.
 */
export function draftSignature(definition: FormDefinition, draft: AnswerDraft): string {
  return JSON.stringify(definition.fields.map((field) => {
    const value = ownValue(draft, field.id)
    const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
    return [field.id, empty ? null : value]
  }))
}

// ── display ──────────────────────────────────────────────────────

/**
 * One stored choice as the internal type. The proxy types `note` as optional on
 * every `{ value }` object, but the server stores a note only when it is not
 * blank (`definition.lua`, `check_noted`), so a `{ value }` object without a
 * usable note is the plain option value. An item that has none of the three
 * shapes cannot come from the server and is dropped.
 */
function normalizeHostChoice(item: ArtifactFormChoiceAnswer): SingleFieldAnswer | null {
  if (typeof item === 'string')
    return item
  if (isOtherAnswer(item))
    return { other: item.other }
  if (typeof item === 'object' && item !== null && typeof item.value === 'string')
    return buildNotedValue(item.value, typeof item.note === 'string' ? item.note : '')
  return null
}

/**
 * The read boundary for stored answers: maps the proxy's looser
 * `ArtifactFormAnswers` to the internal `FormAnswers`, where a noted answer
 * always has a non-blank `note`. A number or a boolean is a standard field's
 * answer and stays as it is, `0` and `false` included. Malformed items are
 * dropped, and a single answer that is malformed is left out like an unanswered
 * question.
 */
export function normalizeHostAnswers(data: ArtifactFormAnswers | null): FormAnswers | null {
  if (data === null)
    return null
  const answers: FormAnswers = {}
  for (const [fieldId, value] of Object.entries(data)) {
    if (typeof value === 'number' || typeof value === 'boolean') {
      answers[fieldId] = value
      continue
    }
    if (Array.isArray(value)) {
      const items: SingleFieldAnswer[] = []
      for (const entry of value) {
        const item = normalizeHostChoice(entry)
        if (item !== null)
          items.push(item)
      }
      answers[fieldId] = items
      continue
    }
    const item = normalizeHostChoice(value)
    if (item !== null)
      answers[fieldId] = item
  }
  return answers
}

/** One answer shown back to the user in the review step, the answered summary or a read-only field. */
export interface AnswerDisplayItem {
  label: string
  /** The note attached to a chosen option. Never set for `own`. */
  note?: string
  /** True for the free-text Other entry. */
  own?: boolean
}

/**
 * The items of one choice field's answer, options in definition order and
 * Other last, or `null` when the field has no answer. Reads all three wire
 * shapes, so it works for an answer in progress and for `state.data` read
 * back from the server.
 */
export function answerDisplayItems(field: ChoiceFormField, answer: FieldAnswer | undefined): AnswerDisplayItem[] | null {
  if (answer === undefined || typeof answer === 'number' || typeof answer === 'boolean')
    return null
  const values = Array.isArray(answer) ? answer : [answer]
  const items: AnswerDisplayItem[] = []
  for (const option of field.options) {
    const match = values.find(v => (typeof v === 'string' ? v === option.value : isNotedAnswer(v) && v.value === option.value))
    if (match)
      items.push({ label: option.label, note: isNotedAnswer(match) ? match.note : undefined })
  }
  const other = values.find(isOtherAnswer)
  if (other)
    items.push({ label: other.other, own: true })
  return items.length > 0 ? items : null
}

/** What a read-only field shows for its stored answer. */
type ReadOnlyAnswer
  = | { kind: 'empty' }
    | { kind: 'text', text: string }
    | { kind: 'choice', items: AnswerDisplayItem[] }

/**
 * The read-only form of a stored answer: text (line breaks kept) for a
 * standard field, display items for a choice, `empty` for no answer — the
 * caller words that "Skipped".
 */
export function readOnlyAnswer(field: FormField, answer: FieldAnswer | undefined): ReadOnlyAnswer {
  if (isChoiceField(field)) {
    const items = answerDisplayItems(field, answer)
    return items ? { kind: 'choice', items } : { kind: 'empty' }
  }
  const text = scalarDisplay(field, answer)
  return text === null ? { kind: 'empty' } : { kind: 'text', text }
}

/**
 * Builds an edit draft from a previously accepted/loaded `FormAnswers`:
 * each field starts from its stored answer, else its definition default.
 */
export function draftFromAnswers(definition: FormDefinition, answers: FormAnswers | null): AnswerDraft {
  const draft: AnswerDraft = {}
  for (const field of definition.fields) {
    const wire = ownValue(answers, field.id)
    const value = isChoiceField(field) ? choiceInitialDraft(field, wire) : scalarInitialDraft(field, wire)
    if (value !== undefined)
      draft[field.id] = value
  }
  return draft
}
