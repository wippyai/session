import type { DateFormField, FieldAnswer, FieldError } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { flushPromises, mount } from '@vue/test-utils'
import userEvent from '@testing-library/user-event'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DateField from './date-field.vue'
import FormFieldControl from './form-field.vue'

/*
 * The date box is typed into one key at a time. These tests drive it the way
 * a keyboard does (one `input` event per key, the parent feeding the reported
 * draft straight back in), because a test that sets a whole value at once
 * never lets the parent re-render between keys — which is exactly where a
 * date picker that rewrites its own box loses what was typed.
 */

const field: DateFormField = { id: 'day', type: 'date', label: 'Delivery date', required: true, min: '2026-01-01', max: '2027-12-31' }

interface Mounted {
  wrapper: ReturnType<typeof mount>
  input: HTMLInputElement
  /** The draft the form would hold: the last value the field reported. */
  draft: () => FieldAnswer | undefined
  /** Shows errors on the field, as a failed submit does. */
  setErrors: (errors: FieldError[]) => Promise<void>
}

/** The field with a parent that feeds every reported value back in, like the form does. */
function mountField(initial?: string, errors: FieldError[] = [], dateField: DateFormField = field): Mounted {
  let reported: FieldAnswer | undefined = initial
  const wrapper = mount(DateField, {
    props: {
      field: dateField,
      modelValue: initial,
      errors,
      disabled: false,
      readonly: false,
      'onUpdate:modelValue': (value: FieldAnswer | undefined) => {
        reported = value
        void wrapper.setProps({ modelValue: value })
      },
    },
    global: { plugins: [PrimeVuePlugin] },
    attachTo: document.body,
  })
  return {
    wrapper,
    input: wrapper.find('input').element as HTMLInputElement,
    draft: () => reported,
    setErrors: async (next) => { await wrapper.setProps({ errors: next }) },
  }
}

/** One `input` event for the text now in the box, like a key press or a paste. */
async function inputEvent(input: HTMLInputElement, text: string) {
  input.value = text
  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
  await flushPromises()
}

/** Types `text` at the end of the box, one key at a time, checking after each key that the box still holds what was typed. */
async function typeKeys(input: HTMLInputElement, text: string) {
  input.focus()
  let typed = input.value
  for (const key of text) {
    typed += key
    await inputEvent(input, typed)
    expect(input.value, `after typing "${typed}"`).toBe(typed)
  }
}

async function blur(input: HTMLInputElement) {
  input.dispatchEvent(new FocusEvent('blur'))
  await flushPromises()
}

const INVALID_DATE: FieldError[] = [{ code: 'invalid_date', message: 'Enter a valid date as YYYY-MM-DD.' }]

