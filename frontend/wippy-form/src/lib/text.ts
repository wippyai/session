/**
 * Text primitives shared by every client-side answer rule. Each one mirrors
 * the server (`src/forms/form_text.lua`) so a value judged blank, too long
 * or unsafe here is judged the same there.
 */

/**
 * The one client-side trim rule for free-text answer content — an "Other"
 * answer, a note or an email — used here and by every question-card call site
 * that needs to know whether such text is blank. Plain
 * `String.prototype.trim()`, matching the server's own trim rule, so a string
 * that trims blank here also trims blank there and vice versa. `trim()`
 * strips ECMAScript `WhiteSpace` (e.g. U+3000 IDEOGRAPHIC SPACE, a real space
 * character) but leaves Unicode's own zero-width characters alone (e.g.
 * U+200B ZERO WIDTH SPACE is not whitespace and still counts as content) —
 * see `answers.test.ts`.
 */
export function trimAnswerText(raw: string): string {
  return raw.trim()
}

/**
 * Counts Unicode code points, not UTF-16 code units — a `raw.length` check
 * over-counts astral characters (e.g. many emoji) that are stored as
 * surrogate pairs. The server counts code points too, so this must match.
 */
export function codePointLength(raw: string): number {
  return Array.from(raw).length
}

/** True when `raw` is empty or only whitespace in the server's trim set. */
export function isBlank(raw: string): boolean {
  return trimAnswerText(raw) === ''
}

/**
 * Browsers hand a `<textarea>` value back with LF line breaks already, but a
 * value set from script or pasted through another path can still carry CRLF
 * or a lone CR. The server rejects CR, so every line break is normalized to
 * LF before the text is sent or measured.
 */
export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

/**
 * True when `text` has a character the server refuses in answer text: ASCII
 * C0 (and DEL), other than tab and line feed where `multiline`; C1
 * (U+0080-U+009F); the bidi override and isolate controls (U+202A-U+202E,
 * U+2066-U+2069); the line and paragraph separators U+2028/U+2029; or a lone
 * surrogate, which has no valid UTF-8 form. A loop over code points rather
 * than a regular expression with control-character escapes keeps the rule
 * readable and in the same order as the Lua `has_control_characters`.
 */
export function hasControlCharacters(text: string, multiline: boolean): boolean {
  for (const char of text) {
    const code = char.codePointAt(0) as number
    if (code < 0x80) {
      const isC0 = code < 32 || code === 127
      if (isC0 && !(multiline && (code === 9 || code === 10)))
        return true
    }
    else if (
      (code >= 0x80 && code <= 0x9F)
      || (code >= 0x202A && code <= 0x202E)
      || (code >= 0x2066 && code <= 0x2069)
      || code === 0x2028
      || code === 0x2029
      || (code >= 0xD800 && code <= 0xDFFF)
    ) {
      return true
    }
  }
  return false
}
