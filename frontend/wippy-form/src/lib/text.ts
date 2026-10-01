/**
 * Text primitives shared by every client-side answer rule. Each one mirrors
 * the server (`src/forms/form_text.lua`) so a value judged blank, too long
 * or unsafe here is judged the same there.
 */

/**
 * The trim rule for free text (an Other answer, a note, an email address),
 * the same plain `trim()` the server applies, so text that trims blank here
 * trims blank there. It strips U+3000 (ideographic space) and keeps U+200B
 * (zero width space).
 */
export function trimAnswerText(raw: string): string {
  return raw.trim()
}

/**
 * Counts Unicode code points, as the server does. `raw.length` counts UTF-16
 * code units, so it would count an emoji stored as a surrogate pair as two.
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
