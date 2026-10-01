import type { ScalarFormField } from './definition'
import type { FieldHandler } from './scalar-answers'
import { describe, expect, it, vi } from 'vitest'
import { isValidEmail, isValidIsoDate, SCALAR_HANDLERS } from './scalar-answers'

type FieldOf<T extends ScalarFormField['type']> = Extract<ScalarFormField, { type: T }>

function field<T extends ScalarFormField['type']>(type: T, extra: Partial<FieldOf<T>> = {}): FieldOf<T> {
  return { id: 'f', type, label: 'Field', required: false, ...extra } as FieldOf<T>
}

function evaluate(f: ScalarFormField, draft: string | boolean | undefined) {
  return (SCALAR_HANDLERS[f.type] as unknown as FieldHandler<ScalarFormField>).evaluate(f, draft)
}

function codes(f: ScalarFormField, draft: string | boolean | undefined): string[] {
  return evaluate(f, draft).errors.map(e => e.code)
}

describe('text', () => {
  it('stores the value exactly as typed, inner and outer whitespace kept', () => {
    expect(evaluate(field('text'), '  hello   world  ')).toEqual({ answer: '  hello   world  ', errors: [] })
  })

  it('omits a whitespace-only optional value and calls it unanswered', () => {
    expect(evaluate(field('text'), '   ')).toEqual({ answer: undefined, errors: [] })
    expect(evaluate(field('text'), '')).toEqual({ answer: undefined, errors: [] })
    expect(evaluate(field('text'), undefined)).toEqual({ answer: undefined, errors: [] })
  })

  it('requires non-whitespace content when required', () => {
    const required = field('text', { required: true })
    expect(codes(required, '')).toEqual(['required'])
    expect(codes(required, '   ')).toEqual(['required'])
    expect(codes(required, ' a ')).toEqual([])
  })

  it('defaults max_length to 500 and counts code points', () => {
    expect(codes(field('text'), 'a'.repeat(500))).toEqual([])
    expect(codes(field('text'), 'a'.repeat(501))).toEqual(['too_long'])
    expect(codes(field('text'), '😀'.repeat(500))).toEqual([])
    expect(codes(field('text'), '😀'.repeat(501))).toEqual(['too_long'])
  })

  it('caps max_length at 2,000 whatever the definition says', () => {
    const big = field('text', { max_length: 5000 })
    expect(codes(big, 'a'.repeat(2000))).toEqual([])
    expect(codes(big, 'a'.repeat(2001))).toEqual(['too_long'])
  })

  it('honours a smaller max_length and a min_length', () => {
    const bounded = field('text', { min_length: 3, max_length: 5 })
    expect(codes(bounded, 'ab')).toEqual(['too_short'])
    expect(codes(bounded, 'abc')).toEqual([])
    expect(codes(bounded, 'abcdef')).toEqual(['too_long'])
  })

  it('does not apply min_length to an omitted optional value', () => {
    expect(codes(field('text', { min_length: 3 }), '')).toEqual([])
  })

  it('rejects control characters, tab included, even when that is all there is', () => {
    expect(codes(field('text'), 'a\tb')).toEqual(['invalid_text'])
    expect(codes(field('text'), '\n  ')).toEqual(['invalid_text'])
  })

  // The pattern is agent-authored and a browser regex engine backtracks, so
  // the server (linear-time RE2) is the only place it is evaluated; a 422
  // `pattern_mismatch` shows on the field (see wippy-form.test.ts).
  it('does not evaluate the pattern: a value that does not match is accepted for the server to judge', () => {
    const coded = field('text', { pattern: '[A-Z]{2}\\d{3}' })
    expect(evaluate(coded, 'AB123')).toEqual({ answer: 'AB123', errors: [] })
    expect(evaluate(coded, 'not-a-code')).toEqual({ answer: 'not-a-code', errors: [] })
  })

  it('never builds a regular expression from the definition, so no pattern can freeze the tab', () => {
    const construct = vi.spyOn(globalThis, 'RegExp').mockImplementation(() => {
      throw new Error('a RegExp was built while checking an answer')
    })
    try {
      // Both patterns backtrack without bound on a long run of "a" in a browser engine.
      expect(evaluate(field('text', { pattern: '(a|a)*b', max_length: 2000 }), 'a'.repeat(2000)).errors).toEqual([])
      expect(evaluate(field('text', { pattern: 'a*a*a*a*b', max_length: 2000 }), 'a'.repeat(2000)).errors).toEqual([])
      expect(construct).not.toHaveBeenCalled()
    }
    finally {
      construct.mockRestore()
    }
  })

  it('still applies every other text rule to a field that has a pattern', () => {
    const coded = field('text', { pattern: '[A-Z]+', min_length: 3, max_length: 5, required: true })
    expect(codes(coded, '')).toEqual(['required'])
    expect(codes(coded, 'AB')).toEqual(['too_short'])
    expect(codes(coded, 'ABCDEF')).toEqual(['too_long'])
    expect(codes(coded, 'A\tB')).toEqual(['invalid_text'])
  })
})

