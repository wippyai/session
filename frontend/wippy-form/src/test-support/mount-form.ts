import type { ComponentProps } from '../types'
import { mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { ref } from 'vue'
import WippyForm from '../app/wippy-form.vue'
import { ELEMENT_PROVIDER } from '../element-context'

/** A real element carrying the artifact id the Host sets. A MutationObserver needs a real node. */
export function artifactElement(id: string | null): HTMLElement {
  const el = document.createElement('div')
  if (id)
    el.setAttribute('data-wippy-artifact-id', id)
  return el
}

interface MountFormOptions {
  attachToBody?: boolean
  /** Render the real `<transition>` that a browser has, instead of the test-utils stub that adds an element. */
  realTransition?: boolean
}

/**
 * Mounts `wippy-form.vue` with the providers the custom element base class gives
 * it. Without an `element`, the form has no artifact identity.
 */
export function mountWippyForm(props: ComponentProps, element?: HTMLElement, { attachToBody, realTransition }: MountFormOptions = {}) {
  const provide: Record<symbol, unknown> = {
    [PROPS_PROVIDER as unknown as symbol]: ref(props),
    [PROPS_ERROR_PROVIDER as unknown as symbol]: ref([]),
  }
  if (element)
    provide[ELEMENT_PROVIDER as unknown as symbol] = element

  return mount(WippyForm, {
    attachTo: attachToBody ? document.body : undefined,
    global: {
      plugins: [PrimeVuePlugin],
      stubs: realTransition ? { transition: false } : undefined,
      provide,
    },
  })
}
