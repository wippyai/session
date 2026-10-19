import { describe, expect, it } from 'vitest'
import { partAttrs, partSelector } from './part-attrs'

describe('partAttrs', () => {
  it('gives the part and the class of a piece with no state', () => {
    expect(partAttrs('card')).toEqual({ part: 'card', class: 'w-form__card' })
  })

  it('adds a part and a class for each state', () => {
    expect(partAttrs('option', 'selected', 'has-note')).toEqual({
      part: 'option option-selected option-has-note',
      class: 'w-form__option w-form__option--selected w-form__option--has-note',
    })
  })

  it('drops falsy states, so a condition can be passed directly', () => {
    expect(partAttrs('option', false, null, undefined, '')).toEqual({ part: 'option', class: 'w-form__option' })
    expect(partAttrs('option', 1 > 0 && 'selected')).toEqual({ part: 'option option-selected', class: 'w-form__option w-form__option--selected' })
  })
})

describe('partSelector', () => {
  it('is the class selector of a part, with or without a state', () => {
    expect(partSelector('option-main')).toBe('.w-form__option-main')
    expect(partSelector('option', 'selected')).toBe('.w-form__option--selected')
  })
})
