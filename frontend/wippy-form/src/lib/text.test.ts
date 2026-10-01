import { describe, expect, it } from 'vitest'
import { codePointLength, hasControlCharacters, isBlank, normalizeNewlines, trimAnswerText } from './text'

describe('trimAnswerText — the server\'s trim set', () => {
  it('strips ECMAScript whitespace at both ends and leaves the inside alone', () => {
    expect(trimAnswerText('  a  b  ')).toBe('a  b')
    expect(trimAnswerText(`${String.fromCharCode(0x3000)}x${String.fromCharCode(0x3000)}`)).toBe('x')
  })

  it('keeps U+200B ZERO WIDTH SPACE, which is not whitespace', () => {
    const zero = String.fromCharCode(0x200B)
    expect(trimAnswerText(zero)).toBe(zero)
  })
})

describe('codePointLength', () => {
  it('counts code points, so an astral character is one', () => {
    expect(codePointLength('😀')).toBe(1)
    expect(codePointLength('a😀b')).toBe(3)
    expect(codePointLength('')).toBe(0)
  })
})

describe('isBlank', () => {
  it('is true for the empty string and for whitespace only', () => {
    expect(isBlank('')).toBe(true)
    expect(isBlank(' \t\n ')).toBe(true)
  })

  it('is false once any non-whitespace character is present, including zero-width ones', () => {
    expect(isBlank(' a ')).toBe(false)
    expect(isBlank(String.fromCharCode(0x200B))).toBe(false)
  })
})

describe('normalizeNewlines', () => {
  it('turns CRLF and a lone CR into LF', () => {
    expect(normalizeNewlines('a\r\nb\rc\nd')).toBe('a\nb\nc\nd')
  })
})

describe('hasControlCharacters', () => {
  it('rejects every C0 character and DEL in single-line text, tab included', () => {
    expect(hasControlCharacters('a\tb', false)).toBe(true)
    expect(hasControlCharacters('a\nb', false)).toBe(true)
    expect(hasControlCharacters('a\u0000b', false)).toBe(true)
    expect(hasControlCharacters('a\u007Fb', false)).toBe(true)
  })

  it('allows tab and line feed in multi-line text, but not other C0 characters or CR', () => {
    expect(hasControlCharacters('a\tb\nc', true)).toBe(false)
    expect(hasControlCharacters('a\u0001b', true)).toBe(true)
    expect(hasControlCharacters('a\rb', true)).toBe(true)
  })

  it('rejects C1, bidi override and isolate controls, and the line and paragraph separators', () => {
    expect(hasControlCharacters('a\u0085b', true)).toBe(true)
    expect(hasControlCharacters('a‮b', true)).toBe(true)
    expect(hasControlCharacters('a⁦b', true)).toBe(true)
    expect(hasControlCharacters('a b', true)).toBe(true)
    expect(hasControlCharacters('a b', true)).toBe(true)
  })

  it('rejects a lone surrogate, which is not valid UTF-8 once encoded', () => {
    expect(hasControlCharacters('a\uD800b', true)).toBe(true)
  })

  it('accepts ordinary text including emoji and accents', () => {
    expect(hasControlCharacters('Zoë 😀 – ok', false)).toBe(false)
  })
})
