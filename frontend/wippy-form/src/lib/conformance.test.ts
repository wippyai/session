import type { FieldAnswer, FormField, ScalarFormField } from './definition'
import { describe, expect, it } from 'vitest'
import { evaluateField } from './answers'
import { numberToPlainText } from './decimal'
import { effectiveMaxLength } from './scalar-answers'

/**
 * Runs the shared Lua/TypeScript conformance fixture through the client
 * checker. The fixture (`test/forms/fixtures/v2_conformance.json`) is owned by
 * the Session server tests, which run the same file through the definition
 * normalizer and answer validator, so a rule cannot change on one side only.
 * Its format is documented at the top of `test/forms/v2_conformance_test.lua`:
 *
 *   field | fields   one field as an agent writes it (or several)
 *   value            the wire answer; absent or null = no answer
 *   value_concat     instead of `value`: strings and `{ repeat, times }`
 *                    objects joined into one long string
 *   expect           { ok: v } accepted and stored as v
 *                    { same: true } accepted and stored exactly as sent
 *                    { unanswered: true } accepted, nothing stored
 *                    { error: code } refused with this code
 *                    { definition_ok } / { definition_error, path } /
 *                    { normalized } about the definition itself
 *
 * What the client checks: every answer case for the six standard fields
 * (expect `ok`, `same`, `unanswered`, `error`), and, for definition cases
 * that state a normalized `max_length`, that the client derives the same
 * effective limit from the raw field. Skipped, and counted: definition
 * validation (the server vets definitions before a form exists), a value of
 * the wrong JSON type for its field (a control always hands the checker the
 * right kind of draft), and an unanswered optional checkbox (the UI always
 * sends an explicit boolean), and a carriage return in a textarea value (the
 * client turns every line break into LF before sending). Any other shape
 * fails loudly.
 */

const SCALAR_TYPES = new Set(['text', 'textarea', 'number', 'email', 'date', 'checkbox'])

export interface RawCase {
  name?: string
  field?: Record<string, unknown>
  fields?: unknown[]
  value?: unknown
  value_concat?: Array<string | { repeat: string, times: number }>
  expect?: Record<string, unknown>
}

export type Verdict = 'checked' | 'skipped'

function expandValue(raw: RawCase): unknown {
  if (raw.value_concat === undefined)
    return raw.value
  return raw.value_concat.map(part => typeof part === 'string' ? part : part.repeat.repeat(part.times)).join('')
}

/** The draft a control would hold for this wire value, or `null` when no control can hold such a value. */
function draftFor(field: ScalarFormField, value: unknown): FieldAnswer | undefined | null {
  if (value === null || value === undefined)
    return undefined
  switch (field.type) {
    case 'number':
      return typeof value === 'number' ? numberToPlainText(value) : null
    case 'checkbox':
      return typeof value === 'boolean' ? value : null
    default:
      return typeof value === 'string' ? value : null
  }
}

export function runCase(raw: unknown, index: number): Verdict {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error(`conformance case ${index}: not an object`)
  const entry = raw as RawCase
  const name = entry.name ?? `case ${index}`
  const expected = entry.expect
  if (!expected || typeof expected !== 'object')
    throw new Error(`conformance case ${index} (${name}): no expect`)

  // Several fields: always a definition case.
  if (entry.fields !== undefined)
    return 'skipped'
  const rawField = entry.field
  if (!rawField || typeof rawField.type !== 'string')
    throw new Error(`conformance case ${index} (${name}): no field`)
  if (!SCALAR_TYPES.has(rawField.type))
    return 'skipped'
  const field = { id: 'f', label: 'Question', required: false, ...rawField } as unknown as ScalarFormField

  const isDefinitionCase = 'definition_ok' in expected || 'definition_error' in expected || 'normalized' in expected
  if (isDefinitionCase) {
    const normalized = expected.normalized as Record<string, unknown> | undefined
    if (normalized && 'max_length' in normalized && (field.type === 'text' || field.type === 'textarea')) {
      expect(effectiveMaxLength(field), name).toBe(normalized.max_length)
      return 'checked'
    }
    return 'skipped'
  }

  const knownExpectation = 'ok' in expected || 'same' in expected || 'unanswered' in expected || 'error' in expected
  if (!knownExpectation)
    throw new Error(`conformance case ${index} (${name}): unrecognized expect (keys: ${Object.keys(expected).join(', ')})`)

  const value = expandValue(entry)
  // The server answers a wrong JSON type with `invalid_type`; no control can send one.
  if (expected.error === 'invalid_type')
    return 'skipped'
  const draft = draftFor(field, value)
  if (draft === null)
    return 'skipped'
  // The client turns every line break of a textarea into LF, so it never sends the CR the server refuses.
  if (field.type === 'textarea' && typeof value === 'string' && value.includes(String.fromCharCode(13)))
    return 'skipped'
  // A checkbox always reports a boolean, so an optional one is never absent.
  if (field.type === 'checkbox' && draft === undefined && !field.required)
    return 'skipped'

  const outcome = evaluateField(field as FormField, draft)
  if (typeof expected.error === 'string') {
    expect(outcome.errors.map(e => e.code), name).toContain(expected.error)
    expect(outcome.errors[0].code, name).toBe(expected.error)
    return 'checked'
  }
  expect(outcome.errors, name).toEqual([])
  if (expected.unanswered)
    expect(outcome.answer, name).toBeUndefined()
  else if (expected.same)
    expect(outcome.answer, name).toEqual(value)
  else
    expect(outcome.answer, name).toEqual(expected.ok)
  return 'checked'
}

