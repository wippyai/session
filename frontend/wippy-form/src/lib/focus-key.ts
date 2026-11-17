/** Where focus goes next in the card. The `data-focus` attribute of the target element holds the same value. */
export type FocusTarget = 'first' | 'card' | 'send' | 'send-all' | 'other' | `opt-${number}` | `note-${string}` | `review-item-${number}`

export function optionKey(index: number): FocusTarget {
  return `opt-${index}`
}

export function noteKey(optionValue: string): FocusTarget {
  return `note-${optionValue}`
}

export function reviewItemKey(index: number): FocusTarget {
  return `review-item-${index}`
}

/** The option index a `data-focus` value names, or -1 when it names something else. */
export function optionIndexOf(key: string | undefined): number {
  return key?.startsWith('opt-') ? Number(key.slice(4)) : -1
}