describe('textarea', () => {
  it('keeps newlines exactly and stores the text as typed', () => {
    expect(evaluate(field('textarea'), '  line one\n\n  line two  ')).toEqual({ answer: '  line one\n\n  line two  ', errors: [] })
  })

  it('turns CRLF and CR into LF before sending', () => {
    expect(evaluate(field('textarea'), 'a\r\nb\rc')).toEqual({ answer: 'a\nb\nc', errors: [] })
  })

  it('treats whitespace and blank lines only as unanswered', () => {
    expect(evaluate(field('textarea'), ' \n \n')).toEqual({ answer: undefined, errors: [] })
    expect(codes(field('textarea', { required: true }), ' \n ')).toEqual(['required'])
  })

  it('defaults to and caps at 8,000 characters', () => {
    expect(codes(field('textarea'), 'a'.repeat(8000))).toEqual([])
    expect(codes(field('textarea'), 'a'.repeat(8001))).toEqual(['too_long'])
    expect(codes(field('textarea', { max_length: 9000 }), 'a'.repeat(8001))).toEqual(['too_long'])
  })

  it('allows tab and line feed but rejects other control characters', () => {
    expect(codes(field('textarea'), 'a\tb\nc')).toEqual([])
    expect(codes(field('textarea'), 'a\u0001b')).toEqual(['invalid_text'])
  })

  it('applies min_length', () => {
    expect(codes(field('textarea', { min_length: 10 }), 'short')).toEqual(['too_short'])
  })
})

describe('email', () => {
  it('trims outer whitespace and stores the trimmed address, case kept', () => {
    expect(evaluate(field('email'), '  Ada.Lovelace@Example.COM  ')).toEqual({ answer: 'Ada.Lovelace@Example.COM', errors: [] })
  })

  it('is unanswered when blank and required when required', () => {
    expect(evaluate(field('email'), '  ')).toEqual({ answer: undefined, errors: [] })
    expect(codes(field('email', { required: true }), '')).toEqual(['required'])
  })

  it('accepts ordinary addresses', () => {
    for (const ok of ['a@b.co', 'first.last@sub.example.org', 'a+tag@example.com', 'o\'brien@example.ie', 'x_y-z@a-b.example', '1@2.io'])
      expect(isValidEmail(ok), ok).toBe(true)
  })

  it('rejects malformed addresses with invalid_email', () => {
    for (const bad of ['a', 'a@b', 'a b@c.com', 'a@@b.com', '.a@b.com', 'a.@b.com', 'a..b@c.com', 'a@-b.com', 'a@b-.com', 'a@b..com', '@b.com', 'a@', 'é@x.com', 'a@é.com', 'a@b.c_m']) {
      expect(isValidEmail(bad), bad).toBe(false)
      expect(codes(field('email'), bad), bad).toEqual(['invalid_email'])
    }
  })

  it('limits the local part to 64 characters', () => {
    expect(isValidEmail(`${'a'.repeat(64)}@example.com`)).toBe(true)
    expect(isValidEmail(`${'a'.repeat(65)}@example.com`)).toBe(false)
  })

  it('limits the whole address to 254 characters', () => {
    // "a@" plus a domain of four labels (63, 63, 63, n) and three dots.
    const withLastLabel = (n: number) => `a@${'b'.repeat(63)}.${'b'.repeat(63)}.${'b'.repeat(63)}.${'b'.repeat(n)}`
    expect(withLastLabel(60)).toHaveLength(254)
    expect(isValidEmail(withLastLabel(60))).toBe(true)
    expect(withLastLabel(61)).toHaveLength(255)
    expect(isValidEmail(withLastLabel(61))).toBe(false)
  })

  it('limits a domain label to 63 characters', () => {
    expect(isValidEmail(`a@${'b'.repeat(63)}.com`)).toBe(true)
    expect(isValidEmail(`a@${'b'.repeat(64)}.com`)).toBe(false)
  })
})

