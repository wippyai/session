import type { ArtifactFormAnswerValue, ArtifactFormChoiceAnswer } from '@wippy-fe/proxy'
import type {
  ChoiceAnswer,
  ChoiceFormField,
  FieldAnswer,
  FieldError,
  FormAnswers,
  FormDefinition,
  FormField,
  FormFieldType,
  NotedAnswer,
  OtherAnswer,
  SingleFieldAnswer,
} from './definition'
import type { FieldHandler, FieldOutcome } from './scalar-answers'
import { isChoiceField, isNotedAnswer, isOtherAnswer } from './definition'
import { REQUIRED_MESSAGE, SCALAR_HANDLERS } from './scalar-answers'
import { codePointLength, trimAnswerText } from './text'

/**
 * The answer rules the component checks before sending, one handler per field
 * type, and the answer shapes it sends. They repeat the Session state API's
 * rules so the user sees an error before a round trip; the server still
 * checks every answer, and its 422 field and form errors are what the
 * component finally shows. The choice rules live here; the six standard
 * fields live in `scalar-answers.ts` and join the same table (`HANDLERS`).
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

export function lengthLimitMessage(max: number): string {
  return `Use at most ${max.toLocaleString('en-US')} characters.`
}

/** The wire shape of a chosen option: the plain value, or `{ value, note }` once the trimmed note is not blank. */
export function buildNotedValue(value: string, note: string): SingleFieldAnswer {
  const trimmed = trimAnswerText(note)
  return trimmed ? { value, note: trimmed } : value
}

// ── choice ───────────────────────────────────────────────────────

/**
 * Serializes one choice field's draft into the wire answer, or `undefined`
 * when it should be omitted (unanswered optional field, or a multi-select
 * that normalizes to empty).
 */
function serializeChoiceAnswer(field: ChoiceFormField, draft: FieldAnswer | undefined): ChoiceAnswer | undefined {
  if (field.multiple) {
    const items = Array.isArray(draft) ? draft : []
    const optionOrder = field.options.map(o => o.value)
    const notedByValue = new Map<string, NotedAnswer>()
    const selected = new Set<string>()
    for (const item of items) {
      if (typeof item === 'string' && optionOrder.includes(item)) {
        selected.add(item)
      }
      else if (isNotedAnswer(item) && optionOrder.includes(item.value)) {
        selected.add(item.value)
        notedByValue.set(item.value, item)
      }
    }
    // A noted item is re-normalized through buildNotedValue — a note that
    // trims to blank falls back to the plain option value, same as a fresh
    // question-card submission.
    const ordered: SingleFieldAnswer[] = optionOrder
      .filter(v => selected.has(v))
      .map((v) => {
        const noted = notedByValue.get(v)
        return noted ? buildNotedValue(v, noted.note) : v
      })
    const otherEntry = items.find(isOtherAnswer)
    if (otherEntry) {
      const text = trimAnswerText(otherEntry.other)
      if (text.length > 0)
        ordered.push({ other: text })
    }
    return ordered.length > 0 ? ordered : undefined
  }

  if (draft === undefined || typeof draft === 'number' || typeof draft === 'boolean' || Array.isArray(draft))
    return undefined
  if (isOtherAnswer(draft)) {
    const text = trimAnswerText(draft.other)
    return text.length > 0 ? { other: text } : undefined
  }
  if (isNotedAnswer(draft) && field.options.some(o => o.value === draft.value))
    return buildNotedValue(draft.value, draft.note)
  if (typeof draft === 'string' && field.options.some(o => o.value === draft))
    return draft
  return undefined
}

/** The "Other" draft of a field (single or multiple choice), if Other is selected. */
function otherDraftOf(field: ChoiceFormField, value: FieldAnswer | undefined): OtherAnswer | undefined {
  if (field.multiple)
    return Array.isArray(value) ? value.find(isOtherAnswer) : undefined
  return isOtherAnswer(value) ? value : undefined
}

/**
 * A choice's `answer` is always the plain serialization (an over-long Other
 * is never truncated, a blank one is dropped); `errors` say whether it may
 * be sent. A standard field is stricter: it has no answer while it has a finding.
 */