describe('date field: typing', () => {
  it('keeps every key in the box while a date is typed one key at a time', async () => {
    const { input } = mountField()
    await typeKeys(input, '2026-06-15')
    expect(input.value).toBe('2026-06-15')
  })

  it('updates the draft with the full date once it is typed', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2026-06-15')
    expect(draft()).toBe('2026-06-15')
  })

  it('shows what was typed at every step, including the steps that are not dates yet', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2026-06-')
    expect(input.value).toBe('2026-06-')
    expect(draft()).toBe('2026-06-')
  })

  it('reports text it cannot parse as typed, and keeps it in the box', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, 'next tuesday')
    expect(input.value).toBe('next tuesday')
    expect(draft()).toBe('next tuesday')
  })

  it('reports an impossible day (February 30) as typed, and keeps it in the box', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2026-02-30')
    expect(input.value).toBe('2026-02-30')
    expect(draft()).toBe('2026-02-30')
  })

  it('reports a date outside min and max as typed, and keeps it in the box', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2025-12-31')
    expect(input.value).toBe('2025-12-31')
    expect(draft()).toBe('2025-12-31')
    await inputEvent(input, '2028-01-01')
    expect(input.value).toBe('2028-01-01')
    expect(draft()).toBe('2028-01-01')
  })

  it('keeps the old text of a valid date out of the box when invalid text is pasted over it', async () => {
    const { input, draft } = mountField('2026-12-31')
    await inputEvent(input, '2026-02-30')
    expect(input.value).toBe('2026-02-30')
    expect(draft()).toBe('2026-02-30')
    await inputEvent(input, 'not a date')
    expect(input.value).toBe('not a date')
    expect(draft()).toBe('not a date')
    await inputEvent(input, '31/12/2026')
    expect(input.value).toBe('31/12/2026')
  })

  it('does not rewrite the box while the user edits in the middle of the text', async () => {
    const { input } = mountField()
    await typeKeys(input, '2026-06-15')
    input.setSelectionRange(5, 5)
    input.value = '2026-x06-15'
    input.setSelectionRange(6, 6)
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'x' }))
    await flushPromises()
    expect(input.value).toBe('2026-x06-15')
    // A rewrite of the box would have moved the caret to the end.
    expect(input.selectionStart).toBe(6)
  })

  it('reports an emptied box as empty text', async () => {
    const { input, draft } = mountField('2026-06-15')
    await inputEvent(input, '')
    expect(input.value).toBe('')
    expect(draft()).toBe('')
  })

  it('keeps the typed text when an error appears on the field', async () => {
    const { input, setErrors } = mountField('2026-12-31')
    await inputEvent(input, '2026-02-30')
    await setErrors(INVALID_DATE)
    expect(input.value).toBe('2026-02-30')
  })

  it('keeps the typed text when the field is disabled and enabled again (a submit in flight)', async () => {
    const { wrapper, input } = mountField()
    await typeKeys(input, 'next tuesday')
    await wrapper.setProps({ disabled: true })
    await wrapper.setProps({ disabled: false })
    expect(input.value).toBe('next tuesday')
  })

  it('keeps unparseable text in the box after leaving it, so the user can correct it', async () => {
    const { input, draft } = mountField('2026-06-15')
    input.focus()
    await inputEvent(input, 'next tuesday')
    await blur(input)
    expect(input.value).toBe('next tuesday')
    expect(draft()).toBe('next tuesday')
  })

  it('keeps an impossible date in the box after leaving it', async () => {
    const { input } = mountField()
    await typeKeys(input, '2026-02-30')
    await blur(input)
    expect(input.value).toBe('2026-02-30')
  })

  it('leaves a valid typed date as it was typed after leaving the box', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2026-06-15')
    await blur(input)
    expect(input.value).toBe('2026-06-15')
    expect(draft()).toBe('2026-06-15')
  })

  it('shows a date typed in a looser form in the form it is saved in once the box is left', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2026-6-5')
    // The picker understood the text, so what will be saved is the full date.
    expect(draft()).toBe('2026-06-05')
    await blur(input)
    expect(input.value).toBe('2026-06-05')
  })

  it('goes on typing after a blur', async () => {
    const { input, draft } = mountField()
    await typeKeys(input, '2026-06')
    await blur(input)
    await typeKeys(input, '-15')
    expect(input.value).toBe('2026-06-15')
    expect(draft()).toBe('2026-06-15')
  })
})

/** The enabled days of the month the calendar shows (not the greyed days of the months around it). */
function enabledDays(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.p-datepicker-day'))
    .filter(el => el.getAttribute('aria-disabled') !== 'true' && !(el.getAttribute('data-p') ?? '').includes('other-month'))
}

function dayCell(label: string): HTMLElement {
  const cell = enabledDays().find(el => el.textContent?.trim() === label)
  if (!cell)
    throw new Error(`no enabled day cell "${label}"`)
  return cell
}

/** The month name in the open calendar's header. */
function shownMonth(): string | undefined {
  return document.querySelector('.p-datepicker-select-month')?.textContent?.trim()
}

async function openCalendar(wrapper: Mounted['wrapper']) {
  await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
  await nextTick()
}

