import { describe, expect, it } from 'vitest'
import { plainText, richSegments, textLines } from './rich-text'

describe('richSegments', () => {
  it('splits plain text with no backticks into one plain segment', () => {
    expect(richSegments('hello')).toEqual([{ text: 'hello', code: false }])
  })

  it('splits a backtick pair into a code segment', () => {
    expect(richSegments('use `staging` cluster')).toEqual([
      { text: 'use ', code: false },
      { text: 'staging', code: true },
      { text: ' cluster', code: false },
    ])
  })

  it('folds a trailing unmatched backtick back into the preceding plain segment', () => {
    expect(richSegments('a `b` c `d')).toEqual([
      { text: 'a ', code: false },
      { text: 'b', code: true },
      { text: ' c `d', code: false },
    ])
  })
})

describe('plainText', () => {
  it('strips backticks', () => {
    expect(plainText('use `staging`')).toBe('use staging')
  })
})

// Round B, item 3: a multi-line "Own answer" (Other textarea, Shift+Enter)
// must keep its line breaks when displayed back — see textLines' callers
// in question-card-answer-items.vue.
describe('textLines', () => {
  it('splits on \\n', () => {
    expect(textLines('text me\nafter 6')).toEqual(['text me', 'after 6'])
  })

  it('splits on \\r\\n and a lone \\r too', () => {
    expect(textLines('a\r\nb\rc')).toEqual(['a', 'b', 'c'])
  })

  it('returns a single-element array for text with no line break', () => {
    expect(textLines('call after 6 pm')).toEqual(['call after 6 pm'])
  })

  it('preserves a blank line between two others', () => {
    expect(textLines('a\n\nb')).toEqual(['a', '', 'b'])
  })
})
