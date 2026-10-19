import type { Ref } from 'vue'
import { inject, watchEffect } from 'vue'
import { ELEMENT_PROVIDER } from '../element-context'

export type HostState = 'loading' | 'active' | 'review' | 'answered' | 'unsupported'

/**
 * Reflects `card-state` and `collapsed` onto the host element, so a page can
 * style `wippy-form[card-state="review"]` and `wippy-form[collapsed]`. It must
 * not write `state`, which is an observed prop: the write would count as a
 * change of that prop and reload the form.
 */
export function useHostReflection(state: Ref<HostState>, collapsed: Ref<boolean>): void {
  const element = inject(ELEMENT_PROVIDER)
  if (!element)
    return
  watchEffect(() => {
    element.setAttribute('card-state', state.value)
    element.toggleAttribute('collapsed', collapsed.value)
  })
}
