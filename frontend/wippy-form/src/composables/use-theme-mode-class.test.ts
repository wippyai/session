import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useThemeModeClass } from './use-theme-mode-class'

/** A component under a themed container, reporting the class the composable gives it once it has mounted and re-rendered. */
async function mountUnder(container: HTMLElement | null, enabled?: () => boolean) {
  const Probe = defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      const modeClass = useThemeModeClass(() => el.value, enabled)
      return () => h('div', { ref: el, id: 'probe', class: modeClass.value }, modeClass.value || 'auto')
    },
  })
  const wrapper = mount(Probe, { attachTo: container ?? document.body })
  await nextTick()
  return wrapper
}

function themedContainer(className = ''): HTMLElement {
  const container = document.createElement('div')
  container.setAttribute('data-wippy-theme-root', '')
  if (className)
    container.className = className
  document.body.appendChild(container)
  return container
}

describe('useThemeModeClass', () => {
  it('gives the forced dark class of the themed container', async () => {
    const wrapper = await mountUnder(themedContainer('w-theme-dark'))
    expect(wrapper.text()).toBe('w-theme-dark')
  })

  it('gives the forced light class of the themed container', async () => {
    const wrapper = await mountUnder(themedContainer('w-theme-light'))
    expect(wrapper.text()).toBe('w-theme-light')
  })

  it('gives nothing when the theme follows the OS (no class on the container)', async () => {
    const wrapper = await mountUnder(themedContainer())
    expect(wrapper.text()).toBe('auto')
  })

  it('gives nothing outside a themed container', async () => {
    const wrapper = await mountUnder(null)
    expect(wrapper.text()).toBe('auto')
  })

  it('follows the container when the Host switches the theme', async () => {
    const container = themedContainer('w-theme-light')
    const wrapper = await mountUnder(container)
    expect(wrapper.text()).toBe('w-theme-light')

    container.classList.replace('w-theme-light', 'w-theme-dark')
    await nextTick()
    await Promise.resolve()
    await nextTick()
    expect(wrapper.text()).toBe('w-theme-dark')

    container.classList.remove('w-theme-dark')
    await Promise.resolve()
    await nextTick()
    expect(wrapper.text()).toBe('auto')
  })

  describe('the observer', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('observes the container while mounted and disconnects exactly that observer on unmount', async () => {
      const container = themedContainer('w-theme-dark')
      const observe = vi.spyOn(MutationObserver.prototype, 'observe')
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
      const wrapper = await mountUnder(container)

      // The positive control: an observer really was installed on the container, and not yet released.
      expect(observe.mock.calls.filter(([target]) => target === container)).toHaveLength(1)
      expect(disconnect).not.toHaveBeenCalled()

      wrapper.unmount()
      expect(disconnect).toHaveBeenCalledTimes(1)
    })

    it('installs no observer while disabled, observes once enabled and releases it when disabled again', async () => {
      const container = themedContainer('w-theme-dark')
      const enabled = ref(false)
      const observe = vi.spyOn(MutationObserver.prototype, 'observe')
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
      const observedContainer = () => observe.mock.calls.filter(([target]) => target === container).length
      const wrapper = await mountUnder(container, () => enabled.value)
      expect(observedContainer()).toBe(0)
      expect(wrapper.text()).toBe('auto')

      enabled.value = true
      await nextTick()
      expect(observedContainer()).toBe(1)
      expect(wrapper.text()).toBe('w-theme-dark')

      enabled.value = false
      await nextTick()
      expect(disconnect).toHaveBeenCalledTimes(1)

      // The theme moved while it was off; turning it on reads the container again.
      container.className = 'w-theme-light'
      enabled.value = true
      await nextTick()
      await nextTick()
      expect(observedContainer()).toBe(2)
      expect(wrapper.text()).toBe('w-theme-light')
    })
  })
})