describe('date field: width of the control', () => {
  // The stylesheet bounds the control through this part and class (see
  // styles.test.ts); without them the date box would fill the whole form and
  // so would the calendar the theme opens at least as wide as it.
  it('names the picker as the date state of the input part and class, which the stylesheet bounds in width', () => {
    const { wrapper } = mountField()
    const picker = wrapper.find('.p-datepicker')
    expect(picker.attributes('part')?.split(' ')).toEqual(['field-input', 'field-input-date'])
    expect(picker.classes()).toEqual(expect.arrayContaining(['w-form__field-input', 'w-form__field-input--date']))
  })

  it('leaves the input fields of other types without the date state', () => {
    const wrapper = mount(FormFieldControl, { props: { field: { id: 'a', type: 'text', label: 'A', required: false }, modelValue: undefined, errors: [], disabled: false, readonly: false }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.find('input').attributes('part')).toBe('field-input')
  })
})

describe('date field: calendar', () => {
  it('puts a day picked in the calendar in the draft and the box', async () => {
    const { wrapper, input, draft } = mountField('2026-10-15')
    await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
    await nextTick()
    dayCell('20').click()
    await flushPromises()
    expect(draft()).toBe('2026-10-20')
    expect(input.value).toBe('2026-10-20')
  })

  it('replaces unparseable typed text when a day is picked', async () => {
    const { wrapper, input, draft } = mountField()
    await typeKeys(input, 'next tuesday')
    await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
    await nextTick()
    // The calendar opens on the current month; any enabled day will do.
    enabledDays()[0]?.click()
    await flushPromises()
    expect(draft()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(input.value).toBe(draft())
  })

  it('keeps the typed text in the box when the calendar is opened and closed without a pick', async () => {
    const { wrapper, input, draft } = mountField('2026-06-15')
    await inputEvent(input, 'next tuesday')
    await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
    await nextTick()
    expect(input.value).toBe('next tuesday')
    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }))
    await flushPromises()
    expect(input.value).toBe('next tuesday')
    expect(draft()).toBe('next tuesday')
  })

  it('shows a value the draft changes to from outside', async () => {
    const { wrapper, input } = mountField('2026-06-15')
    await wrapper.setProps({ modelValue: '2026-07-01' })
    await flushPromises()
    expect(input.value).toBe('2026-07-01')
  })
})

describe('date field: calendar overlay', () => {
  /** The field mounted inside a shadow root, as the web component is: a themed container next to the overlay layer the theme plugin creates. */
  function mountInShadow(themeClass = 'w-theme-dark') {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    container.setAttribute('data-wippy-theme-root', '')
    if (themeClass)
      container.className = themeClass
    shadow.appendChild(container)
    const app = createApp(defineComponent({
      setup: () => {
        const value = ref<FieldAnswer | undefined>('2026-10-15')
        return () => h(DateField, { 'field': field, 'modelValue': value.value, 'errors': [], 'disabled': false, 'readonly': false, 'onUpdate:modelValue': (v: FieldAnswer | undefined) => { value.value = v } })
      },
    }))
    app.use(PrimeVuePlugin)
    app.mount(container)
    return { host, shadow, container, app }
  }

  async function openCalendar(shadow: ShadowRoot) {
    await nextTick()
    shadow.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')?.click()
    await nextTick()
    await nextTick()
    const panel = shadow.querySelector<HTMLElement>('.p-datepicker-panel')
    expect(panel, 'the calendar is open').not.toBeNull()
    return panel as HTMLElement
  }

  it('carries the forced Dark theme class of the container, so the Dark theme reaches it', async () => {
    const { host, shadow, app } = mountInShadow('w-theme-dark')
    const panel = await openCalendar(shadow)
    expect(panel.classList.contains('w-theme-dark')).toBe(true)
    expect(panel.classList.contains('w-theme-light')).toBe(false)
    app.unmount()
    host.remove()
  })

  it('carries the forced Light theme class of the container', async () => {
    const { host, shadow, app } = mountInShadow('w-theme-light')
    const panel = await openCalendar(shadow)
    expect(panel.classList.contains('w-theme-light')).toBe(true)
    expect(panel.classList.contains('w-theme-dark')).toBe(false)
    app.unmount()
    host.remove()
  })

  it('carries no theme class when the theme follows the OS, so the OS scheme applies', async () => {
    const { host, shadow, app } = mountInShadow('')
    const panel = await openCalendar(shadow)
    expect(panel.classList.contains('w-theme-dark')).toBe(false)
    expect(panel.classList.contains('w-theme-light')).toBe(false)
    app.unmount()
    host.remove()
  })

  it('follows the theme while the calendar is open', async () => {
    const { host, shadow, container, app } = mountInShadow('w-theme-light')
    const panel = await openCalendar(shadow)
    container.classList.replace('w-theme-light', 'w-theme-dark')
    await Promise.resolve()
    await nextTick()
    expect(panel.classList.contains('w-theme-dark')).toBe(true)
    expect(panel.classList.contains('w-theme-light')).toBe(false)
    app.unmount()
    host.remove()
  })

  it('opens in the theme plugin\'s overlay layer, outside the message around the form, so no ancestor clips it', async () => {
    const { host, shadow, container, app } = mountInShadow()
    const panel = await openCalendar(shadow)
    expect(panel.closest('[data-wippy-overlay-layer]'), 'inside the overlay layer').not.toBeNull()
    expect(container.contains(panel), 'not inline in the form').toBe(false)
    app.unmount()
    host.remove()
  })

  it('names the calendar as a part and a class, for the styling API', async () => {
    const { host, shadow, app } = mountInShadow()
    const panel = await openCalendar(shadow)
    expect(panel.getAttribute('part')).toContain('field-calendar')
    expect(panel.classList.contains('w-form__field-calendar')).toBe(true)
    app.unmount()
    host.remove()
  })
})

