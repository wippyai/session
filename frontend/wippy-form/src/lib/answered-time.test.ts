import { describe, expect, it } from 'vitest'
import { formatAnsweredAt } from './answered-time'

// The Web Host chat (1.0.65 and later) shows a stored time with Luxon's
// `DateTime.fromISO(value)`, or `fromFormat(value, 'yyyy-MM-dd HH:mm:ss')`,
// in the browser's time zone, as `MMM d, yyyy HH:mm`. Each case names the
// zone, so the expected text does not depend on the machine that runs it.
describe('formatAnsweredAt', () => {
  it('shows a UTC (`Z`) time in the browser\'s zone, across a date boundary: short English month, day, year, 24-hour time without seconds', () => {
    expect(formatAnsweredAt('2026-11-25T23:47:18Z', 'UTC')).toBe('Nov 25, 2026 23:47')
    expect(formatAnsweredAt('2026-11-25T23:47:18Z', 'Europe/Warsaw')).toBe('Nov 26, 2026 00:47')
    expect(formatAnsweredAt('2026-11-25T23:47:18Z', 'America/New_York')).toBe('Nov 25, 2026 18:47')
  })

  it('reads the Session\'s RFC 3339 time with a nine-digit fraction of a second', () => {
    expect(formatAnsweredAt('2026-11-25T14:10:18.422991800Z', 'Europe/Warsaw')).toBe('Nov 25, 2026 15:10')
  })

  it('converts an explicit offset to the browser\'s zone, across a day and a year boundary, also in half-hour zones', () => {
    // The same instant as 2026-11-25T23:47:18Z.
    expect(formatAnsweredAt('2026-11-26T00:47:18+01:00', 'Asia/Tokyo')).toBe('Nov 26, 2026 08:47')
    expect(formatAnsweredAt('2026-11-26T00:47:18+01:00', 'America/Los_Angeles')).toBe('Nov 25, 2026 15:47')
    expect(formatAnsweredAt('2026-11-26T00:47:18+01:00', 'Asia/Kolkata')).toBe('Nov 26, 2026 05:17')
    // The same instant as 2026-01-01T02:45:00Z.
    expect(formatAnsweredAt('2025-12-31T21:15:00-05:30', 'Europe/Warsaw')).toBe('Jan 1, 2026 03:45')
  })

  it('takes the other offset forms Luxon reads', () => {
    expect(formatAnsweredAt('2026-11-25T18:30:00+0530', 'UTC')).toBe('Nov 25, 2026 13:00')
    expect(formatAnsweredAt('2026-11-25T18:30:00+05', 'UTC')).toBe('Nov 25, 2026 13:30')
    expect(formatAnsweredAt('2026-11-25T18:30:00,5Z', 'UTC')).toBe('Nov 25, 2026 18:30')
  })

  it('reads a time with no offset as local time in the browser\'s zone', () => {
    expect(formatAnsweredAt('2026-11-25T12:47:18', 'Asia/Tokyo')).toBe('Nov 25, 2026 12:47')
    expect(formatAnsweredAt('2026-11-25', 'America/New_York')).toBe('Nov 25, 2026 00:00')
    expect(formatAnsweredAt('2026-11-25 12:47:18', 'Asia/Tokyo')).toBe('Nov 25, 2026 12:47')
  })

  it('moves a local time in a daylight-saving gap forward by the gap, as the chat does', () => {
    // Warsaw skips 02:00 to 03:00 on 2026-03-29.
    expect(formatAnsweredAt('2026-03-29T02:30:00', 'Europe/Warsaw')).toBe('Mar 29, 2026 03:30')
    expect(formatAnsweredAt('2026-03-29 02:30:00', 'Europe/Warsaw')).toBe('Mar 29, 2026 03:30')
    // Santiago skips midnight to 01:00 on 2026-09-06.
    expect(formatAnsweredAt('2026-09-06', 'America/Santiago')).toBe('Sep 6, 2026 01:00')
  })

  it('shows a repeated local time (the hour the clocks go back) as written', () => {
    expect(formatAnsweredAt('2026-10-25T02:30:00', 'Europe/Warsaw')).toBe('Oct 25, 2026 02:30')
  })

  it('pads the hour and writes midnight as 00', () => {
    expect(formatAnsweredAt('2026-01-05T00:05:00Z', 'UTC')).toBe('Jan 5, 2026 00:05')
    expect(formatAnsweredAt('2026-01-05T09:30:00Z', 'UTC')).toBe('Jan 5, 2026 09:30')
  })

  it('reads 24:00:00 as the midnight that ends the day, as ISO 8601 and the chat do', () => {
    expect(formatAnsweredAt('2026-11-25T24:00:00Z', 'UTC')).toBe('Nov 26, 2026 00:00')
    expect(formatAnsweredAt('2026-12-31T24:00:00Z', 'UTC')).toBe('Jan 1, 2027 00:00')
  })

  it('has no text for a value the chat refuses', () => {
    expect(formatAnsweredAt(null)).toBeNull()
    expect(formatAnsweredAt(undefined)).toBeNull()
    expect(formatAnsweredAt('')).toBeNull()
    expect(formatAnsweredAt('not a date')).toBeNull()
    expect(formatAnsweredAt('2026-02-30T10:00:00Z')).toBeNull()
    expect(formatAnsweredAt('2026-13-01T10:00:00Z')).toBeNull()
    expect(formatAnsweredAt('2026-11-25T24:30:00Z')).toBeNull()
    expect(formatAnsweredAt('2026-11-25T24:00:00.5Z')).toBeNull()
    expect(formatAnsweredAt('2026-11-25T10:61:00Z')).toBeNull()
    // The fallback needs seconds and takes no offset.
    expect(formatAnsweredAt('2026-11-25 12:47')).toBeNull()
    expect(formatAnsweredAt('2026-11-25 12:47:18Z')).toBeNull()
  })

  it('has no text for a form the chat reads but this does not, so it never shows a different time', () => {
    expect(formatAnsweredAt('20261125T124718Z')).toBeNull()
    expect(formatAnsweredAt('2026-11-25T12Z')).toBeNull()
  })
})
