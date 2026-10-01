import type { FieldAnswer, FormField, SingleFieldAnswer } from './definition'
import { isNotedAnswer, isOtherAnswer } from './definition'

/** The server rejects Other text and notes longer than these, counted in Unicode code points. */
export const OTHER_TEXT_MAX = 2000
export const NOTE_TEXT_MAX = 1000

/**
 * The trim rule for free text, the same plain `trim()` the server applies, so
 * text that trims blank here trims blank there. It strips U+3000 (ideographic
 * space) and keeps U+200B (zero width space).
 */
export function trimAnswerText(raw: string): string {
  return raw.trim()
}

/** True when the trimmed text is longer than `max` code points. An emoji counts as one, as on the server. */
export function exceedsLength(raw: string, max: number): boolean {
  return Array.from(trimAnswerText(raw)).length > max
}

export function lengthLimitMessage(max: number): string {
  return `Use at most ${max.toLocaleString('en-US')} characters.`
}

/** The wire shape of a chosen option: the plain value, or `{ value, note }` once the trimmed note is not blank. */
export function buildNotedValue(value: string, note: string): SingleFieldAnswer {
  const trimmed = trimAnswerText(note)
  return trimmed ? { value, note: trimmed } : value
}

/** One answer shown back to the user in the review step or the answered summary. */
export interface AnswerDisplayItem {
  label: string
  /** The note attached to a chosen option. Never set for `own`. */
  note?: string
  /** True for the free-text Other entry. */
  own?: boolean
}

/**
 * The items of one field's answer, options in definition order and Other last,
 * or `null` when the field has no answer. Reads all three wire shapes, so it
 * works for an answer in progress and for `state.data` read back from the server.
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
  const other = values.find(isOtherAnswer)
  if (other)
    items.push({ label: other.other, own: true })
  return items.length > 0 ? items : null
}