describe('date field: a tap on a touch screen', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** Makes `(pointer: coarse)` match or not, as on a touch screen or with a mouse. */
  function usePointer(coarse: boolean) {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: coarse && query === '(pointer: coarse)',
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList)
  }

  const tap = (input: HTMLInputElement) => input.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  const expanded = (input: HTMLInputElement) => input.getAttribute('aria-expanded')

  // PrimeVue gives the box inputmode="none" (no keyboard on a phone) and the
  // field never opens on focus, so without this a tap on the box did nothing.
  it('opens the calendar when the box is tapped', async () => {
    usePointer(true)
    const { input } = mountField()
    expect(expanded(input)).toBe('false')
    tap(input)
    await flushPromises()
    expect(expanded(input)).toBe('true')
    expect(document.querySelector('.p-datepicker-panel')).not.toBeNull()
  })

  it('leaves the calendar open on a second tap', async () => {
    usePointer(true)
    const { input } = mountField()
    tap(input)
    await flushPromises()
    tap(input)
    await flushPromises()
    expect(expanded(input)).toBe('true')
  })

  it('does not open the calendar on a click with a mouse: it opens from its button, so a typist can just type', async () => {
    usePointer(false)
    const { input } = mountField()
    tap(input)
    await flushPromises()
    expect(expanded(input)).toBe('false')
    expect(document.querySelector('.p-datepicker-panel')).toBeNull()
  })

  it('does not open the calendar on focus, even on a touch screen, so a hardware keyboard can still type', async () => {
    usePointer(true)
    const { input } = mountField()
    input.focus()
    input.dispatchEvent(new FocusEvent('focus'))
    await flushPromises()
    expect(expanded(input)).toBe('false')
  })

  it('does not open the calendar of a disabled field', async () => {
    usePointer(true)
    const { wrapper, input } = mountField()
    await wrapper.setProps({ disabled: true })
    tap(input)
    await flushPromises()
    expect(expanded(input)).toBe('false')
  })
})

describe('date field: a reload of the form', () => {
  it('leaves the calendar on the month the user navigated to when the field arrives again with the same content', async () => {
    const { wrapper } = mountField('2026-10-15')
    await openCalendar(wrapper)
    expect(shownMonth()).toBe('October')
    document.querySelector<HTMLElement>('.p-datepicker-next-button')?.click()
    await flushPromises()
    expect(shownMonth()).toBe('November')

    // A state reload hands over a new field object; its min and max are the same text.
    await wrapper.setProps({ field: { ...field } })
    await flushPromises()
    expect(shownMonth()).toBe('November')
  })

  it('still applies a bound that really changed', async () => {
    const { wrapper } = mountField('2026-10-15')
    await openCalendar(wrapper)
    expect(enabledDays().some(el => el.textContent?.trim() === '25')).toBe(true)
    await wrapper.setProps({ field: { ...field, max: '2026-10-20' } })
    await flushPromises()
    expect(enabledDays().some(el => el.textContent?.trim() === '25')).toBe(false)
    expect(enabledDays().some(el => el.textContent?.trim() === '20')).toBe(true)
  })
})

