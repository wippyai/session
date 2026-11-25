import { describe, expect, it } from 'vitest'
import { formatAnsweredAt } from './answered-time'

// The Web Host chat (1.0.65 and later) shows a stored ISO time with Luxon's
// `DateTime.fromISO(value)` in the browser's time zone, as `MMM d, yyyy HH:mm`.
// Each case names the zone, so the expected text does not depend on the
// machine that runs the test.
describe('formatAnsweredAt', () => {
  it('shows a UTC (`Z`) time in the browser\'s zone, across a date boundary: short English month, day, year, 24-hour time without seconds', () => {
    expect(formatAnsweredAt('2026-11-25T23:47:18Z', 'UTC')).toBe('Nov 25, 2026 23:47')
    expect(formatAnsweredAt('2026-11-25T23:47:18Z', 'Europe/Warsaw')).toBe('Nov 26, 2026 00:47')
    expect(formatAnsweredAt('2026-11-25T23:47:18Z', 'America/New_York')).toBe('Nov 25, 2026 18:47')
  })

  it('reads the stored nine-digit fraction of a second', () => {
    expect(formatAnsweredAt('2026-11-25T14:10:18.422991800Z', 'Europe/Warsaw')).toBe('Nov 25, 2026 15:10')
  })

  it('converts an explicit offset to the browser\'s zone, across a day and a year boundary', () => {
    // The same instant as 2026-11-25T23:47:18Z.
    expect(formatAnsweredAt('2026-11-26T00:47:18+01:00', 'Asia/Tokyo')).toBe('Nov 26, 2026 08:47')
    expect(formatAnsweredAt('2026-11-26T00:47:18+01:00', 'America/Los_Angeles')).toBe('Nov 25, 2026 15:47')
    // The same instant as 2026-01-01T02:45:00Z.
    expect(formatAnsweredAt('2025-12-31T21:15:00-05:30', 'Europe/Warsaw')).toBe('Jan 1, 2026 03:45')
  })

  it('takes the other offset forms Luxon reads', () => {
    expect(formatAnsweredAt('2026-11-25T18:30:00+0530', 'UTC')).toBe('Nov 25, 2026 13:00')
    expect(formatAnsweredAt('2026-11-25T18:30:00+05', 'UTC')).toBe('Nov 25, 2026 13:30')
    expect(formatAnsweredAt('2026-11-25T18:30:00,5Z', 'UTC')).toBe('Nov 25, 2026 18:30')
  })

  it('shows a time with no offset as written, because the chat reads it as the browser\'s local time', () => {
    expect(formatAnsweredAt('2026-11-25T12:47:18', 'Asia/Tokyo')).toBe('Nov 25, 2026 12:47')
    expect(formatAnsweredAt('2026-11-25', 'America/New_York')).toBe('Nov 25, 2026 00:00')
  })

  it('pads the hour and writes midnight as 00', () => {
    expect(formatAnsweredAt('2026-01-05T00:05:00Z', 'UTC')).toBe('Jan 5, 2026 00:05')
    expect(formatAnsweredAt('2026-01-05T09:30:00Z', 'UTC')).toBe('Jan 5, 2026 09:30')
  })

  it('reads 24:00:00 as the midnight that ends the day, as ISO 8601 and the chat do', () => {
    expect(formatAnsweredAt('2026-11-25T24:00:00Z', 'UTC')).toBe('Nov 26, 2026 00:00')
    expect(formatAnsweredAt('2026-12-31T24:00:00Z', 'UTC')).toBe('Jan 1, 2027 00:00')
  })

  it('uses the browser\'s own zone by default', () => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    expect(formatAnsweredAt('2026-11-25T23:47:18Z')).toBe(formatAnsweredAt('2026-11-25T23:47:18Z', zone))
  })

  it('has no text for a missing, unreadable or impossible time', () => {
    expect(formatAnsweredAt(null)).toBeNull()
    expect(formatAnsweredAt(undefined)).toBeNull()
    expect(formatAnsweredAt('')).toBeNull()
    expect(formatAnsweredAt('not a date')).toBeNull()
    expect(formatAnsweredAt('2026-02-30T10:00:00Z')).toBeNull()
    expect(formatAnsweredAt('2026-13-01T10:00:00Z')).toBeNull()
    expect(formatAnsweredAt('2026-11-25T24:30:00Z')).toBeNull()
    expect(formatAnsweredAt('2026-11-25T10:61:00Z')).toBeNull()
  })
})
