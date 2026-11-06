/** The element that holds `message` as its own text and has no child elements, which is the text the reader sees. */
export function textElement(root: Element, message: string): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>('*')).find(el => el.children.length === 0 && el.textContent?.trim() === message)
  if (!found)
    throw new Error(`no element holds exactly "${message}"`)
  return found
}

/**
 * What a browser does when the focused control becomes disabled, which jsdom
 * does not: focus falls to <body>. Returns the function that stops it.
 */
export function applyFocusFixup(root: Element): () => void {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const el = record.target as HTMLElement
      if (el !== document.activeElement || !el.matches(':disabled'))
        continue
      // jsdom's blur() does nothing for a disabled element, so the attribute
      // is lifted for the call and put back (a browser needs no such step).
      el.removeAttribute('disabled')
      el.blur()
      el.setAttribute('disabled', '')
    }
  })
  observer.observe(root, { attributes: true, attributeFilter: ['disabled'], subtree: true })
  return () => observer.disconnect()
}
