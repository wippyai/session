/**
 * True when nothing on the page holds focus, as after the focused control was
 * removed or disabled. Focus inside a shadow root shows on the document as the
 * shadow host, so an element in one counts as holding focus.
 */
export function pageHasNoFocus(element: Element): boolean {
  const doc = element.ownerDocument
  const active = doc.activeElement
  return !active || active === doc.body || active === doc.documentElement
}
