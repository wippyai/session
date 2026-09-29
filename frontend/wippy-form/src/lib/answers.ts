import type { FieldAnswer, FormAnswers, FormDefinition, FormField, OtherAnswer } from './definition'

/**
 * Client-side answer serialization + a required-field guard, mirroring the
 * answer shapes the Session state API accepts per field. This is a
 * convenience mirror for the UI (canonical ordering, omission of empty
 * optional answers, trimming). It is NOT the authority on validity — the
 * Session state API validates every submission server-side and its errors
 * are what the component ultimately surfaces (422 field and form errors).
 */

const OTHER_TEXT_MAX = 2000

function isOtherDraft(value: unknown): value is OtherAnswer {
  return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as OtherAnswer).other === 'string'
}

/** Draft shape held in the form's local edit state, keyed by field id. */
export type AnswerDraft = Record<string, FieldAnswer | undefined>

function normalizeOtherText(raw: string): string {
  return raw.trim().slice(0, OTHER_TEXT_MAX)
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
    const selected = new Set<string>()
    for (const item of items) {
      if (typeof item === 'string' && optionOrder.includes(item))
        selected.add(item)
    }
    const ordered: Array<string | OtherAnswer> = optionOrder.filter(v => selected.has(v))
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
