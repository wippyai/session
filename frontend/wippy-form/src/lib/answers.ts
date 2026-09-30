import type { FieldAnswer, FormAnswers, FormDefinition, FormField, NotedAnswer, OtherAnswer, SingleFieldAnswer } from './definition'
import { isNotedAnswer } from './definition'

/**
 * Client-side answer serialization + a required-field guard, mirroring the
 * answer shapes the Session state API accepts per field. This is a
 * convenience mirror for the UI (canonical ordering, omission of empty
 * optional answers, trimming). It is NOT the authority on validity — the
 * Session state API validates every submission server-side and its errors
 * are what the component ultimately surfaces (422 field and form errors).
 */

const OTHER_TEXT_MAX = 2000
/** Server limit for a per-answer note (question-card notes, V1). */
export const NOTE_TEXT_MAX = 1000

function isOtherDraft(value: unknown): value is OtherAnswer {
  return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as OtherAnswer).other === 'string'
}

/** Draft shape held in the form's local edit state, keyed by field id. */
export type AnswerDraft = Record<string, FieldAnswer | undefined>

/**
 * Counts Unicode code points, not UTF-16 code units — a `raw.length` check
 * over-counts astral characters (e.g. many emoji) that are stored as
 * surrogate pairs. The server counts code points too, so this must match.
 */
function codePointLength(raw: string): number {
  return Array.from(raw).length
}

/** True once the trimmed "Other" text exceeds the server's 2,000-code-point limit. */
export function isOtherTextTooLong(raw: string): boolean {
  return codePointLength(trimAnswerText(raw)) > OTHER_TEXT_MAX
}

/** Counts a note's Unicode code points the same way the server does (see `codePointLength`). */
export function noteTextLength(raw: string): number {
  return codePointLength(raw)
}

/** True once the trimmed note exceeds the server's 1,000-code-point limit. */
export function isNoteTextTooLong(raw: string): boolean {
  return codePointLength(trimAnswerText(raw)) > NOTE_TEXT_MAX
}

/**
 * The one client-side trim rule for every blank/length check on free-text
 * answer content — an "Other" answer or a note — used here and by every
 * question-card call site that needs to know whether such text is blank.
 * Plain `String.prototype.trim()`, matching the server's own trim rule, so
 * a string that trims blank here also trims blank there and vice versa.
 * `trim()` strips ECMAScript `WhiteSpace` (e.g. U+3000 IDEOGRAPHIC SPACE, a
 * real space character) but leaves Unicode's own zero-width characters
 * alone (e.g. U+200B ZERO WIDTH SPACE is not whitespace and still counts
 * as content) — see `answers.test.ts`.
 */
export function trimAnswerText(raw: string): string {
  return raw.trim()
}

/**
 * Trims outer whitespace only — never truncates. Truncating silently would
 * submit different text than what the user sees; an over-length "Other"
 * answer must instead be blocked from submission (see
 * `fieldsWithOverlongOtherText`) so the UI can ask the user to shorten it.
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

/**
 * Serializes one field's draft value into the wire `FieldAnswer`, or
 * `undefined` when it should be omitted (unanswered optional field, or a
 * multi-select that normalizes to empty).
 */
export function serializeFieldAnswer(field: FormField, draft: FieldAnswer | undefined): FieldAnswer | undefined {
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
    const otherEntry = items.find(isOtherDraft)
    if (otherEntry) {
      const text = normalizeOtherText(otherEntry.other)
      if (text.length > 0)
        ordered.push({ other: text })
    }
    return ordered.length > 0 ? ordered : undefined
  }

  if (draft === undefined)
    return undefined
  if (isOtherDraft(draft)) {
    const text = normalizeOtherText(draft.other)
    return text.length > 0 ? { other: text } : undefined
  }
  if (isNotedAnswer(draft) && field.options.some(o => o.value === draft.value))
    return buildNotedValue(draft.value, draft.note)
  if (typeof draft === 'string' && field.options.some(o => o.value === draft))
    return draft
  return undefined
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
 * Field ids whose `required` rule the current draft plainly fails — used
 * to guard the Submit button and pick which field gets focus, ahead of the
 * server's own (authoritative) 422 response.
 */
