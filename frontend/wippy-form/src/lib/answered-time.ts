/**
 * The answered time of a form, written as the Web Host chat writes a message
 * time, so the status line and the answer message beside it show the same
 * time. `submitted_at` is the answer message's own stored date.
 *
 * Since Web Host 1.0.65 (the first Host that shows Session forms), the chat
 * reads a stored time with Luxon's `DateTime.fromISO(value)`, falls back to
 * `DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss')`, and writes it in the
 * browser's time zone as `MMM d, yyyy HH:mm` with an English month. A time
 * with an offset is converted to that zone; a time with no offset is read as
 * local time there, and a local time that falls in a daylight-saving gap moves
 * forward by the gap, as Luxon does.
 *
 * The rule is that the form never shows a time that differs from the chat's.
 * The Session writes RFC 3339 UTC times (`2026-11-25T14:10:18.384685800Z`),
 * so the form reads the ISO 8601 extended form and the exact fallback, and
 * gives no answered time for anything else, including forms the chat would
 * still show (the basic `20261125T124718Z`, a week date, `T12` with no
 * minutes, any time written before the year 2000) and values the chat
 * refuses.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `YYYY-MM-DD`, or that with `THH:mm`, optional `:ss` and fraction, and an optional `Z` or `±HH[[:]mm]`. */
const ISO_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,30}))?)?([zZ]|[+-]\d{2}(?::?\d{2})?)?)?$/
/** The chat's fallback, `yyyy-MM-dd HH:mm:ss` exactly, read as local time. */
const SQL_TIME = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

interface WallTime { year: number, month: number, day: number, hour: number, minute: number, second: number }

/** An offset as minutes east of UTC (`Z` is 0, `+05:30` is 330), or `null` past ±23:59, which is no real offset. */
function offsetMinutes(offset: string): number | null {
  if (/^z$/i.test(offset))
    return 0
  const digits = offset.slice(1).replace(':', '') // `HH` or `HHmm`
  const hours = Number(digits.slice(0, 2))
  const minutes = Number(digits.slice(2, 4) || 0)
  if (hours > 23 || minutes > 59)
    return null
  const total = hours * 60 + minutes
  return offset.startsWith('-') ? -total : total
}

/** The clock time in `timeZone` (the browser's when undefined) at `instant`. */
function wallTimeAt(instant: number, timeZone: string | undefined): WallTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(instant)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === type)?.value)
  return { year: part('year'), month: part('month'), day: part('day'), hour: part('hour'), minute: part('minute'), second: part('second') }
}

/** Minutes east of UTC of `timeZone` at `instant`. */
function zoneOffset(instant: number, timeZone: string | undefined): number {
  const wall = wallTimeAt(instant, timeZone)
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second)
  return Math.round((asUtc - Math.floor(instant / 1000) * 1000) / MINUTE)
}

/**
 * The instant of a local clock time in `timeZone`, by Luxon's own method
 * (`fixOffset`): a time in a daylight-saving gap moves forward by the gap, and
 * a repeated time (the hour the clocks go back) takes one of its two instants,
 * which show the same clock time.
 */
function localInstant(wallAsUtc: number, timeZone: string | undefined): number {
  const o1 = zoneOffset(wallAsUtc, timeZone)
  let guess = wallAsUtc - o1 * MINUTE
  const o2 = zoneOffset(guess, timeZone)
  if (o1 === o2)
    return guess
  guess -= (o2 - o1) * MINUTE
  const o3 = zoneOffset(guess, timeZone)
  if (o2 === o3)
    return guess
  return wallAsUtc - Math.min(o2, o3) * MINUTE
}

/**
 * No form was answered before this year. Older values are refused: zone
 * offsets before 1972 can have seconds (Africa/Monrovia was -0:44:30), which
 * the minute-based resolution below cannot match, and Date.UTC reads years 0
 * to 99 as 1900 to 1999.
 */
const FIRST_YEAR = 2000

/** The written fields as a UTC timestamp, or `null` when they are not a real calendar day and clock time, or are before `FIRST_YEAR`. */
function writtenAsUtc(fields: string[], endOfDayAllowed: boolean, fraction: string | undefined): number | null {
  const [year, month, day, hour, minute, second] = fields.map(field => Number(field ?? 0))
  if (year < FIRST_YEAR)
    return null
  // ISO 8601 (and Luxon) read 24:00:00 as the midnight that ends the day, but not 24:00:00.5.
  const endOfDay = endOfDayAllowed && hour === 24 && minute === 0 && second === 0 && !/[1-9]/.test(fraction ?? '')
  const ts = Date.UTC(year, month - 1, day, endOfDay ? 0 : hour, minute, second)
  const check = new Date(ts)
  // Date.UTC rolls 2026-02-30 or 10:61 over, and reads years 0 to 99 as 1900 to 1999, so a rolled value is refused.
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || check.getUTCHours() !== (endOfDay ? 0 : hour) || check.getUTCMinutes() !== minute || check.getUTCSeconds() !== second)
    return null
  return endOfDay ? ts + DAY : ts
}

/**
 * The answered time for the status line, for example `Nov 25, 2026 12:47`, or
 * `null` when there is none or the chat would not show the same time.
 * `timeZone` is the IANA zone to show it in; it defaults to the browser's, as
 * in the chat.
 */
export function formatAnsweredAt(iso: string | null | undefined, timeZone?: string): string | null {
  if (!iso)
    return null
  let instant: number
  const isoMatch = ISO_TIME.exec(iso)
  const sqlMatch = isoMatch ? null : SQL_TIME.exec(iso)
  if (isoMatch) {
    const written = writtenAsUtc(isoMatch.slice(1, 7), true, isoMatch[7])
    if (written === null)
      return null
    const offset = isoMatch[8] ? offsetMinutes(isoMatch[8]) : undefined
    if (offset === null)
      return null
    instant = offset === undefined ? localInstant(written, timeZone) : written - offset * MINUTE
  }
  else if (sqlMatch) {
    const written = writtenAsUtc(sqlMatch.slice(1, 7), false, undefined)
    if (written === null)
      return null
    instant = localInstant(written, timeZone)
  }
  else {
    return null
  }
  const shown = wallTimeAt(instant, timeZone)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${MONTHS[shown.month - 1]} ${shown.day}, ${shown.year} ${pad(shown.hour)}:${pad(shown.minute)}`
}
