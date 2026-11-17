import { describe, expect, it } from 'vitest'
import { joinIds } from './aria'

describe('joinIds', () => {
  it('joins the ids with spaces', () => {
    expect(joinIds('a', 'b')).toBe('a b')
  })

  it('skips ids whose condition is false and empty values', () => {
    expect(joinIds(false, 'a', undefined, null, '', 'b')).toBe('a b')
  })

  it('is undefined when no id applies, so the attribute is left off', () => {
    expect(joinIds()).toBeUndefined()
    expect(joinIds(false, undefined, '')).toBeUndefined()
  })
})
