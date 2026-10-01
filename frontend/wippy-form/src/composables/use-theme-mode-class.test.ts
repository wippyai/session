import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useThemeModeClass } from './use-theme-mode-class'

/** A component under a themed container, reporting the class the composable gives it once it has mounted and re-rendered. */
async function mountUnder(container: HTMLElement | null) {
  const Probe = defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      const modeClass = useThemeModeClass(() => el.value)
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

  it('stops watching the container once unmounted', async () => {
    const container = themedContainer('w-theme-dark')
    const wrapper = await mountUnder(container)
    wrapper.unmount()
    // Changing the container afterwards must not throw or touch the gone component.
    container.className = 'w-theme-light'
    await Promise.resolve()
    expect(container.className).toBe('w-theme-light')
  })
})