export function missingRequiredFields(definition: FormDefinition, draft: AnswerDraft): string[] {
  const missing: string[] = []
  for (const field of definition.fields) {
    if (!field.required)
      continue
    if (serializeFieldAnswer(field, draft[field.id]) === undefined)
      missing.push(field.id)
  }
  return missing
}

/** The "Other" draft of a field (single or multiple choice), if Other is selected. */
function otherDraftOf(field: FormField, value: FieldAnswer | undefined): OtherAnswer | undefined {
  if (field.multiple)
    return Array.isArray(value) ? value.find(isOtherDraft) : undefined
  return isOtherDraft(value) ? value : undefined
}

/**
 * Field ids where "Other" is selected but its text is blank once trimmed.
 * Serializing would silently drop that answer, so the form asks for the
 * text instead, as the server would ("Enter the other answer.").
 */
export function fieldsWithBlankOther(definition: FormDefinition, draft: AnswerDraft): string[] {
  const invalid: string[] = []
  for (const field of definition.fields) {
    const other = otherDraftOf(field, draft[field.id])
    if (other && normalizeOtherText(other.other).length === 0)
      invalid.push(field.id)
  }
  return invalid
}

/**
 * Field ids whose "Other" free-text draft exceeds the 2,000-code-point limit
 * once trimmed — checked ahead of the server's own (authoritative) 422
 * response, the same way `missingRequiredFields` pre-checks `required`.
 */
export function fieldsWithOverlongOtherText(definition: FormDefinition, draft: AnswerDraft): string[] {
  const invalid: string[] = []
  for (const field of definition.fields) {
    const value = draft[field.id]
    let otherText: string | undefined
    if (field.multiple) {
      if (Array.isArray(value)) {
        const found = value.find(isOtherDraft)
        if (found)
          otherText = found.other
      }
    }
    else if (isOtherDraft(value)) {
      otherText = value.other
    }
    if (otherText !== undefined && isOtherTextTooLong(otherText))
      invalid.push(field.id)
  }
  return invalid
}

/** One answer shown back to the user — the review step, the post-submit summary, or a read-only field. */
export interface AnswerDisplayItem {
  label: string
  /** A note attached to this chosen option, if any (never set for `own`). */
  note?: string
  /** True for the free-text "Other" entry, shown as "Own answer: …". */
  own?: boolean
}

/**
 * Display items for one field's answer — options in definition order, Other
 * last — or `null` when the field has no answer at all. Reads all three
 * wire shapes (`answerNoteFor`/`isNotedAnswer` in `definition.ts` back
 * this), so it works for a live in-progress answer and for `state.data`
 * read back from the server alike.
 */
export function answerDisplayItems(field: FormField, answer: FieldAnswer | undefined): AnswerDisplayItem[] | null {
  if (answer === undefined)
    return null
  const values = Array.isArray(answer) ? answer : [answer]
  const items: AnswerDisplayItem[] = []
  for (const option of field.options) {
    const match = values.find(v => (typeof v === 'string' ? v === option.value : isNotedAnswer(v) && v.value === option.value))
    if (match)
      items.push({ label: option.label, note: isNotedAnswer(match) ? match.note : undefined })
  }
  const other = values.find(isOtherDraft)
  if (other)
    items.push({ label: other.other, own: true })
  return items.length > 0 ? items : null
}

/** Builds an edit draft from a previously accepted/loaded `FormAnswers`. */
export function draftFromAnswers(definition: FormDefinition, answers: FormAnswers | null): AnswerDraft {
  const draft: AnswerDraft = {}
  if (!answers)
    return draft
  for (const field of definition.fields) {
    const value = answers[field.id]
    if (value === undefined)
      continue
    draft[field.id] = field.multiple
      ? (Array.isArray(value) ? [...value] : [value])
      : value
  }
  return draft
}
