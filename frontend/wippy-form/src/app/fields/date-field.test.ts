import type { DateFormField, FieldAnswer, FieldError } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { flushPromises, mount } from '@vue/test-utils'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import DateField from './date-field.vue'

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
function mountField(initial?: string, errors: FieldError[] = []): Mounted {
  let reported: FieldAnswer | undefined = initial
  const wrapper = mount(DateField, {
    props: {
      field,
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

describe('date field: calendar', () => {
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
