import type { AnswerDraft } from './answers'
import type { FormDefinition, FormField } from './definition'
import { describe, expect, it } from 'vitest'
import { answerDisplayItems, buildNotedValue, fieldsWithBlankOther, fieldsWithOverlongOtherText, isNoteTextTooLong, isOtherTextTooLong, missingRequiredFields, noteTextLength, serializeAnswers, serializeFieldAnswer, trimAnswerText } from './answers'

const definition: FormDefinition = {
  title: 'Form',
  fields: [
    {
      id: 'f1',
      type: 'choice',
      label: 'Single required',
      required: true,
      options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
      multiple: false,
      allow_other: true,
    },
    {
      id: 'f2',
      type: 'choice',
      label: 'Multiple optional',
      required: false,
      options: [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }, { value: 'z', label: 'Z' }],
      multiple: true,
      allow_other: true,
    },
  ],
}

describe('serializeAnswers', () => {
  it('orders keys by definition order, regardless of draft insertion order', () => {
    // f2 is inserted before f1 here — the output must still follow the
    // definition's field order (f1, then f2).
    const draft: AnswerDraft = { f2: ['x'], f1: 'a' }
    const answers = serializeAnswers(definition, draft)
    expect(Object.keys(answers)).toEqual(['f1', 'f2'])
  })

  it('omits fields with no answer', () => {
    const answers = serializeAnswers(definition, {})
    expect(answers).toEqual({})
  })
})

describe('serializeFieldAnswer — single choice', () => {
  const field = definition.fields[0]

  it('carries an "Other" free-text draft as { other: text }', () => {
    expect(serializeFieldAnswer(field, { other: 'custom text' })).toEqual({ other: 'custom text' })
  })

  it('trims the "Other" text and omits it entirely when it trims to empty', () => {
    expect(serializeFieldAnswer(field, { other: '   ' })).toBeUndefined()
    expect(serializeFieldAnswer(field, { other: '  hi  ' })).toEqual({ other: 'hi' })
  })

  it('passes through a valid option value', () => {
    expect(serializeFieldAnswer(field, 'a')).toBe('a')
  })

  it('drops a value that is not one of the field options', () => {
    expect(serializeFieldAnswer(field, 'not-an-option')).toBeUndefined()
  })
})

describe('serializeFieldAnswer — multiple choice', () => {
  const field = definition.fields[1]

  it('keeps definition (option) order, not selection order', () => {
    // Selected in reverse of the definition's option order (y before x).
    const result = serializeFieldAnswer(field, ['y', 'x'])
    expect(result).toEqual(['x', 'y'])
  })

  it('appends an "Other" entry after the ordered option values', () => {
    const result = serializeFieldAnswer(field, ['y', 'x', { other: 'custom' }])
    expect(result).toEqual(['x', 'y', { other: 'custom' }])
  })

  it('omits an "Other" entry that trims to empty', () => {
    const result = serializeFieldAnswer(field, ['x', { other: '   ' }])
    expect(result).toEqual(['x'])
  })

  it('returns undefined when nothing is selected', () => {
    expect(serializeFieldAnswer(field, [])).toBeUndefined()
    expect(serializeFieldAnswer(field, undefined)).toBeUndefined()
  })

  it('ignores option values not defined on the field', () => {
    const result = serializeFieldAnswer(field, ['x', 'not-an-option'])
    expect(result).toEqual(['x'])
  })
})

describe('noteTextLength — Unicode code points, not UTF-16 code units', () => {
  it('counts an astral emoji as one code point even though it is a UTF-16 surrogate pair', () => {
    const emoji = '😀' // 2 UTF-16 code units, 1 code point
    expect(emoji.length).toBe(2)
    expect(noteTextLength(emoji)).toBe(1)
  })
})

describe('trimAnswerText — matches the server\'s trim set exactly', () => {
  // Built from code points rather than literal characters in source, since
  // an ideographic space and a zero-width space are both visually silent
  // and easy to lose or mis-paste in a diff.
  const ideographicSpace = String.fromCharCode(0x3000) // Unicode Zs (Space_Separator) — real whitespace
  const zeroWidthSpace = String.fromCharCode(0x200B) // Unicode Cf (Format) — not whitespace

  it('strips U+3000 IDEOGRAPHIC SPACE: it is real Unicode whitespace', () => {
    expect(trimAnswerText(ideographicSpace + ideographicSpace)).toBe('')
    expect(trimAnswerText(`${ideographicSpace}hi${ideographicSpace}`)).toBe('hi')
  })

  it('does NOT strip U+200B ZERO WIDTH SPACE: Unicode format characters are not whitespace', () => {
    expect(trimAnswerText(zeroWidthSpace)).toBe(zeroWidthSpace)
    expect(trimAnswerText(`${zeroWidthSpace}hi${zeroWidthSpace}`)).toBe(`${zeroWidthSpace}hi${zeroWidthSpace}`)
  })

  it('so a field whose only content is U+3000 counts as blank Other text, but U+200B does not', () => {
    expect(fieldsWithBlankOther(definition, { f1: { other: ideographicSpace } })).toEqual(['f1'])
    expect(fieldsWithBlankOther(definition, { f1: { other: zeroWidthSpace } })).toEqual([])
  })
})

describe('isOtherTextTooLong', () => {
  it('trims outer whitespace before checking the limit', () => {
    const padded = ` ${'a'.repeat(2000)} `
    expect(isOtherTextTooLong(padded)).toBe(false)
  })

  it('flags text over 2,000 code points, counted with emoji as single code points', () => {
    const justOver = `${'😀'.repeat(2000)}x` // 2001 code points
    expect(isOtherTextTooLong(justOver)).toBe(true)
    const exactly = '😀'.repeat(2000) // 2000 code points
    expect(isOtherTextTooLong(exactly)).toBe(false)
  })
})

