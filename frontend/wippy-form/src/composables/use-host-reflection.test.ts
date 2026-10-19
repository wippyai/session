import type { Ref } from 'vue'
import type { HostState } from './use-host-reflection'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { ELEMENT_PROVIDER } from '../element-context'
import { useHostReflection } from './use-host-reflection'

/** A no-op component that only wires useHostReflection to the given refs. */
function reflectionHarness(state: Ref<HostState>, collapsed: Ref<boolean>) {
  return defineComponent({
    setup() {
      useHostReflection(state, collapsed)
      return () => null
    },
  })
}

/** Mounts the harness against a real element. */
function mountReflection(element: HTMLElement) {
  const state = ref<HostState>('active')
  const collapsed = ref(false)
  const wrapper = mount(reflectionHarness(state, collapsed), {
    global: { provide: { [ELEMENT_PROVIDER as unknown as symbol]: element } },
  })
  return { wrapper, state, collapsed }
}

describe('useHostReflection', () => {
  it('reflects the initial state and collapsed values onto the host element', async () => {
    const el = document.createElement('wippy-form')
    const { wrapper } = mountReflection(el)
    await wrapper.vm.$nextTick()
    expect(el.getAttribute('card-state')).toBe('active')
    expect(el.hasAttribute('collapsed')).toBe(false)
  })

  it('updates the attributes when the refs change', async () => {
    const el = document.createElement('wippy-form')
    const { wrapper, state, collapsed } = mountReflection(el)
    await wrapper.vm.$nextTick()

    state.value = 'review'
    collapsed.value = true
    await wrapper.vm.$nextTick()

    expect(el.getAttribute('card-state')).toBe('review')
    expect(el.hasAttribute('collapsed')).toBe(true)

    state.value = 'answered'
    collapsed.value = false
    await wrapper.vm.$nextTick()

    expect(el.getAttribute('card-state')).toBe('answered')
    expect(el.hasAttribute('collapsed')).toBe(false)
  })

  it('does nothing (and does not throw) when no ELEMENT_PROVIDER is injected', async () => {
    const harness = reflectionHarness(ref<HostState>('active'), ref(false))
    expect(() => mount(harness)).not.toThrow()
  })

  it('never writes the observed `state` prop attribute: only `card-state`, to avoid triggering a reload loop', async () => {
    const el = document.createElement('wippy-form')
    const { wrapper, state } = mountReflection(el)
    await wrapper.vm.$nextTick()
    state.value = 'review'
    await wrapper.vm.$nextTick()

    // `state` is the wippy-form custom element's own observed prop
    // attribute (active/idle lifecycle), the reflection must never touch
    // it, or the Host's prop-change watcher (use-form-state.ts) sees a
    // spurious change and reloads.
    expect(el.hasAttribute('state')).toBe(false)
  })
})
