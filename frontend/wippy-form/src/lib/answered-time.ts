/**
 * The answered time of a form, written like the times of the chat around it:
 * the Web Host writes a message time as `MMM d, yyyy HH:mm` ("Nov 25, 2026
 * 12:47"), in the user's time zone and with an English month whatever the
 * browser's locale, so the form does the same. The form's own text is English
 * too.
 */
const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const TIME = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** The answered time for the status line, or `null` when there is none or it is not a date. */
export function formatAnsweredAt(iso: string | null | undefined): string | null {
  const date = iso ? new Date(iso) : null
  if (!date || Number.isNaN(date.getTime()))
    return null
  return `${DATE.format(date)} ${TIME.format(date)}`
}
