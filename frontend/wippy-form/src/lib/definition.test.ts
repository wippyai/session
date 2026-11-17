import { describe, expect, it } from 'vitest'
import { answerHasOption, answerHasOther, answerNoteFor, answerOtherText, choiceDefinition, isNotedAnswer } from './definition'

describe('choiceDefinition', () => {
  const choice = (id: string) => ({ id, type: 'choice' as const, label: id, required: true, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: false })

  it('keeps a choice-only definition as it is (positive control)', () => {
    const definition = { title: 'T', description: 'D', submit_label: 'Send', answered_message: 'Done', fields: [choice('f1'), choice('f2')] }
    expect(choiceDefinition(definition)).toEqual(definition)
  })

  it('leaves out the field kinds of a newer form version and keeps the choice fields in order', () => {
    const definition = {
      title: 'T',
      fields: [
        choice('f1'),
        { id: 't', type: 'text' as const, label: 'Text', required: false, min_length: 0, max_length: 1000 },
        { id: 'n', type: 'number' as const, label: 'Number', required: false, integer: true },
        choice('f2'),
        { id: 'c', type: 'checkbox' as const, label: 'Check', required: false },
      ],
    }
    expect(choiceDefinition(definition)).toEqual({ title: 'T', fields: [choice('f1'), choice('f2')] })
  })

  it('does not mutate its input', () => {
    const definition = { title: 'T', fields: [choice('f1'), { id: 'e', type: 'email' as const, label: 'Email', required: false }] }
    choiceDefinition(definition)
    expect(definition.fields).toHaveLength(2)
  })
})

describe('isNotedAnswer', () => {
  it('is true only for the { value, note } shape', () => {
    expect(isNotedAnswer({ value: 'a', note: 'hi' })).toBe(true)
    expect(isNotedAnswer({ value: 'a', note: '' })).toBe(true)
  })

  it('is false for a plain string, an Other answer, an array, null, or undefined', () => {
    expect(isNotedAnswer('a')).toBe(false)
    expect(isNotedAnswer({ other: 'mine' })).toBe(false)
    expect(isNotedAnswer(['a'])).toBe(false)
    expect(isNotedAnswer(null)).toBe(false)
    expect(isNotedAnswer(undefined)).toBe(false)
  })
})

describe('answerHasOption: reads all three answer shapes', () => {
  it('matches a plain string answer', () => {
    expect(answerHasOption('a', 'a')).toBe(true)
    expect(answerHasOption('a', 'b')).toBe(false)
  })

  it('matches a noted { value, note } answer by its value', () => {
    expect(answerHasOption({ value: 'a', note: 'hi' }, 'a')).toBe(true)
    expect(answerHasOption({ value: 'a', note: 'hi' }, 'b')).toBe(false)
  })

  it('matches within an array of mixed plain and noted items', () => {
    expect(answerHasOption(['a', { value: 'b', note: 'hi' }], 'b')).toBe(true)
    expect(answerHasOption(['a', { value: 'b', note: 'hi' }], 'c')).toBe(false)
  })

  it('never matches an Other answer or undefined', () => {
    expect(answerHasOption({ other: 'mine' }, 'a')).toBe(false)
    expect(answerHasOption(undefined, 'a')).toBe(false)
  })
})

describe('answerNoteFor', () => {
  it('returns the note attached to a specific option value', () => {
    expect(answerNoteFor({ value: 'a', note: 'context' }, 'a')).toBe('context')
    expect(answerNoteFor(['x', { value: 'a', note: 'context' }], 'a')).toBe('context')
  })

  it('returns an empty string when that option has no note, is unanswered, or is a plain/Other answer', () => {
    expect(answerNoteFor('a', 'a')).toBe('')
    expect(answerNoteFor({ value: 'b', note: 'context' }, 'a')).toBe('')
    expect(answerNoteFor({ other: 'mine' }, 'a')).toBe('')
    expect(answerNoteFor(undefined, 'a')).toBe('')
  })
})

describe('answerOtherText / answerHasOther: unaffected by NotedAnswer', () => {
  it('still finds Other text and presence alongside noted items', () => {
    const answer = [{ value: 'a', note: 'hi' }, { other: 'mine' }]
    expect(answerHasOther(answer)).toBe(true)
    expect(answerOtherText(answer)).toBe('mine')
  })

  it('reports no Other for a noted single answer', () => {
    expect(answerHasOther({ value: 'a', note: 'hi' })).toBe(false)
    expect(answerOtherText({ value: 'a', note: 'hi' })).toBe('')
  })
})
