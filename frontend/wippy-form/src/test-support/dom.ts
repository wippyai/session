/** The element that holds `message` as its own text and has no child elements, which is the text the reader sees. */
export function textElement(root: Element, message: string): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>('*')).find(el => el.children.length === 0 && el.textContent?.trim() === message)
  if (!found)
    throw new Error(`no element holds exactly "${message}"`)
  return found
}