describe('number', () => {
  it('parses the typed text into a JSON number', () => {
    expect(evaluate(field('number'), '12')).toEqual({ answer: 12, errors: [] })
    expect(evaluate(field('number'), ' -3.5 ')).toEqual({ answer: -3.5, errors: [] })
    expect(evaluate(field('number'), '0')).toEqual({ answer: 0, errors: [] })
  })

  it('treats blank text as unanswered, or required when required', () => {
    expect(evaluate(field('number'), '  ')).toEqual({ answer: undefined, errors: [] })
    expect(codes(field('number', { required: true }), '')).toEqual(['required'])
  })

  it('never coerces: separators, comma decimals, exponents and words are invalid_number', () => {
    for (const bad of ['1,000', '1,5', '1 000', '1e3', 'abc', '+5', '0x10'])
      expect(codes(field('number'), bad), bad).toEqual(['invalid_number'])
  })

  it('accepts |value| up to 1e12 and rejects beyond', () => {
    expect(codes(field('number'), '1000000000000')).toEqual([])
    expect(codes(field('number'), '-1000000000000')).toEqual([])
    expect(codes(field('number'), '1000000000001')).toEqual(['invalid_number'])
    expect(codes(field('number'), '-1000000000001')).toEqual(['invalid_number'])
  })

  it('accepts 3.0 for an integer field and sends 3', () => {
    expect(evaluate(field('number', { integer: true }), '3.0')).toEqual({ answer: 3, errors: [] })
    expect(codes(field('number', { integer: true }), '3.5')).toEqual(['not_integer'])
  })

  it('checks min and max inclusively', () => {
    const bounded = field('number', { min: 1, max: 10 })
    expect(codes(bounded, '1')).toEqual([])
    expect(codes(bounded, '10')).toEqual([])
    expect(codes(bounded, '0.99')).toEqual(['below_min'])
    expect(codes(bounded, '10.01')).toEqual(['above_max'])
  })

  it('checks the step from min, or from zero without a min, with exact decimals', () => {
    expect(codes(field('number', { step: 0.1 }), '0.3')).toEqual([])
    expect(codes(field('number', { step: 0.1 }), '0.35')).toEqual(['not_on_step'])
    expect(codes(field('number', { min: 1, step: 2 }), '3')).toEqual([])
    expect(codes(field('number', { min: 1, step: 2 }), '2')).toEqual(['not_on_step'])
    expect(codes(field('number', { min: 0.05, step: 0.1 }), '0.25')).toEqual([])
  })

  it('reports an integer failure before bounds and bounds before the step', () => {
    expect(codes(field('number', { integer: true, min: 5 }), '1.5')).toEqual(['not_integer'])
    expect(codes(field('number', { min: 5, step: 2 }), '2')).toEqual(['below_min'])
  })
})

describe('date', () => {
  it('accepts a valid calendar date and stores it as typed text', () => {
    expect(evaluate(field('date'), '2026-10-01')).toEqual({ answer: '2026-10-01', errors: [] })
  })

  it('does not trim: padding around a date is invalid_date, as on the server', () => {
    expect(codes(field('date'), ' 2026-10-01')).toEqual(['invalid_date'])
    expect(codes(field('date'), '2026-10-01 ')).toEqual(['invalid_date'])
  })

  it('is unanswered when blank and required when required', () => {
    expect(evaluate(field('date'), '')).toEqual({ answer: undefined, errors: [] })
    expect(codes(field('date', { required: true }), '  ')).toEqual(['required'])
  })

  it('surfaces invalid_date for typed text that is not a date, never dropping it', () => {
    for (const bad of ['tomorrow', '10/01/2026', '2026-1-1', '2026-02-30', '2023-02-29', '2026-13-01', '2026-00-10', '0000-01-01', '10000-01-01', '2026-10-01T10:00', '２０２６-10-01'])
      expect(codes(field('date'), bad), bad).toEqual(['invalid_date'])
  })

  it('knows leap years', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true)
    expect(isValidIsoDate('2023-02-29')).toBe(false)
    expect(isValidIsoDate('1900-02-29')).toBe(false)
    expect(isValidIsoDate('2000-02-29')).toBe(true)
  })

  it('accepts the year range 0001 to 9999', () => {
    expect(isValidIsoDate('0001-01-01')).toBe(true)
    expect(isValidIsoDate('9999-12-31')).toBe(true)
  })

  it('checks min and max inclusively as strings', () => {
    const bounded = field('date', { min: '2026-10-01', max: '2026-10-31' })
    expect(codes(bounded, '2026-10-01')).toEqual([])
    expect(codes(bounded, '2026-10-31')).toEqual([])
    expect(codes(bounded, '2026-09-30')).toEqual(['below_min'])
    expect(codes(bounded, '2026-11-01')).toEqual(['above_max'])
  })
})