describe('date field: years before 1000', () => {
  // No min and max: with them PrimeVue would refuse the text instead of rewriting it.
  const unbounded: DateFormField = { id: 'day', type: 'date', label: 'Delivery date', required: true }

  // PrimeVue reads a year below 100 as a two-digit year (0050 becomes 1950).
  it.each(['0050-03-04', '0099-12-31'])('reports %s as typed, not as the date the picker reads from it', async (text) => {
    const { input, draft } = mountField(undefined, [], unbounded)
    await typeKeys(input, text)
    expect(draft()).toBe(text)
    expect(input.value).toBe(text)
    await blur(input)
    expect(input.value).toBe(text)
    expect(draft()).toBe(text)
  })

  // PrimeVue writes the year without padding (999-05-15).
  it.each(['0100-02-03', '0999-05-15'])('reports %s with its four-digit year', async (text) => {
    const { input, draft } = mountField(undefined, [], unbounded)
    await typeKeys(input, text)
    expect(draft()).toBe(text)
    await blur(input)
    expect(input.value).toBe(text)
  })

  it('pads the year of a day picked in the calendar', async () => {
    const { wrapper, input, draft } = mountField('0999-05-15', [], unbounded)
    await openCalendar(wrapper)
    dayCell('20').click()
    await flushPromises()
    expect(draft()).toBe('0999-05-20')
    expect(input.value).toBe('0999-05-20')
  })

  it('leaves a four-digit year as the picker writes it', async () => {
    const { wrapper, draft } = mountField('2026-10-15', [], unbounded)
    await openCalendar(wrapper)
    dayCell('20').click()
    await flushPromises()
    expect(draft()).toBe('2026-10-20')
  })
})

describe('date field: keyboard and input methods', () => {
  it('keeps a loosely typed date through Tab and Enter, and opens the calendar on that day', async () => {
    const user = userEvent.setup()
    const { input, draft } = mountField()
    await user.click(input)
    await user.keyboard('2026-6-5')
    expect(draft()).toBe('2026-06-05')

    // Tab leaves the box for the calendar button, and the box shows the full date.
    await user.tab()
    expect(document.activeElement).not.toBe(input)
    expect(input.value).toBe('2026-06-05')

    // Enter on the calendar button opens the calendar on the date that was typed.
    await user.keyboard('{Enter}')
    await flushPromises()
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(shownMonth()).toBe('June')
    expect(document.querySelector('.p-datepicker-day-selected')?.textContent?.trim()).toBe('5')
    expect(input.value).toBe('2026-06-05')
    expect(draft()).toBe('2026-06-05')
  })

  it('keeps the composed text and never rewrites the box while an input method is composing', async () => {
    const { input, draft } = mountField()
    input.focus()
    const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') as PropertyDescriptor & { get: () => string, set: (v: string) => void }
    // Records every write to the box that changes what it shows while a render runs.
    let rendering = false
    const rewrites: string[] = []
    Object.defineProperty(input, 'value', {
      configurable: true,
      get() { return native.get.call(this) },
      set(next: string) {
        if (rendering && next !== native.get.call(this))
          rewrites.push(next)
        native.set.call(this, next)
      },
    })

    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    for (const text of ['2', '20', '202', '2026']) {
      input.value = text
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', isComposing: true, data: text }))
      rendering = true
      await flushPromises()
      rendering = false
      expect(input.value, `while composing "${text}"`).toBe(text)
    }
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '2026' }))
    await typeKeys(input, '-06-15')

    expect(rewrites).toEqual([])
    expect(input.value).toBe('2026-06-15')
    expect(draft()).toBe('2026-06-15')
  })
})

