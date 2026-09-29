import type { AnswerDraft } from './answers'
import type { FormDefinition } from './definition'
import { describe, expect, it } from 'vitest'
import { missingRequiredFields, serializeAnswers, serializeFieldAnswer } from './answers'

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
