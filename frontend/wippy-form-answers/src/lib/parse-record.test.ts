import { describe, expect, it } from 'vitest'
import { parseFormAnswersRecord } from './parse-record'

describe('parseFormAnswersRecord', () => {
  it('parses a valid answer record', () => {
    const json = JSON.stringify({
      form_id: 'f1',
      form_version: 1,
      title: 'Order details',
      late: false,
      answers: {
        delivery: { question: 'How should the parcel be delivered?', answer: { value: 'courier', label: 'Courier', note: 'Buzzer 12' } },
        when: { question: 'When works best?', answer: null },
      },
    })
    expect(parseFormAnswersRecord(json)).toEqual(JSON.parse(json))
  })

  it('trims surrounding whitespace before parsing', () => {
    expect(parseFormAnswersRecord('\n  {"form_id":"f1"}  \n')).toEqual({ form_id: 'f1' })
  })

  it('returns null for invalid JSON', () => {
    expect(parseFormAnswersRecord('{not valid json')).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(parseFormAnswersRecord('')).toBeNull()
  })

  it('returns null for whitespace-only content', () => {
    expect(parseFormAnswersRecord('   \n\t  ')).toBeNull()
  })

  it('returns null for null or undefined input', () => {
    expect(parseFormAnswersRecord(null)).toBeNull()
    expect(parseFormAnswersRecord(undefined)).toBeNull()
  })

  it('returns null for a JSON array', () => {
    expect(parseFormAnswersRecord('[1,2,3]')).toBeNull()
  })

  it('returns null for the JSON literal null', () => {
    expect(parseFormAnswersRecord('null')).toBeNull()
  })

  it('returns null for JSON primitives', () => {
    expect(parseFormAnswersRecord('"just a string"')).toBeNull()
    expect(parseFormAnswersRecord('42')).toBeNull()
    expect(parseFormAnswersRecord('true')).toBeNull()
  })
})
