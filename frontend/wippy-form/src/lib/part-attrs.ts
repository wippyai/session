/** The `part` and `class` attributes of one piece of the question card. */
export interface PartAttrs {
  part: string
  class: string
}

/**
 * The attributes of one piece of the card and its states. A state is the part
 * `<part>-<state>`, because `::part()` cannot take attribute selectors, and the
 * class `w-form__<part>--<state>`. Falsy states are dropped, so a caller can
 * pass a condition directly.
 *
 * `partAttrs('option', selected && 'selected')` is `{ part: 'option
 * option-selected', class: 'w-form__option w-form__option--selected' }` when
 * `selected` is true.
 */
export function partAttrs(base: string, ...states: Array<string | false | null | undefined>): PartAttrs {
  const active = states.filter((s): s is string => !!s)
  return {
    part: [base, ...active.map(s => `${base}-${s}`)].join(' '),
    class: [`w-form__${base}`, ...active.map(s => `w-form__${base}--${s}`)].join(' '),
  }
}

/** The class selector of a part, for `closest()` and `querySelector()`. */
export function partSelector(base: string, state?: string): string {
  return state ? `.w-form__${base}--${state}` : `.w-form__${base}`
}
