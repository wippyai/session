/**
 * Part and class names for one piece of the question card and its states,
 * per the Session Forms styling contract:
 * a state is `<part>-<state>` for `::part()` (which can't take attribute
 * selectors) and `w-form__<part>--<state>` for the matching class. Classes
 * carry the same names as parts so non-shadow-DOM renderers and tests share
 * one vocabulary.
 *
 * `partClass('option', selected && 'selected', hasNote && 'has-note')`
 * returns `{ part: 'option option-selected option-has-note', class:
 * 'w-form__option w-form__option--selected w-form__option--has-note' }`.
 * Falsy state arguments are dropped, so a component can pass a boolean
 * expression directly instead of pre-filtering.
 */
export interface PartClass {
  part: string
  class: string
}

export function partClass(base: string, ...states: Array<string | false | null | undefined>): PartClass {
  const active = states.filter((s): s is string => !!s)
  return {
    part: [base, ...active.map(s => `${base}-${s}`)].join(' '),
    class: [`w-form__${base}`, ...active.map(s => `w-form__${base}--${s}`)].join(' '),
  }
}
