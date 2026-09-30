/**
 * Minimal "rich text" for question cards: a backtick pair marks an inline
 * code span, and nothing else is interpreted (no other Markdown, no HTML).
 * `richSegments` returns plain data — the caller renders it as text nodes
 * (Vue text interpolation / `{{ }}`), never `innerHTML`, per the no-v-html
 * rule and the design's "never innerHTML" requirement.
 */

export interface RichSegment {
  text: string
  code: boolean
}

/**
 * Splits `text` on backticks into alternating plain/code segments. An odd
 * number of backticks leaves a trailing unmatched one, which is folded back
 * into the preceding plain segment (so a stray backtick never eats the rest
 * of the string as "code").
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

/** Plain text with backticks stripped — for contexts that can't carry markup (aria-label, etc). */
export function plainText(text: string): string {
  return String(text).replaceAll('`', '')
}
