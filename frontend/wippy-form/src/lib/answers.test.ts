import type { AnswerDraft } from './answers'
import type { FormDefinition, FormField } from './definition'
import { describe, expect, it } from 'vitest'
import { answerDisplayItems, buildNotedValue, draftFromAnswers, draftSignature, evaluateField, exceedsLength, normalizeHostAnswers, NOTE_TEXT_MAX, OTHER_TEXT_MAX, readOnlyAnswer, serializeAnswers, serializeFieldAnswer, validateAnswers } from './answers'
import { lengthLimitMessage } from './text'

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

describe('serializeAnswers', () => {
  it('orders keys by definition order, regardless of draft insertion order', () => {
    // f2 is inserted before f1 here, and the output still follows the
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

describe('validateAnswers — the trim set of an Other text', () => {
  // Built from code points because both characters are invisible and easy to
  // lose in a diff.
  const ideographicSpace = String.fromCharCode(0x3000) // Unicode Zs, real whitespace
  const zeroWidthSpace = String.fromCharCode(0x200B) // Unicode Cf, not whitespace

  it('counts an Other text of only U+3000 as blank, and one of only U+200B as text', () => {
    expect(validateAnswers(definition, { f1: { other: ideographicSpace } }).f1?.map(e => e.code)).toEqual(['blank'])
    expect(validateAnswers(definition, { f1: { other: zeroWidthSpace } })).toEqual({})
  })
})

describe('validateAnswers — an over-long Other text', () => {
  const codes = (draft: AnswerDraft) => Object.fromEntries(Object.entries(validateAnswers(definition, draft)).map(([id, errors]) => [id, errors.map(e => e.code)]))

  it('reports a single-choice field whose trimmed Other text exceeds the limit', () => {
    expect(codes({ f1: { other: `${'😀'.repeat(2001)}` } })).toEqual({ f1: ['too_long'] })
  })

  it('reports a multiple-choice field whose Other entry exceeds the limit', () => {
    expect(codes({ f1: 'a', f2: ['x', { other: `${'😀'.repeat(2001)}` }] })).toEqual({ f2: ['too_long'] })
  })

  it('does not report a field with no Other answer, or one within the limit', () => {
    expect(codes({ f1: 'a', f2: ['x', { other: 'short' }] })).toEqual({})
    expect(codes({ f1: { other: '😀'.repeat(2000) } })).toEqual({})
  })
})

describe('serializeFieldAnswer — no silent truncation', () => {
  it('passes trimmed Other text through unchanged, without slicing it to 2,000 characters', () => {
    const field = definition.fields[0]
    const long = 'a'.repeat(2500)
    expect(serializeFieldAnswer(field, { other: long })).toEqual({ other: long })
  })
})

describe('validateAnswers — required choices', () => {
  const codes = (draft: AnswerDraft) => Object.fromEntries(Object.entries(validateAnswers(definition, draft)).map(([id, errors]) => [id, errors.map(e => e.code)]))

  it('reports a required field with no answer', () => {
    expect(codes({})).toEqual({ f1: ['required'] })
  })

  it('does not report an optional field with no answer', () => {
    expect(codes({ f1: 'a' })).toEqual({})
  })

  it('does not report a required field once it has a valid answer', () => {
    expect(codes({ f1: 'a', f2: undefined })).toEqual({})
  })
})

describe('validateAnswers — Other selected with blank text', () => {
  const codes = (draft: AnswerDraft) => Object.fromEntries(Object.entries(validateAnswers(definition, draft)).map(([id, errors]) => [id, errors.map(e => e.code)]))

  it('flags it for single and multiple choice, and nothing else', () => {
    expect(codes({ f1: { other: '   ' }, f2: ['x', { other: '' }] })).toEqual({ f1: ['blank'], f2: ['blank'] })
    expect(codes({ f1: { other: 'Drone' }, f2: ['x'] })).toEqual({})
  })

  it('asks for the text rather than "required" when the Other is the whole answer to a required field', () => {
    expect(codes({ f1: { other: '' } })).toEqual({ f1: ['blank'] })
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

describe('normalizeHostAnswers', () => {
  it('keeps a { value, note } answer with a non-blank note as a noted answer (positive control)', () => {
    expect(normalizeHostAnswers({ f1: { value: 'a', note: 'extra context' } })).toEqual({ f1: { value: 'a', note: 'extra context' } })
  })

  it('turns a { value } object without a note, or with a blank note, into the plain value', () => {
    expect(normalizeHostAnswers({ f1: { value: 'a' }, f2: { value: 'b', note: '' }, f3: { value: 'c', note: '   ' } }))
      .toEqual({ f1: 'a', f2: 'b', f3: 'c' })
  })

  it('keeps number and boolean answers exactly', () => {
    const stored = { parcels: 0, agreed: false, news: true, count: 3 }
    const normalized = normalizeHostAnswers(stored)
    expect(normalized).toEqual(stored)
    expect(normalized?.parcels).toBe(0)
    expect(normalized?.agreed).toBe(false)
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

// ── V2 standard fields: the per-type table ───────────────────────────

const v2Definition: FormDefinition = {
  title: 'Delivery',
  fields: [
    { id: 'name', type: 'text', min_length: 0, max_length: 500, label: 'Name', required: true },
    { id: 'notes', type: 'textarea', min_length: 0, max_length: 8000, label: 'Notes', required: false },
    { id: 'mail', type: 'email', label: 'Email', required: true },
    { id: 'count', type: 'number', label: 'Parcels', required: false, integer: true, min: 1, max: 9 },
    { id: 'day', type: 'date', label: 'Day', required: false },
    { id: 'consent', type: 'checkbox', label: 'Consent', required: true },
    { id: 'pick', type: 'choice', label: 'Speed', required: false, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: false },
  ],
}

describe('evaluateField — dispatches on the field type', () => {
  it('judges a choice field with the V1 rules', () => {
    const pick = v2Definition.fields[6]
    expect(evaluateField(pick, 'a')).toEqual({ answer: 'a', errors: [] })
    expect(evaluateField(pick, undefined)).toEqual({ answer: undefined, errors: [] })
  })

  it('reports a required choice with no answer as required, and a blank Other as blank', () => {
    const required: FormField = { id: 'c', type: 'choice', label: 'C', required: true, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: true }
    expect(evaluateField(required, undefined).errors.map(e => e.code)).toEqual(['required'])
    expect(evaluateField(required, { other: '  ' }).errors.map(e => e.code)).toEqual(['blank'])
    expect(evaluateField(required, { other: 'x'.repeat(2001) }).errors.map(e => e.code)).toEqual(['too_long'])
  })

  it('judges the six standard fields', () => {
    expect(evaluateField(v2Definition.fields[0], ' Ada ')).toEqual({ answer: ' Ada ', errors: [] })
    expect(evaluateField(v2Definition.fields[3], '4')).toEqual({ answer: 4, errors: [] })
    expect(evaluateField(v2Definition.fields[5], true)).toEqual({ answer: true, errors: [] })
  })

  it('omits a field of a type this component does not know, with no findings', () => {
    const future = { id: 'z', type: 'slider', label: 'Z', required: true } as unknown as FormField
    expect(evaluateField(future, '5')).toEqual({ answer: undefined, errors: [] })
  })
})

describe('serializeAnswers — V2 fields', () => {
  it('sends text as typed, numbers as numbers and checkboxes as explicit booleans, in definition order', () => {
    const answers = serializeAnswers(v2Definition, {
      consent: true,
      count: '3',
      mail: ' ada@example.com ',
      name: '  Ada  ',
      day: '2026-10-01',
      notes: 'line one\nline two',
    })
    expect(Object.keys(answers)).toEqual(['name', 'notes', 'mail', 'count', 'day', 'consent'])
    expect(answers).toEqual({
      name: '  Ada  ',
      notes: 'line one\nline two',
      mail: 'ada@example.com',
      count: 3,
      day: '2026-10-01',
      consent: true,
    })
  })

  it('omits blank optional fields but still sends an unchecked optional checkbox as false', () => {
    const optionalConsent: FormDefinition = { title: 'T', fields: [
      { id: 'a', type: 'text', min_length: 0, max_length: 500, label: 'A', required: false },
      { id: 'b', type: 'checkbox', label: 'B', required: false },
    ] }
    expect(serializeAnswers(optionalConsent, { a: '   ' })).toEqual({ b: false })
  })

  it('serializes one field through serializeFieldAnswer for any type', () => {
    expect(serializeFieldAnswer(v2Definition.fields[3], '7')).toBe(7)
    expect(serializeFieldAnswer(v2Definition.fields[3], 'seven')).toBeUndefined()
  })
})

describe('validateAnswers — client findings by field id', () => {
  it('returns nothing for a valid form', () => {
    expect(validateAnswers(v2Definition, { name: 'Ada', mail: 'a@b.co', consent: true })).toEqual({})
  })

  it('reports every failing field with its own code and a message that does not echo the value', () => {
    const typed = { name: '', mail: 'not-an-email', count: '12', day: 'tomorrow', consent: false }
    const errors = validateAnswers(v2Definition, typed)
    expect(Object.keys(errors)).toEqual(['name', 'mail', 'count', 'day', 'consent'])
    expect(errors.name[0].code).toBe('required')
    expect(errors.mail[0].code).toBe('invalid_email')
    expect(errors.count[0].code).toBe('above_max')
    expect(errors.day[0].code).toBe('invalid_date')
    expect(errors.consent[0].code).toBe('required')
    for (const list of Object.values(errors)) {
      for (const error of list) {
        expect(error.message).not.toContain('not-an-email')
        expect(error.message).not.toContain('tomorrow')
      }
    }
  })
})

describe('validateAnswers — required V2 fields', () => {
  const required = (draft: AnswerDraft) => Object.entries(validateAnswers(v2Definition, draft)).filter(([, errors]) => errors.some(e => e.code === 'required')).map(([id]) => id)

  it('counts a whitespace-only required text and an unchecked required checkbox as missing', () => {
    expect(required({ name: '  ', mail: 'a@b.co', consent: false })).toEqual(['name', 'consent'])
  })

  it('does not count an invalid but filled field as missing', () => {
    expect(required({ name: 'Ada', mail: 'broken', consent: true })).toEqual([])
  })
})

describe('draftFromAnswers — defaults and stored answers', () => {
  const withDefaults: FormDefinition = { title: 'T', fields: [
    { id: 'city', type: 'text', min_length: 0, max_length: 500, label: 'City', required: false, default: 'Berlin' },
    { id: 'qty', type: 'number', label: 'Qty', required: false, default: 3 },
    { id: 'ok', type: 'checkbox', label: 'OK', required: false, default: false },
    { id: 'plain', type: 'text', min_length: 0, max_length: 500, label: 'Plain', required: false },
    { id: 'pick', type: 'choice', label: 'Pick', required: false, options: [{ value: 'a', label: 'A' }], multiple: true, allow_other: false },
  ] }

  it('prefills defaults and starts a checkbox unchecked', () => {
    expect(draftFromAnswers(withDefaults, null)).toEqual({ city: 'Berlin', qty: '3', ok: false })
  })

  it('lets stored answers win over defaults and keeps the V1 choice draft shape', () => {
    expect(draftFromAnswers(withDefaults, { city: 'Paris', qty: 8, ok: true, pick: 'a' })).toEqual({ city: 'Paris', qty: '8', ok: true, pick: ['a'] })
  })

  it('submits a prefilled default unless the user clears it', () => {
    const draft = draftFromAnswers(withDefaults, null)
    expect(serializeAnswers(withDefaults, draft)).toEqual({ city: 'Berlin', qty: 3, ok: false })
    expect(serializeAnswers(withDefaults, { ...draft, city: '' })).toEqual({ qty: 3, ok: false })
  })
})

describe('draftSignature — has the user changed anything?', () => {
  const signature = (draft: AnswerDraft) => draftSignature(v2Definition, draft)

  it('is the same for drafts that differ only in key order or in empty values', () => {
    expect(signature({ name: 'Ada', mail: 'a@b.co' })).toBe(signature({ mail: 'a@b.co', name: 'Ada' }))
    expect(signature({ name: '' })).toBe(signature({}))
    expect(signature({ pick: [] })).toBe(signature({ pick: undefined }))
  })

  it('differs once any value, including an invalid or false one, is set', () => {
    expect(signature({ name: 'Ada' })).not.toBe(signature({}))
    expect(signature({ mail: 'half-typed' })).not.toBe(signature({}))
    expect(signature({ consent: false })).not.toBe(signature({}))
    expect(signature({ consent: true })).not.toBe(signature({ consent: false }))
  })
})

describe('readOnlyAnswer — what a read-only field shows', () => {
  it('shows text with its line breaks, a number as stored, a date as ISO text and a checkbox as Yes or No', () => {
    expect(readOnlyAnswer(v2Definition.fields[1], 'a\nb')).toEqual({ kind: 'text', text: 'a\nb' })
    expect(readOnlyAnswer(v2Definition.fields[3], 4)).toEqual({ kind: 'text', text: '4' })
    expect(readOnlyAnswer(v2Definition.fields[4], '2026-10-01')).toEqual({ kind: 'text', text: '2026-10-01' })
    expect(readOnlyAnswer(v2Definition.fields[5], true)).toEqual({ kind: 'text', text: 'Yes' })
    expect(readOnlyAnswer(v2Definition.fields[5], false)).toEqual({ kind: 'text', text: 'No' })
  })

  it('shows an unanswered field as empty', () => {
    for (const field of v2Definition.fields)
      expect(readOnlyAnswer(field, undefined), field.id).toEqual({ kind: 'empty' })
  })

  it('shows a choice answer as display items, keeping a note and an Other entry', () => {
    const pick: FormField = { id: 'p', type: 'choice', label: 'P', required: false, options: [{ value: 'a', label: 'Alpha' }], multiple: true, allow_other: true }
    expect(readOnlyAnswer(pick, [{ value: 'a', note: 'because' }, { other: 'mine' }])).toEqual({
      kind: 'choice',
      items: [{ label: 'Alpha', note: 'because' }, { label: 'mine', own: true }],
    })
  })
})