describe('date field: the theme observer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** Mounts the field inside a themed container and says how often that container is observed and released. */
  function mountThemed(props: Partial<{ disabled: boolean, readonly: boolean }> = {}) {
    const container = document.createElement('div')
    container.setAttribute('data-wippy-theme-root', '')
    container.className = 'w-theme-dark'
    document.body.appendChild(container)
    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const wrapper = mount(DateField, {
      props: { field, modelValue: undefined, errors: [], disabled: false, readonly: false, ...props },
      global: { plugins: [PrimeVuePlugin] },
      attachTo: container,
    })
    return {
      wrapper,
      observed: () => observe.mock.calls.filter(([target]) => target === container).length,
      released: () => disconnect.mock.calls.length,
    }
  }

  it('watches the themed container of an editable field', () => {
    expect(mountThemed().observed()).toBe(1)
  })

  it('does not watch it for a read-only field, which has no calendar', () => {
    expect(mountThemed({ readonly: true, disabled: true }).observed()).toBe(0)
  })

  it('does not watch it for a disabled field, which cannot open a calendar', () => {
    expect(mountThemed({ disabled: true }).observed()).toBe(0)
  })

  it('stops watching while the field is disabled (a submit in flight) and starts again afterwards', async () => {
    const { wrapper, observed, released } = mountThemed()
    expect(observed()).toBe(1)
    await wrapper.setProps({ disabled: true })
    expect(released()).toBe(1)
    await wrapper.setProps({ disabled: false })
    expect(observed()).toBe(2)
  })
})

