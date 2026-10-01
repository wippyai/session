import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateRequestId } from './request-id'

const UUID_V4 = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generateRequestId', () => {
  it('returns a different UUID each time', () => {
    const first = generateRequestId()
    expect(first).toMatch(UUID_V4)
    expect(generateRequestId()).not.toBe(first)
  })

  it('still returns a UUID v4 when crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => bytes.fill(0xFF) })
    expect(generateRequestId()).toMatch(UUID_V4)
  })

  it('still returns a UUID v4 without any crypto object', () => {
    vi.stubGlobal('crypto', undefined)
    expect(generateRequestId()).toMatch(UUID_V4)
  })
})
