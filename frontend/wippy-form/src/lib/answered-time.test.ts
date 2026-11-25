import { describe, expect, it } from 'vitest'
import { formatAnsweredAt } from './answered-time'

/** An ISO time for a wall-clock time in the test's own time zone, so the expected text does not depend on it. */
const local = (...parts: [number, number, number, number, number, number?]) => new Date(...parts).toISOString()

describe('formatAnsweredAt', () => {
  it('writes the time like the chat\'s message times: short English month, day, year, 24-hour time without seconds', () => {
    expect(formatAnsweredAt(local(2026, 10, 25, 12, 47, 18))).toBe('Nov 25, 2026 12:47')
  })

  it('pads the hour and writes midnight as 00', () => {
    expect(formatAnsweredAt(local(2026, 0, 5, 0, 5))).toBe('Jan 5, 2026 00:05')
    expect(formatAnsweredAt(local(2026, 0, 5, 9, 30))).toBe('Jan 5, 2026 09:30')
  })

  it('reads an offset time and shows it in the user\'s time zone', () => {
    const iso = '2026-09-29T20:00:00+02:00'
    const date = new Date(iso)
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    expect(formatAnsweredAt(iso)).toMatch(new RegExp(` ${hh}:${mm}$`))
  })

  it('has no text for a missing or unreadable time', () => {
    expect(formatAnsweredAt(null)).toBeNull()
    expect(formatAnsweredAt(undefined)).toBeNull()
    expect(formatAnsweredAt('')).toBeNull()
    expect(formatAnsweredAt('not a date')).toBeNull()
  })
})
