/**
 * Rich text for the question card: a pair of backticks marks an inline code
 * span, and nothing else is interpreted. `richSegments` returns plain data
 * that the caller renders as text nodes, never as `innerHTML`.
 */

export interface RichSegment {
  text: string
  code: boolean
}

/**
 * Splits `text` on backticks into alternating plain and code segments. A
 * trailing unmatched backtick is folded back into the preceding plain segment,
 * so a stray one never turns the rest of the text into code.
 */
export function richSegments(text: string): RichSegment[] {
  const raw = String(text)
  const parts = raw.split('`')
  if (parts.length % 2 === 0) {
    const last = parts.pop() ?? ''
    parts[parts.length - 1] += `\`${last}`
  }
  return parts
    .map((seg, i): RichSegment => ({ text: seg, code: i % 2 === 1 }))
    .filter(seg => seg.text !== '')
}

/** The text with backticks removed, for places that cannot show markup, such as an `aria-label`. */
export function plainText(text: string): string {
  return String(text).replaceAll('`', '')
}

/**
 * Splits free text into lines on any line-break style. Each line is rendered
 * with a real `<br>` between them, because a multi-line Other answer would
 * otherwise show on one line, and `white-space` depends on a stylesheet the
 * page controls.
 */
export function textLines(text: string): string[] {
  return String(text).split(/\r\n|\r|\n/)
}
