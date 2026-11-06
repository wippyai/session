/**
 * Decimal helpers for the `number` field. The server accepts a finite JSON
 * number and checks `step` with exact decimal arithmetic, so the client must
 * not trust floating-point math either: `0.3 % 0.1` is not zero in IEEE 754.
 * Everything here works on plain decimal text and BigInt.
 */

/** A number answer's absolute value may not exceed this. */
export const NUMBER_ABS_MAX = 1e12

export type ParsedNumber
  = | { kind: 'empty' }
    | { kind: 'invalid' }
    | { kind: 'number', value: number }

// Optional minus, then digits with an optional fraction, or a bare fraction.
// No plus sign, no exponent, no group separator, no comma decimal.
const NUMBER_TEXT = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/

/** Typed number text without the zeros that do not change it: `007.50` is `7.5`, `-0.0` is `0`. */
function withoutSpareZeros(text: string): string {
  const negative = text.startsWith('-')
  const [whole, fraction = ''] = (negative ? text.slice(1) : text).split('.')
  const digits = whole.replace(/^0+/, '') || '0'
  const decimals = fraction.replace(/0+$/, '')
  const plain = decimals ? `${digits}.${decimals}` : digits
  return negative && plain !== '0' ? `-${plain}` : plain
}

/**
 * Parses what was typed into a number field. Outer whitespace is ignored; an
 * empty result means the field is unanswered. Nothing is coerced: a comma
 * decimal, a thousands separator or an exponent is `invalid`, never guessed. So
 * are digits a JSON number cannot hold: `2.00000000000000001` would be stored
 * as 2, and every later check would judge a value the user did not type.
 */
export function parseNumberText(raw: string): ParsedNumber {
  const text = raw.trim()
  if (text === '')
    return { kind: 'empty' }
  if (!NUMBER_TEXT.test(text))
    return { kind: 'invalid' }
  const value = Number(text)
  if (!Number.isFinite(value))
    return { kind: 'invalid' }
  // `-0` would serialize as `0` anyway, but say so here so no caller sees it.
  const number = value === 0 ? 0 : value
  if (numberToPlainText(number) !== withoutSpareZeros(text))
    return { kind: 'invalid' }
  return { kind: 'number', value: number }
}

/**
 * The number as plain decimal text, the way it is stored: `String(n)` can
 * switch to exponent form (`1e-7`), which is neither how the server writes
 * the stored value nor something a reader expects to see.
 */
export function numberToPlainText(value: number): string {
  const text = String(value)
  const exponentAt = text.indexOf('e')
  if (exponentAt === -1)
    return text
  const negative = text.startsWith('-')
  const mantissa = text.slice(negative ? 1 : 0, exponentAt)
  const exponent = Number(text.slice(exponentAt + 1))
  const dotAt = mantissa.indexOf('.')
  const digits = mantissa.replace('.', '')
  // Position of the decimal point within `digits`, after applying the exponent.
  const pointAt = (dotAt === -1 ? mantissa.length : dotAt) + exponent
  let plain: string
  if (pointAt <= 0)
    plain = `0.${'0'.repeat(-pointAt)}${digits}`
  else if (pointAt >= digits.length)
    plain = digits + '0'.repeat(pointAt - digits.length)
  else
    plain = `${digits.slice(0, pointAt)}.${digits.slice(pointAt)}`
  return negative ? `-${plain}` : plain
}

/** Digits after the decimal point of a plain decimal text. */
function decimalPlaces(plain: string): number {
  const dotAt = plain.indexOf('.')
  return dotAt === -1 ? 0 : plain.length - dotAt - 1
}

/** A plain decimal text as an integer scaled by 10^places (`places` >= its own decimals). */
function scaled(plain: string, places: number): bigint {
  const negative = plain.startsWith('-')
  const unsigned = negative ? plain.slice(1) : plain
  const dotAt = unsigned.indexOf('.')
  const whole = dotAt === -1 ? unsigned : unsigned.slice(0, dotAt)
  const fraction = dotAt === -1 ? '' : unsigned.slice(dotAt + 1)
  const magnitude = BigInt(`${whole}${fraction.padEnd(places, '0')}`)
  return negative ? -magnitude : magnitude
}

/**
 * True when `value - base` is an exact multiple of `step`. The base is the
 * field's `min` when it has one, else zero. Each number is read as the
 * shortest decimal that round-trips, scaled to a common integer scale, and
 * the remainder is taken in BigInt: no tolerance, no floating modulus.
 */
export function isOnStep(value: number, base: number, step: number): boolean {
  const valueText = numberToPlainText(value)
  const baseText = numberToPlainText(base)
  const stepText = numberToPlainText(step)
  const places = Math.max(decimalPlaces(valueText), decimalPlaces(baseText), decimalPlaces(stepText))
  const stepScaled = scaled(stepText, places)
  if (stepScaled === 0n)
    return false
  return (scaled(valueText, places) - scaled(baseText, places)) % stepScaled === 0n
}
