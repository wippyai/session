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
 * Client-side answer rules and serialization, one handler per field type,
 * mirroring the answer shapes and rules the Session state API applies. This
 * is a convenience mirror for the UI (canonical ordering, omission of empty
 * optional answers, trimming, an early error before a round trip). It is NOT
 * the authority on validity — the Session state API validates every
 * submission server-side and its errors are what the component ultimately
 * surfaces (422 field and form errors).
 *
 * The choice rules live here; the six V2 standard fields live in
 * `scalar-answers.ts` and are added to the same table (`HANDLERS`).
 */

const OTHER_TEXT_MAX = 2000
/** Server limit for a per-answer note (question-card notes, V1). */
export const NOTE_TEXT_MAX = 1000

const BLANK_OTHER_MESSAGE = 'Enter the other answer.'
const TOO_LONG_MESSAGE = 'Use at most 2,000 characters.'

/**
 * Draft shape held in the form's local edit state, keyed by field id: the
 * raw value of each control (a choice answer, the typed text of a text-like
 * or number field, a checkbox's boolean).
 */
export type AnswerDraft = Record<string, FieldAnswer | undefined>

/** True once the trimmed "Other" text exceeds the server's 2,000-code-point limit. */
export function isOtherTextTooLong(raw: string): boolean {
  return codePointLength(trimAnswerText(raw)) > OTHER_TEXT_MAX
}

/** True once the trimmed note exceeds the server's 1,000-code-point limit. */
export function isNoteTextTooLong(raw: string): boolean {
  return codePointLength(trimAnswerText(raw)) > NOTE_TEXT_MAX
}

/**
 * Trims outer whitespace only — never truncates. Truncating silently would
 * submit different text than what the user sees; an over-length "Other"
 * answer must instead be blocked from submission (see `evaluateChoice`) so the
 * UI can ask the user to shorten it.
 */
function normalizeOtherText(raw: string): string {
  return trimAnswerText(raw)
}

/** Same trimming rule as `normalizeOtherText`, named for notes at call sites. */
export function normalizeNote(raw: string): string {
  return trimAnswerText(raw)
}

/**
 * Builds the wire shape for one chosen option: the plain value when it has
 * no note, or `{ value, note }` once a trimmed, non-blank note is attached.
 * Mirrors the server contract (blank notes come back as the plain string).
 */
export function buildNotedValue(value: string, note: string): SingleFieldAnswer {
  const trimmed = normalizeNote(note)
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
      const text = normalizeOtherText(otherEntry.other)
      if (text.length > 0)
        ordered.push({ other: text })
    }
    return ordered.length > 0 ? ordered : undefined
  }

  if (draft === undefined || typeof draft === 'number' || typeof draft === 'boolean' || Array.isArray(draft))
    return undefined
  if (isOtherAnswer(draft)) {
    const text = normalizeOtherText(draft.other)
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
  if (other && normalizeOtherText(other.other).length === 0)
    return { answer, errors: [{ code: 'blank', message: BLANK_OTHER_MESSAGE }] }
  if (other && isOtherTextTooLong(other.other))
    return { answer, errors: [{ code: 'too_long', message: TOO_LONG_MESSAGE }] }
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

/** One answer shown back to the user — the review step, the post-submit summary, or a read-only field. */
export interface AnswerDisplayItem {
  label: string
  /** A note attached to this chosen option, if any (never set for `own`). */
  note?: string
  /** True for the free-text "Other" entry, shown as "Own answer: …". */
  own?: boolean
}

/**
 * Display items for one choice field's answer — options in definition order,
 * Other last — or `null` when the field has no answer at all (or is not a
 * choice field). Reads all three wire shapes (`answerNoteFor`/`isNotedAnswer`
 * in `definition.ts` back this), so it works for a live in-progress answer
 * and for `state.data` read back from the server alike.
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
