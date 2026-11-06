import { describe, expect, it } from 'vitest'
import { isOnStep, NUMBER_ABS_MAX, numberToPlainText, parseNumberText } from './decimal'

describe('parseNumberText — digits a JSON number cannot hold', () => {
  it('refuses a value that does not read back from a JSON number as written', () => {
    expect(parseNumberText('2.00000000000000001')).toEqual({ kind: 'invalid' })
    expect(parseNumberText('999999999999.99999')).toEqual({ kind: 'invalid' })
    expect(parseNumberText('-999999999999.99999')).toEqual({ kind: 'invalid' })
    expect(parseNumberText('0.1234567890123456789')).toEqual({ kind: 'invalid' })
    expect(parseNumberText(`0.${'0'.repeat(400)}1`)).toEqual({ kind: 'invalid' })
  })

  it('keeps a value whose spelling differs only by zeros it does not need', () => {
    expect(parseNumberText('1.50')).toEqual({ kind: 'number', value: 1.5 })
    expect(parseNumberText('007')).toEqual({ kind: 'number', value: 7 })
    expect(parseNumberText('5.')).toEqual({ kind: 'number', value: 5 })
    expect(parseNumberText('-0')).toEqual({ kind: 'number', value: 0 })
    expect(parseNumberText('-0.000')).toEqual({ kind: 'number', value: 0 })
    expect(parseNumberText('0.0000001')).toEqual({ kind: 'number', value: 1e-7 })
    expect(parseNumberText('0.30000000000000004')).toEqual({ kind: 'number', value: 0.30000000000000004 })
    expect(parseNumberText('1000000000000')).toEqual({ kind: 'number', value: 1e12 })
  })
})

describe('parseNumberText — strict: dot decimal, optional minus, no separators', () => {
  it('parses integers and decimals', () => {
    expect(parseNumberText('12')).toEqual({ kind: 'number', value: 12 })
    expect(parseNumberText('-3.5')).toEqual({ kind: 'number', value: -3.5 })
    expect(parseNumberText('0.25')).toEqual({ kind: 'number', value: 0.25 })
    expect(parseNumberText('3.0')).toEqual({ kind: 'number', value: 3 })
  })

  it('trims outer whitespace and reports empty for blank text', () => {
    expect(parseNumberText('  7  ')).toEqual({ kind: 'number', value: 7 })
    expect(parseNumberText('')).toEqual({ kind: 'empty' })
    expect(parseNumberText('   ')).toEqual({ kind: 'empty' })
  })

  it('accepts a bare leading or trailing dot', () => {
    expect(parseNumberText('.5')).toEqual({ kind: 'number', value: 0.5 })
    expect(parseNumberText('5.')).toEqual({ kind: 'number', value: 5 })
  })

  it('never returns negative zero', () => {
    const parsed = parseNumberText('-0')
    expect(parsed).toEqual({ kind: 'number', value: 0 })
    expect(Object.is((parsed as { value: number }).value, -0)).toBe(false)
  })

  it('rejects group separators, comma decimals, exponents, signs, spaces inside and words', () => {
    for (const bad of ['1,000', '1,5', '1 000', '1e3', '+5', '--5', '1.2.3', 'abc', '1a', '0x10', '١٢', '1_000', '-', '.', '−5'])
      expect(parseNumberText(bad), bad).toEqual({ kind: 'invalid' })
  })

  it('rejects text too long to be a finite number', () => {
    expect(parseNumberText('9'.repeat(400))).toEqual({ kind: 'invalid' })
  })
})

describe('NUMBER_ABS_MAX', () => {
  it('is 1e12', () => {
    expect(NUMBER_ABS_MAX).toBe(1e12)
  })
})

describe('numberToPlainText — the number as stored, never in exponent form', () => {
  it('writes integers and plain decimals the way JSON does', () => {
    expect(numberToPlainText(3)).toBe('3')
    expect(numberToPlainText(0.1)).toBe('0.1')
    expect(numberToPlainText(-12.75)).toBe('-12.75')
    expect(numberToPlainText(0)).toBe('0')
  })

  it('expands small and large exponents', () => {
    expect(numberToPlainText(1e-7)).toBe('0.0000001')
    expect(numberToPlainText(-1.5e-7)).toBe('-0.00000015')
    expect(numberToPlainText(1e21)).toBe('1000000000000000000000')
    expect(numberToPlainText(1.25e22)).toBe('12500000000000000000000')
  })
})

describe('isOnStep — exact decimal arithmetic, no floating modulus', () => {
  it('accepts the classic floating-point trap values', () => {
    expect(isOnStep(0.3, 0, 0.1)).toBe(true)
    expect(isOnStep(0.7, 0, 0.1)).toBe(true)
    expect(isOnStep(1.1, 0, 0.1)).toBe(true)
    expect(isOnStep(0.6, 0, 0.2)).toBe(true)
  })

  it('rejects values off the step with no tolerance', () => {
    expect(isOnStep(0.35, 0, 0.1)).toBe(false)
    expect(isOnStep(0.30000000000000004, 0, 0.1)).toBe(false)
    expect(isOnStep(1, 0, 0.3)).toBe(false)
  })

  it('measures from the base', () => {
    expect(isOnStep(3, 1, 2)).toBe(true)
    expect(isOnStep(2, 1, 2)).toBe(false)
    expect(isOnStep(0.25, 0.05, 0.1)).toBe(true)
    expect(isOnStep(0.3, 0.05, 0.1)).toBe(false)
  })

  it('handles negative values and a base above the value', () => {
    expect(isOnStep(-0.3, 0, 0.1)).toBe(true)
    expect(isOnStep(-1, 1, 2)).toBe(true)
    expect(isOnStep(-2, 1, 2)).toBe(false)
  })

  it('handles integer steps at the 1e12 limit', () => {
    expect(isOnStep(1e12, 0, 1)).toBe(true)
    expect(isOnStep(999999999999, 0, 2)).toBe(false)
  })
})
