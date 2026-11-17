import { describe, expect, it } from 'vitest'
import { noteKey, optionIndexOf, optionKey, reviewItemKey } from './focus-key'

describe('focus keys', () => {
  it('builds the data-focus value of a row, a note and a review item', () => {
    expect(optionKey(2)).toBe('opt-2')
    expect(noteKey('has spaces')).toBe('note-has spaces')
    expect(reviewItemKey(0)).toBe('review-item-0')
  })

  it('reads the index back from an option key, and gives -1 for any other key', () => {
    expect(optionIndexOf(optionKey(7))).toBe(7)
    expect(optionIndexOf('other')).toBe(-1)
    expect(optionIndexOf(noteKey('opt-3'))).toBe(-1)
    expect(optionIndexOf(undefined)).toBe(-1)
  })
})