// ── the runner itself, proven on inline cases ────────────────────

describe('conformance runner (inline cases)', () => {
  const text = { type: 'text', max_length: 5 }

  it('checks accepted values: same, ok and unanswered', () => {
    expect(runCase({ name: 'same', field: text, value: 'abc', expect: { same: true } }, 0)).toBe('checked')
    expect(runCase({ name: 'ok', field: { type: 'email' }, value: ' a@b.co ', expect: { ok: 'a@b.co' } }, 1)).toBe('checked')
    expect(runCase({ name: 'number', field: { type: 'number', integer: true }, value: 3, expect: { ok: 3 } }, 2)).toBe('checked')
    expect(runCase({ name: 'blank', field: text, value: '  ', expect: { unanswered: true } }, 3)).toBe('checked')
    expect(runCase({ name: 'absent', field: text, expect: { unanswered: true } }, 4)).toBe('checked')
  })

  it('checks refused values by error code, and joins value_concat', () => {
    expect(runCase({ name: 'long', field: text, value: 'abcdef', expect: { error: 'too_long' } }, 0)).toBe('checked')
    expect(runCase({ name: 'long', field: text, value_concat: [{ repeat: 'a', times: 5 }, 'b'], expect: { error: 'too_long' } }, 1)).toBe('checked')
    expect(runCase({ name: 'absent', field: { type: 'text', required: true }, expect: { error: 'required' } }, 2)).toBe('checked')
  })

  it('fails when the client disagrees with the fixture', () => {
    expect(() => runCase({ name: 'wrong', field: text, value: 'abcdef', expect: { same: true } }, 0)).toThrow()
    expect(() => runCase({ name: 'wrong', field: text, value: 'abc', expect: { error: 'too_long' } }, 1)).toThrow()
    expect(() => runCase({ name: 'wrong', field: text, value: 'abc', expect: { ok: 'abd' } }, 2)).toThrow()
  })

  it('compares the effective max_length of a normalized definition', () => {
    expect(runCase({ name: 'defaults', field: { type: 'text' }, expect: { normalized: { max_length: 500 } } }, 0)).toBe('checked')
    expect(runCase({ name: 'cap', field: { type: 'textarea' }, expect: { normalized: { max_length: 8000 } } }, 1)).toBe('checked')
    expect(() => runCase({ name: 'wrong', field: { type: 'text' }, expect: { normalized: { max_length: 400 } } }, 2)).toThrow()
  })

  it('skips what the UI cannot produce or the server alone decides', () => {
    expect(runCase({ name: 'type', field: { type: 'number' }, value: '3', expect: { error: 'invalid_type' } }, 0)).toBe('skipped')
    expect(runCase({ name: 'wrong json type', field: { type: 'number' }, value: true, expect: { error: 'whatever' } }, 1)).toBe('skipped')
    expect(runCase({ name: 'definition', field: { type: 'number', min: 5, max: 1 }, expect: { definition_error: 'invalid_range', path: 'fields[0].max' } }, 2)).toBe('skipped')
    expect(runCase({ name: 'choice', field: { type: 'choice', options: ['a'] }, value: 'a', expect: { same: true } }, 3)).toBe('skipped')
    expect(runCase({ name: 'several', fields: [{ type: 'text' }], expect: { definition_ok: true } }, 4)).toBe('skipped')
    expect(runCase({ name: 'checkbox', field: { type: 'checkbox' }, expect: { unanswered: true } }, 5)).toBe('skipped')
  })

  it('fails loudly on a shape it does not understand', () => {
    expect(() => runCase('nope', 0)).toThrow('not an object')
    expect(() => runCase({ name: 'x', field: { type: 'text' } }, 1)).toThrow('no expect')
    expect(() => runCase({ name: 'x', expect: { same: true } }, 2)).toThrow('no field')
    expect(() => runCase({ name: 'x', field: { type: 'text' }, value: 'a', expect: { mystery: true } }, 3)).toThrow('unrecognized expect')
  })
})

// ── the shared fixture file ──────────────────────────────────────

const fixtureFiles = import.meta.glob('../../../../test/forms/fixtures/v2_conformance.json', { eager: true, import: 'default' }) as Record<string, unknown>
const fixture = Object.values(fixtureFiles)[0]

describe('conformance fixture (test/forms/fixtures/v2_conformance.json)', () => {
  if (fixture === undefined) {
    it.skip('skipped: test/forms/fixtures/v2_conformance.json does not exist (the Session server tests own it)', () => {})
    return
  }

  const cases = Array.isArray(fixture) ? fixture as unknown[] : []

  it('is a list of cases with unique names', () => {
    expect(cases.length).toBeGreaterThan(400)
    const names = cases.map(c => (c as RawCase).name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('agrees with the client checker on every case it covers', () => {
    const failures: string[] = []
    let checked = 0
    for (const [index, raw] of cases.entries()) {
      try {
        if (runCase(raw, index) === 'checked')
          checked++
      }
      catch (error) {
        failures.push(`${(raw as RawCase).name ?? index}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
      }
    }
    // One list of every disagreement, not just the first.
    expect(failures).toEqual([])
    // A fixture whose every case was skipped would prove nothing.
    expect(checked).toBeGreaterThan(200)
  })
})