function evaluateChoice(field: ChoiceFormField, draft: FieldAnswer | undefined): FieldOutcome {
  const answer = serializeChoiceAnswer(field, draft)
  const other = otherDraftOf(field, draft)
  // Serializing a blank Other would silently drop it, so the form asks for
  // the text instead, as the server would. It is also the more precise
  // message for a required field.
  if (other && trimAnswerText(other.other).length === 0)
    return { answer, errors: [{ code: 'blank', message: BLANK_OTHER_MESSAGE }] }
  if (other && exceedsLength(other.other, OTHER_TEXT_MAX))
    return { answer, errors: [{ code: 'too_long', message: lengthLimitMessage(OTHER_TEXT_MAX) }] }
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

// ── the per-type table ───────────────────────────────────────────

type DraftHandler<F extends FormField> = Pick<FieldHandler<F>, 'evaluate' | 'initialDraft'>

/** Every field type's rules: the V1 choice handler plus the six standard fields. */
const HANDLERS: { [T in FormFieldType]: DraftHandler<Extract<FormField, { type: T }>> } = {
  choice: { evaluate: evaluateChoice, initialDraft: choiceInitialDraft },
  ...SCALAR_HANDLERS,
}

/** The handler for a field's type, or `undefined` for a type this component does not know. */
function handlerFor(field: FormField): DraftHandler<FormField> | undefined {
  return (HANDLERS as Record<string, DraftHandler<FormField> | undefined>)[field.type]
}

/**
 * Judges one field's draft: the wire answer (`undefined` = omit it) and any
 * client-side findings. A field of a type this component does not know is
 * omitted without findings (the host shows the "newer version" notice for
 * such a form before any field renders).
 */
export function evaluateField(field: FormField, draft: FieldAnswer | undefined): FieldOutcome {
  return handlerFor(field)?.evaluate(field, draft) ?? { answer: undefined, errors: [] }
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
    const value = serializeFieldAnswer(field, draft[field.id])
    if (value !== undefined)
      out[field.id] = value
  }
  return out
}

/**
 * Client-side findings for every field the current draft plainly fails,
 * keyed by field id (fields with no finding are absent) — a pre-check ahead
 * of the server's own (authoritative) 422 response.
 */
export function validateAnswers(definition: FormDefinition, draft: AnswerDraft): Record<string, FieldError[]> {
  const out: Record<string, FieldError[]> = {}
  for (const field of definition.fields) {
    const { errors } = evaluateField(field, draft[field.id])
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
    const value = draft[field.id]
    const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
    return [field.id, empty ? null : value]
  }))
}

// ── display ──────────────────────────────────────────────────────

/**
 * A stored answer as the Host hands it over. The proxy types up to 0.0.67 name
 * only choice answers; a form with standard fields also stores numbers and
 * booleans.
 */
export type HostFormAnswers = Record<string, ArtifactFormAnswerValue | number | boolean>

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
 * `HostFormAnswers` to the internal `FormAnswers`, where a noted answer
 * always has a non-blank `note`. A number or a boolean is a standard field's
 * answer and stays as it is, `0` and `false` included. Malformed items are
 * dropped, and a single answer that is malformed is left out like an unanswered
 * question.
 */
export function normalizeHostAnswers(data: HostFormAnswers | null): FormAnswers | null {
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
 * Other last, or `null` when the field has no answer or is not a choice.
 * Reads all three wire shapes, so it works for an answer in progress and for
 * `state.data` read back from the server.
 */
export function answerDisplayItems(field: FormField, answer: FieldAnswer | undefined): AnswerDisplayItem[] | null {
  if (answer === undefined || !isChoiceField(field) || typeof answer === 'number' || typeof answer === 'boolean')
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
export type ReadOnlyAnswer
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
  const text = (SCALAR_HANDLERS[field.type] as FieldHandler<FormField>).display(field, answer)
  return text === null ? { kind: 'empty' } : { kind: 'text', text }
}

/**
 * Builds an edit draft from a previously accepted/loaded `FormAnswers`:
 * each field starts from its stored answer, else its definition default.
 */
export function draftFromAnswers(definition: FormDefinition, answers: FormAnswers | null): AnswerDraft {
  const draft: AnswerDraft = {}
  for (const field of definition.fields) {
    const value = handlerFor(field)?.initialDraft(field, answers?.[field.id])
    if (value !== undefined)
      draft[field.id] = value
  }
  return draft
}
