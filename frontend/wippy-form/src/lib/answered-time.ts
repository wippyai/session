/**
 * The answered time of a form, written as the Web Host chat writes a message
 * time, so the status line and the answer message beside it show the same
 * time. `submitted_at` is the answer message's own stored date.
 *
 * Since Web Host 1.0.65 (the first Host that shows Session forms), the chat
 * reads an ISO time with Luxon's `DateTime.fromISO(value)` and writes it as
 * `MMM d, yyyy HH:mm` with an English month: a time with an offset (`Z`,
 * `+01:00`) is shown in the browser's time zone, and a time with no offset is
 * read as the browser's local time, so its written clock time is shown.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * `YYYY-MM-DD`, optionally `THH:mm[:ss[.fraction]]` (or a space before the
 * time), optionally `Z` or `±HH[[:]mm]`: the forms of a stored time that
 * Luxon reads, including the ones `Date` does not (`+05`, a comma fraction).
 */
const ISO_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:[.,]\d+)?)?)?([zZ]|[+-]\d{2}(?::?\d{2})?)?$/

/** An offset as minutes east of UTC: `Z` is 0, `+05:30` is 330. */
function offsetMinutes(offset: string): number {
  if (/^z$/i.test(offset))
    return 0
  const digits = offset.slice(1).replace(':', '') // `HH` or `HHmm`
  const minutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4) || 0)
  return offset.startsWith('-') ? -minutes : minutes
}

const pad = (n: number) => String(n).padStart(2, '0')
const write = (year: number, month: number, day: number, hour: number, minute: number) => `${MONTHS[month - 1]} ${day}, ${year} ${pad(hour)}:${pad(minute)}`

/**
 * The answered time for the status line, for example `Nov 25, 2026 12:47`, or
 * `null` when there is none or it is not a valid ISO time. `timeZone` is the
 * IANA zone to show it in; it defaults to the browser's, as in the chat.
 */
export function formatAnsweredAt(iso: string | null | undefined, timeZone?: string): string | null {
  const match = iso ? ISO_TIME.exec(iso.trim()) : null
  if (!match)
    return null
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(part => Number(part ?? 0))
  // ISO 8601 (and Luxon) read 24:00:00 as the midnight that ends the day.
  const endOfDay = hour === 24 && minute === 0 && second === 0
  const written = new Date(Date.UTC(year, month - 1, day, endOfDay ? 0 : hour, minute))
  // A real calendar day and clock time: Date.UTC rolls 2026-02-30 or 10:61 over, so a rolled value is refused.
  if (written.getUTCFullYear() !== year || written.getUTCMonth() !== month - 1 || written.getUTCDate() !== day || written.getUTCHours() !== (endOfDay ? 0 : hour) || written.getUTCMinutes() !== minute || second > 59)
    return null
  const fields = endOfDay ? new Date(written.getTime() + 24 * 60 * 60 * 1000) : written
  const offset = match[7]
  // No offset: the chat reads the value as the browser's local time, so the written clock time shows.
  if (!offset)
    return write(fields.getUTCFullYear(), fields.getUTCMonth() + 1, fields.getUTCDate(), fields.getUTCHours(), fields.getUTCMinutes())
  const instant = fields.getTime() - offsetMinutes(offset) * 60 * 1000
  const parts = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).formatToParts(instant)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === type)?.value)
  return write(part('year'), part('month'), part('day'), part('hour'), part('minute'))
}