describe('fieldsWithOverlongOtherText', () => {
  it('reports a single-choice field whose trimmed Other text exceeds the limit', () => {
    const field = definition.fields[0]
    const draft: AnswerDraft = { [field.id]: { other: `${'😀'.repeat(2001)}` } }
    expect(fieldsWithOverlongOtherText(definition, draft)).toEqual([field.id])
  })

  it('reports a multiple-choice field whose Other entry exceeds the limit', () => {
    const field = definition.fields[1]
    const draft: AnswerDraft = { [field.id]: ['x', { other: `${'😀'.repeat(2001)}` }] }
    expect(fieldsWithOverlongOtherText(definition, draft)).toEqual([field.id])
  })

  it('does not report a field with no Other answer, or one within the limit', () => {
    const draft: AnswerDraft = { f1: 'a', f2: ['x', { other: 'short' }] }
    expect(fieldsWithOverlongOtherText(definition, draft)).toEqual([])
  })
})

describe('serializeFieldAnswer — no silent truncation', () => {
  it('passes trimmed Other text through unchanged, without slicing it to 2,000 characters', () => {
    const field = definition.fields[0]
    const long = 'a'.repeat(2500)
    expect(serializeFieldAnswer(field, { other: long })).toEqual({ other: long })
  })
})

describe('missingRequiredFields', () => {
  it('reports a required field with no answer', () => {
    expect(missingRequiredFields(definition, {})).toEqual(['f1'])
  })

  it('does not report an optional field with no answer', () => {
    expect(missingRequiredFields(definition, { f1: 'a' })).toEqual([])
  })

  it('does not report a required field once it has a valid answer', () => {
    expect(missingRequiredFields(definition, { f1: 'a', f2: undefined })).toEqual([])
  })
})

describe('fieldsWithBlankOther', () => {
  it('flags Other selected with blank text, for single and multiple choice, and nothing else', () => {
    expect(fieldsWithBlankOther(definition, { f1: { other: '   ' }, f2: ['x', { other: '' }] })).toEqual(['f1', 'f2'])
    expect(fieldsWithBlankOther(definition, { f1: { other: 'Drone' }, f2: ['x'] })).toEqual([])
    expect(fieldsWithBlankOther(definition, {})).toEqual([])
  })
})

describe('buildNotedValue (question-card notes)', () => {
  it('returns the plain value when the note trims to blank', () => {
    expect(buildNotedValue('a', '   ')).toBe('a')
    expect(buildNotedValue('a', '')).toBe('a')
  })

  it('returns { value, note } with the note trimmed', () => {
    expect(buildNotedValue('a', '  extra context  ')).toEqual({ value: 'a', note: 'extra context' })
  })
})

describe('noteTextLength / isNoteTextTooLong (note limit, server 1,000-code-point cap)', () => {
  it('counts code points the same way for notes as for Other text, with emoji as one code point', () => {
    expect(noteTextLength('😀')).toBe(1)
  })

  it('trims outer whitespace before checking the 1,000-code-point limit', () => {
    const padded = ` ${'a'.repeat(1000)} `
    expect(isNoteTextTooLong(padded)).toBe(false)
  })

  it('flags a note over 1,000 code points, matches at exactly 1,000', () => {
    expect(isNoteTextTooLong('a'.repeat(1001))).toBe(true)
    expect(isNoteTextTooLong('a'.repeat(1000))).toBe(false)
  })
})

describe('serializeFieldAnswer — noted answers (question-card {value, note} round-trip)', () => {
  it('single choice: preserves a valid noted draft, trimming and re-normalizing the note', () => {
    const field = definition.fields[0]
    expect(serializeFieldAnswer(field, { value: 'a', note: '  hi  ' })).toEqual({ value: 'a', note: 'hi' })
  })

  it('single choice: a noted draft whose note trims to blank falls back to the plain value', () => {
    const field = definition.fields[0]
    expect(serializeFieldAnswer(field, { value: 'a', note: '   ' })).toBe('a')
  })

  it('single choice: drops a noted draft for an option that no longer exists', () => {
    const field = definition.fields[0]
    expect(serializeFieldAnswer(field, { value: 'not-an-option', note: 'hi' })).toBeUndefined()
  })

  it('multiple choice: preserves definition order and each item\'s own note', () => {
    const field = definition.fields[1]
    const result = serializeFieldAnswer(field, [{ value: 'y', note: 'why' }, 'x'])
    expect(result).toEqual(['x', { value: 'y', note: 'why' }])
  })
})

describe('answerDisplayItems (review/summary rendering)', () => {
  const field: FormField = {
    id: 'f',
    type: 'choice',
    label: 'Q',
    required: false,
    options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
    multiple: true,
    allow_other: true,
  }

  it('returns null for an undefined answer', () => {
    expect(answerDisplayItems(field, undefined)).toBeNull()
  })

  it('orders items by definition (option) order, not selection order, with Other last', () => {
    const items = answerDisplayItems(field, [{ other: 'mine' }, 'b', 'a'])
    expect(items).toEqual([
      { label: 'Alpha', note: undefined },
      { label: 'Beta', note: undefined },
      { label: 'mine', own: true },
    ])
  })

  it('carries a note through for a {value, note} item', () => {
    const items = answerDisplayItems(field, [{ value: 'a', note: 'context' }])
    expect(items).toEqual([{ label: 'Alpha', note: 'context' }])
  })

  it('single-choice field: a plain string answer', () => {
    const single: FormField = { ...field, multiple: false }
    expect(answerDisplayItems(single, 'a')).toEqual([{ label: 'Alpha', note: undefined }])
  })
})