describe('checkbox', () => {
  it('sends an explicit boolean, true or false', () => {
    expect(evaluate(field('checkbox'), true)).toEqual({ answer: true, errors: [] })
    expect(evaluate(field('checkbox'), false)).toEqual({ answer: false, errors: [] })
  })

  it('sends false for an untouched optional checkbox', () => {
    expect(evaluate(field('checkbox'), undefined)).toEqual({ answer: false, errors: [] })
  })

  it('requires true when required', () => {
    const consent = field('checkbox', { required: true })
    expect(codes(consent, false)).toEqual(['required'])
    expect(codes(consent, undefined)).toEqual(['required'])
    expect(evaluate(consent, true)).toEqual({ answer: true, errors: [] })
  })
})

describe('initial drafts and defaults', () => {
  it('prefills a text default and sends it unless the user clears it', () => {
    const f = field('text', { default: 'Berlin' })
    const draft = SCALAR_HANDLERS.text.initialDraft(f, undefined)
    expect(draft).toBe('Berlin')
    expect(evaluate(f, draft as string)).toEqual({ answer: 'Berlin', errors: [] })
    expect(evaluate(f, '')).toEqual({ answer: undefined, errors: [] })
  })

  it('shows a number default as plain text', () => {
    expect(SCALAR_HANDLERS.number.initialDraft(field('number', { default: 3 }), undefined)).toBe('3')
    expect(SCALAR_HANDLERS.number.initialDraft(field('number', { default: 0.5 }), undefined)).toBe('0.5')
  })

  it('starts a checkbox unchecked, with false as its only possible default', () => {
    expect(SCALAR_HANDLERS.checkbox.initialDraft(field('checkbox'), undefined)).toBe(false)
    expect(SCALAR_HANDLERS.checkbox.initialDraft(field('checkbox', { default: false }), undefined)).toBe(false)
  })

  it('starts an unanswered, default-less text field empty', () => {
    expect(SCALAR_HANDLERS.text.initialDraft(field('text'), undefined)).toBeUndefined()
    expect(SCALAR_HANDLERS.date.initialDraft(field('date'), undefined)).toBeUndefined()
  })

  it('lets a stored answer win over the default', () => {
    expect(SCALAR_HANDLERS.text.initialDraft(field('text', { default: 'Berlin' }), 'Paris')).toBe('Paris')
    expect(SCALAR_HANDLERS.number.initialDraft(field('number', { default: 3 }), 7)).toBe('7')
    expect(SCALAR_HANDLERS.checkbox.initialDraft(field('checkbox'), true)).toBe(true)
  })
})

describe('read-only display text', () => {
  it('shows text and textarea values with their line breaks', () => {
    expect(SCALAR_HANDLERS.textarea.display(field('textarea'), 'a\nb')).toBe('a\nb')
    expect(SCALAR_HANDLERS.text.display(field('text'), 'hello')).toBe('hello')
  })

  it('shows a number as stored, without an exponent', () => {
    expect(SCALAR_HANDLERS.number.display(field('number'), 3)).toBe('3')
    expect(SCALAR_HANDLERS.number.display(field('number'), 1e-7)).toBe('0.0000001')
  })

  it('shows a date as its ISO text and an email as written', () => {
    expect(SCALAR_HANDLERS.date.display(field('date'), '2026-10-01')).toBe('2026-10-01')
    expect(SCALAR_HANDLERS.email.display(field('email'), 'a@b.co')).toBe('a@b.co')
  })

  it('shows a checkbox as Yes or No', () => {
    expect(SCALAR_HANDLERS.checkbox.display(field('checkbox'), true)).toBe('Yes')
    expect(SCALAR_HANDLERS.checkbox.display(field('checkbox'), false)).toBe('No')
  })

  it('returns null for an unanswered field, so the caller shows Skipped', () => {
    for (const type of ['text', 'textarea', 'number', 'email', 'date', 'checkbox'] as const)
      expect(SCALAR_HANDLERS[type].display(field(type) as never, undefined), type).toBeNull()
  })
})
