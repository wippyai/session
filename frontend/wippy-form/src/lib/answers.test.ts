import type { FormField } from './definition'
import { describe, expect, it } from 'vitest'
import { answerDisplayItems, buildNotedValue, exceedsLength, lengthLimitMessage, normalizeHostAnswers, NOTE_TEXT_MAX, OTHER_TEXT_MAX, trimAnswerText } from './answers'

describe('trimAnswerText', () => {
  // Built from code points because both characters are invisible and easy to
  // lose in a diff.
  const ideographicSpace = String.fromCharCode(0x3000) // Unicode Zs, real whitespace
  const zeroWidthSpace = String.fromCharCode(0x200B) // Unicode Cf, not whitespace

  it('strips U+3000 IDEOGRAPHIC SPACE, which is whitespace', () => {
    expect(trimAnswerText(ideographicSpace + ideographicSpace)).toBe('')
    expect(trimAnswerText(`${ideographicSpace}hi${ideographicSpace}`)).toBe('hi')
  })

  it('keeps U+200B ZERO WIDTH SPACE, which is not whitespace', () => {
    expect(trimAnswerText(zeroWidthSpace)).toBe(zeroWidthSpace)
    expect(trimAnswerText(`${zeroWidthSpace}hi${zeroWidthSpace}`)).toBe(`${zeroWidthSpace}hi${zeroWidthSpace}`)
  })
})

describe('exceedsLength', () => {
  it('trims outer whitespace before comparing', () => {
    expect(exceedsLength(` ${'a'.repeat(OTHER_TEXT_MAX)} `, OTHER_TEXT_MAX)).toBe(false)
    expect(exceedsLength(` ${'a'.repeat(NOTE_TEXT_MAX)} `, NOTE_TEXT_MAX)).toBe(false)
  })

  it('counts an emoji as one code point, although it is two UTF-16 code units', () => {
    expect('😀'.length).toBe(2)
    expect(exceedsLength('😀'.repeat(OTHER_TEXT_MAX), OTHER_TEXT_MAX)).toBe(false)
    expect(exceedsLength(`${'😀'.repeat(OTHER_TEXT_MAX)}x`, OTHER_TEXT_MAX)).toBe(true)
  })

  it('is false at the limit and true one code point over it', () => {
    expect(exceedsLength('a'.repeat(NOTE_TEXT_MAX), NOTE_TEXT_MAX)).toBe(false)
    expect(exceedsLength('a'.repeat(NOTE_TEXT_MAX + 1), NOTE_TEXT_MAX)).toBe(true)
  })
})

describe('lengthLimitMessage', () => {
  it('names the limit with a thousands separator', () => {
    expect(lengthLimitMessage(OTHER_TEXT_MAX)).toBe('Use at most 2,000 characters.')
    expect(lengthLimitMessage(NOTE_TEXT_MAX)).toBe('Use at most 1,000 characters.')
  })
})

describe('buildNotedValue', () => {
  it('returns the plain value when the note trims to blank', () => {
    expect(buildNotedValue('a', '   ')).toBe('a')
    expect(buildNotedValue('a', '')).toBe('a')
  })

  it('returns { value, note } with the note trimmed', () => {
    expect(buildNotedValue('a', '  extra context  ')).toEqual({ value: 'a', note: 'extra context' })
  })
})

describe('normalizeHostAnswers', () => {
  it('keeps a { value, note } answer with a non-blank note as a noted answer (positive control)', () => {
    expect(normalizeHostAnswers({ f1: { value: 'a', note: 'extra context' } })).toEqual({ f1: { value: 'a', note: 'extra context' } })
  })

  it('turns a { value } object without a note, or with a blank note, into the plain value', () => {
    expect(normalizeHostAnswers({ f1: { value: 'a' }, f2: { value: 'b', note: '' }, f3: { value: 'c', note: '   ' } }))
      .toEqual({ f1: 'a', f2: 'b', f3: 'c' })
  })

  it('passes plain strings and Other answers through', () => {
    expect(normalizeHostAnswers({ f1: 'a', f2: { other: 'mine' } })).toEqual({ f1: 'a', f2: { other: 'mine' } })
  })

  it('normalizes each item of a several-answer field and keeps their order', () => {
    expect(normalizeHostAnswers({ f1: ['a', { value: 'b', note: 'why' }, { value: 'c' }, { other: 'mine' }] }))
      .toEqual({ f1: ['a', { value: 'b', note: 'why' }, 'c', { other: 'mine' }] })
  })

  it('returns null for no stored answers and an empty record for an empty one', () => {
    expect(normalizeHostAnswers(null)).toBeNull()
    expect(normalizeHostAnswers({})).toEqual({})
  })

  it('drops a malformed single answer and malformed list items', () => {
    const malformed = { nope: 1 } as never
    expect(normalizeHostAnswers({ f1: malformed, f2: ['a', malformed, null as never, { value: 7 } as never] }))
      .toEqual({ f2: ['a'] })
  })

  it('does not mutate its input', () => {
    const input = { f1: { value: 'a' } }
    normalizeHostAnswers(input)
    expect(input).toEqual({ f1: { value: 'a' } })
  })
})

describe('answerDisplayItems', () => {
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

  it('orders items by option order, not selection order, with Other last', () => {
    expect(answerDisplayItems(field, [{ other: 'mine' }, 'b', 'a'])).toEqual([
      { label: 'Alpha', note: undefined },
      { label: 'Beta', note: undefined },
      { label: 'mine', own: true },
    ])
  })

  it('carries the note of a { value, note } item', () => {
    expect(answerDisplayItems(field, [{ value: 'a', note: 'context' }])).toEqual([{ label: 'Alpha', note: 'context' }])
  })

  it('reads a plain string answer for a single-choice field', () => {
    expect(answerDisplayItems({ ...field, multiple: false }, 'a')).toEqual([{ label: 'Alpha', note: undefined }])
  })
})