describe('date field: focus when the calendar closes', () => {
  /*
   * PrimeVue puts focus on the box with `input.focus()` when a day is picked,
   * but its own delayed re-focus of the calendar's cells (a
   * `setTimeout(updateFocus, 0)` queued by every render of the picker, which
   * only skips a cell when `overlay.contains(document.activeElement)`) can run
   * after that and put focus on the first day cell. Inside the component's
   * shadow root `document.activeElement` is the shadow host, so the check never
   * sees the box, and when the calendar closes a moment later the browser drops
   * focus to the page. These tests run in a shadow root with fake timers, as the
   * web component does, and drive the keyboard path the calendar offers.
   */
  // The calendar's keyboard focus starts on today's cell, so today is pinned to
  // 1 October 2026 (local time) and the picked day does not depend on the clock.
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 9, 1, 12) })
  })

  const hosts: HTMLElement[] = []

  afterEach(() => {
    hosts.splice(0).forEach(host => host.remove())
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const ERROR: FieldError[] = [{ code: 'required', message: 'Choose a date.' }]

  /**
   * The field in a shadow root, with a button beside it to move focus to, and a way to re-render the field.
   * It keeps the real Transition: the picker reports `hide` from its leave hook, and the stub Test Utils
   * puts in its place by default never runs it.
   */
  function mountView() {
    const host = document.createElement('div')
    document.body.appendChild(host)
    hosts.push(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    container.setAttribute('data-wippy-theme-root', '')
    const elsewhere = document.createElement('button')
    elsewhere.textContent = 'Elsewhere'
    shadow.append(container, elsewhere)
    const wrapper = mount(DateField, {
      props: {
        field,
        modelValue: '2026-10-15',
        errors: [],
        disabled: false,
        readonly: false,
        'onUpdate:modelValue': (value: FieldAnswer | undefined) => { void wrapper.setProps({ modelValue: value }) },
      },
      global: { plugins: [PrimeVuePlugin], stubs: { transition: false } },
      attachTo: container,
    })
    return {
      shadow,
      elsewhere,
      input: () => shadow.querySelector('input') as HTMLInputElement,
      focused: () => shadow.activeElement,
      /** The form re-rendering the field a moment after something happened to it. */
      rerender: async () => {
        await wrapper.setProps({ errors: wrapper.props('errors').length > 0 ? [] : ERROR })
      },
    }
  }

  type View = ReturnType<typeof mountView>

  function press(target: Element | null, code: string) {
    target?.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }))
  }

  /** ArrowDown in the box opens the calendar. */
  async function openCalendar(view: View) {
    await nextTick()
    view.input().focus()
    press(view.input(), 'ArrowDown')
    await nextTick()
    await nextTick()
    await vi.advanceTimersByTimeAsync(100)
    expect(view.shadow.querySelector('.p-datepicker-panel'), 'the calendar is open').not.toBeNull()
  }

  /** A second ArrowDown moves focus from the box into the days. */
  async function openIntoDays(view: View) {
    await openCalendar(view)
    press(view.input(), 'ArrowDown')
    expect(view.focused()?.closest('.p-datepicker-panel'), 'focus is in the calendar').not.toBeNull()
  }

  /**
   * Waits out the delay after a pick (the calendar closes 150 ms after it) and the render that removes it.
   * The renders the last key queued run first, as they do in a browser, where microtasks run before any timer.
   */
  async function settle() {
    await nextTick()
    await vi.advanceTimersByTimeAsync(1000)
    await nextTick()
  }

  /** A mouse press somewhere outside the field, which is what closes the calendar for a mouse user. */
  function pressOutside(target: Element) {
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
  }

  function expectClosed(view: View) {
    expect(view.shadow.querySelector('.p-datepicker-panel'), 'the calendar has closed').toBeNull()
  }

  it('puts focus on the box after a day is picked from the keyboard', async () => {
    const view = mountView()
    await openIntoDays(view)
    press(view.focused(), 'ArrowRight')
    press(view.focused(), 'Enter')
    await settle()
    expectClosed(view)
    expect(view.input().value).toBe('2026-10-02')
    expect(view.focused()).toBe(view.input())
  })

  it('puts focus on the box after a keyboard pick even when the form re-renders the field just after it', async () => {
    const view = mountView()
    await openIntoDays(view)
    press(view.focused(), 'ArrowRight')
    press(view.focused(), 'Enter')
    await nextTick()
    // Two renders of the picker before its zero-delay re-focus timers run: the first
    // timer consumes the picker's "do not focus" flag, the second focuses a day cell.
    await view.rerender()
    await vi.advanceTimersByTimeAsync(20)
    expect(view.focused()?.closest('.p-datepicker-panel'), 'PrimeVue has moved focus into the calendar').not.toBeNull()
    await settle()
    expectClosed(view)
    expect(view.focused()).toBe(view.input())
  })

  it('puts focus on the box after Escape closes the calendar from a day', async () => {
    const view = mountView()
    await openIntoDays(view)
    press(view.focused(), 'Escape')
    await settle()
    expectClosed(view)
    expect(view.input().value).toBe('2026-10-15')
    expect(view.focused()).toBe(view.input())
  })

  it('does not scroll the page when it gives the box focus back', async () => {
    const view = mountView()
    await openIntoDays(view)
    const focus = vi.spyOn(view.input(), 'focus')
    press(view.focused(), 'ArrowRight')
    press(view.focused(), 'Enter')
    await nextTick()
    await view.rerender()
    await settle()
    expect(focus.mock.calls.some(([options]) => options?.preventScroll === true)).toBe(true)
  })

  it('leaves focus where the user put it when they moved it before the calendar closed', async () => {
    const view = mountView()
    await openIntoDays(view)
    view.elsewhere.focus()
    pressOutside(view.elsewhere)
    await settle()
    expectClosed(view)
    expect(view.focused()).toBe(view.elsewhere)
  })

  it('does not take focus when nothing in the form had it as the calendar closed', async () => {
    const view = mountView()
    await openIntoDays(view)
    ;(view.focused() as HTMLElement).blur()
    expect(view.focused()).toBeNull()
    pressOutside(view.elsewhere)
    await settle()
    expectClosed(view)
    expect(view.focused()).toBeNull()
  })

  it('leaves focus on the control Tab moves it to when the calendar closes as the box is left', async () => {
    const view = mountView()
    await openCalendar(view)
    // Tab from the box closes the calendar; the browser then moves focus on, here to the button beside the form.
    press(view.input(), 'Tab')
    view.elsewhere.focus()
    await settle()
    expectClosed(view)
    expect(view.focused()).toBe(view.elsewhere)
  })
})
