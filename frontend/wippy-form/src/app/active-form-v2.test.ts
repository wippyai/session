import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { applyFocusFixup } from '../test-support/dom'
import ActiveForm from './active-form.vue'

const v2State: FormState = {
  form_version: 2,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'active',
  stale: false,
  late: false,
  content_version: 1,
  definition: {
    title: 'Delivery details',
    description: 'Where should it go?',
    fields: [
      { id: 'name', type: 'text', min_length: 0, max_length: 500, label: 'Full name', required: true },
      { id: 'mail', type: 'email', label: 'Email', required: true },
      { id: 'qty', type: 'number', label: 'Parcels', required: false, integer: true, min: 1, max: 9 },
      { id: 'day', type: 'date', label: 'Delivery date', required: false },
      { id: 'notes', type: 'textarea', min_length: 0, max_length: 8000, label: 'Notes', required: false },
      { id: 'consent', type: 'checkbox', label: 'I agree', required: true },
    ],
  },
  data: null,
  submitted_at: null,
  answer_message_id: null,
  delivery: null,
}

function mountForm(state: FormState = v2State) {
  return mount(ActiveForm, {
    props: { state, submitting: false, banner: null },
    global: { plugins: [PrimeVuePlugin] },
    attachTo: document.body,
  })
}

function inputOf(wrapper: ReturnType<typeof mountForm>, label: string) {
  const labelEl = wrapper.findAll('label').find(l => l.text().startsWith(label))
  if (!labelEl)
    throw new Error(`no label starting with "${label}"`)
  return wrapper.find(`[id="${labelEl.attributes('for')}"]`)
}

async function fillValid(wrapper: ReturnType<typeof mountForm>) {
  await inputOf(wrapper, 'Full name').setValue('  Ada Lovelace  ')
  await inputOf(wrapper, 'Email').setValue(' ada@example.com ')
  await inputOf(wrapper, 'I agree').setValue(true)
}

describe('ActiveForm — V2 standard fields', () => {
  it('renders a labelled control for every field type and a form the browser may not validate natively', () => {
    const wrapper = mountForm()
    expect(wrapper.find('form').attributes('novalidate')).toBeDefined()
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(3)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Delivery details')
    expect(wrapper.text()).toContain('Where should it go?')
  })

  it('does not submit an empty required form: names each missing field and moves focus to the first', async () => {
    const wrapper = mountForm()
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('ul').map(ul => ul.text())).toEqual([
      'This question is required.',
      'This question is required.',
      'This question is required.',
    ])
    expect(document.activeElement).toBe(inputOf(wrapper, 'Full name').element)
    expect(wrapper.find('[role="status"]').text()).toBe('3 questions need attention.')
  })

  it('reports an invalid email on its own field, linked to the real input, and does not echo the value', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await inputOf(wrapper, 'Email').setValue('not-an-email')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    const mail = inputOf(wrapper, 'Email')
    const error = wrapper.find('ul')
    expect(error.text()).toBe('Enter a valid email address.')
    expect(mail.attributes('aria-describedby')).toBe(error.attributes('id'))
    expect(mail.attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(mail.element)
    expect(wrapper.find('[role="status"]').text()).toBe('1 question needs attention.')
    expect(wrapper.text()).not.toContain('not-an-email')
  })

  it('names an unparseable typed date instead of dropping it', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await inputOf(wrapper, 'Delivery date').setValue('next tuesday')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('ul').text()).toBe('Enter a valid date as YYYY-MM-DD.')
  })

  it('names a typed date outside the allowed range', async () => {
    const state: FormState = { ...v2State, definition: { title: 'T', fields: [{ id: 'day', type: 'date', label: 'Delivery date', required: false, min: '2026-10-01', max: '2026-12-31' }] } }
    const wrapper = mountForm(state)
    await inputOf(wrapper, 'Delivery date').setValue('2026-09-30')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('ul').text()).toBe('Choose 2026-10-01 or later.')

    await inputOf(wrapper, 'Delivery date').setValue('2027-01-01')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('ul').text()).toBe('Choose 2026-12-31 or earlier.')

    await inputOf(wrapper, 'Delivery date').setValue('2026-10-01')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ day: '2026-10-01' }])
  })

  it('names a number that is not strictly a number', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await inputOf(wrapper, 'Parcels').setValue('1,5')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('ul').text()).toContain('Enter a number')
  })

  it('submits the exact wire values: text as typed, number as a number, trimmed email, explicit booleans', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await inputOf(wrapper, 'Parcels').setValue('3')
    await inputOf(wrapper, 'Delivery date').setValue('2026-10-15')
    await inputOf(wrapper, 'Notes').setValue('line one\nline two')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      name: '  Ada Lovelace  ',
      mail: 'ada@example.com',
      qty: 3,
      day: '2026-10-15',
      notes: 'line one\nline two',
      consent: true,
    }])
  })

  it('omits blank optional fields', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ name: '  Ada Lovelace  ', mail: 'ada@example.com', consent: true }])
  })

  it('sends an untouched optional checkbox as false', async () => {
    const state: FormState = { ...v2State, definition: { title: 'T', fields: [{ id: 'news', type: 'checkbox', label: 'Newsletter', required: false }] } }
    const wrapper = mountForm(state)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ news: false }])
  })

  it('will not submit a required checkbox left unchecked', async () => {
    const wrapper = mountForm()
    await inputOf(wrapper, 'Full name').setValue('Ada')
    await inputOf(wrapper, 'Email').setValue('ada@example.com')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    const consent = inputOf(wrapper, 'I agree')
    expect(consent.attributes('aria-invalid')).toBe('true')
  })

  it('clears a field\'s error once the user changes that field', async () => {
    const wrapper = mountForm()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.findAll('ul')).toHaveLength(3)
    await inputOf(wrapper, 'Full name').setValue('Ada')
    expect(wrapper.findAll('ul')).toHaveLength(2)
    expect(inputOf(wrapper, 'Full name').attributes('aria-describedby')).toBeUndefined()
  })

  it('shows a server field error on the right field, linked and focused', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void }
    vm.setServerErrors({ mail: [{ code: 'invalid_email', message: 'That address is not accepted.' }] }, [])
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const mail = inputOf(wrapper, 'Email')
    expect(wrapper.find('ul').text()).toBe('That address is not accepted.')
    expect(mail.attributes('aria-describedby')).toBe(wrapper.find('ul').attributes('id'))
    expect(document.activeElement).toBe(mail.element)
  })
})

describe('ActiveForm — defaults', () => {
  const withDefaults: FormState = {
    ...v2State,
    definition: {
      title: 'Defaults',
      fields: [
        { id: 'city', type: 'text', min_length: 0, max_length: 500, label: 'City', required: false, default: 'Berlin' },
        { id: 'qty', type: 'number', label: 'Quantity', required: false, default: 3 },
        { id: 'agree', type: 'checkbox', label: 'Agree', required: false, default: false },
      ],
    },
  }

  it('prefills the controls from the definition', () => {
    const wrapper = mountForm(withDefaults)
    expect((inputOf(wrapper, 'City').element as HTMLInputElement).value).toBe('Berlin')
    expect((inputOf(wrapper, 'Quantity').element as HTMLInputElement).value).toBe('3')
    expect((inputOf(wrapper, 'Agree').element as HTMLInputElement).checked).toBe(false)
  })

  it('submits a prefilled default as it stands', async () => {
    const wrapper = mountForm(withDefaults)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ city: 'Berlin', qty: 3, agree: false }])
  })

  it('submits nothing for an optional prefilled value the user cleared', async () => {
    const wrapper = mountForm(withDefaults)
    await inputOf(wrapper, 'City').setValue('')
    await inputOf(wrapper, 'Quantity').setValue('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ agree: false }])
  })
})

describe('ActiveForm — hasUnsentInput', () => {
  function unsent(wrapper: ReturnType<typeof mountForm>) {
    return (wrapper.vm as unknown as { hasUnsentInput: () => boolean }).hasUnsentInput()
  }

  it('is false for an untouched form, even one whose controls start with a value', () => {
    expect(unsent(mountForm())).toBe(false)
  })

  it('is true once the user typed something, even something invalid', async () => {
    const wrapper = mountForm()
    await inputOf(wrapper, 'Email').setValue('half-typed')
    expect(unsent(wrapper)).toBe(true)
  })

  it('is true once a checkbox was ticked, and false again when it is put back', async () => {
    const wrapper = mountForm()
    await inputOf(wrapper, 'I agree').setValue(true)
    expect(unsent(wrapper)).toBe(true)
    await inputOf(wrapper, 'I agree').setValue(false)
    expect(unsent(wrapper)).toBe(false)
  })
})

describe('ActiveForm — styling API', () => {
  it('names the form, its title, description, fields and submit button as parts and w-form__ classes', () => {
    const wrapper = mountForm()
    const root = wrapper.find('form')
    expect(root.attributes('part')?.split(' ')).toContain('fields')
    expect(root.classes()).toEqual(expect.arrayContaining(['w-form', 'w-form__fields']))
    expect(wrapper.find('[part~="fields-title"]').text()).toBe('Delivery details')
    expect(wrapper.find('[part~="form-description"]').text()).toBe('Where should it go?')
    expect(wrapper.findAll('[part~="field"]')).toHaveLength(6)
    expect(wrapper.find('button[type="submit"]').attributes('part')).toContain('send')
  })
})

describe('ActiveForm — status summary stays accurate', () => {
  function status(wrapper: ReturnType<typeof mountForm>) {
    return wrapper.find('[role="status"]').text()
  }

  async function failSubmit(wrapper: ReturnType<typeof mountForm>) {
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
  }

  it('says how many questions still need attention as each one is fixed, and clears when none do', async () => {
    const wrapper = mountForm()
    await failSubmit(wrapper)
    expect(status(wrapper)).toBe('3 questions need attention.')

    await inputOf(wrapper, 'Full name').setValue('Ada')
    expect(status(wrapper)).toBe('2 questions need attention.')
    await inputOf(wrapper, 'Email').setValue('ada@example.com')
    expect(status(wrapper)).toBe('1 question needs attention.')
    await inputOf(wrapper, 'I agree').setValue(true)
    expect(status(wrapper)).toBe('')
  })

  it('does not touch the status text while the user keeps typing, only when the count changes', async () => {
    const wrapper = mountForm()
    await failSubmit(wrapper)
    const statusEl = wrapper.find('[role="status"]').element
    let changes = 0
    const observer = new MutationObserver((records) => { changes += records.length })
    observer.observe(statusEl, { childList: true, characterData: true, subtree: true })

    // The first key fixes this field's error: the count goes 3 to 2, one change.
    const name = inputOf(wrapper, 'Full name')
    await name.setValue('A')
    await Promise.resolve()
    const afterFirstKey = changes
    expect(afterFirstKey).toBeGreaterThan(0)
    // The rest of the typing leaves the count alone.
    await name.setValue('Ad')
    await name.setValue('Ada')
    await name.setValue('Ada L')
    await Promise.resolve()
    expect(changes).toBe(afterFirstKey)
    expect(status(wrapper)).toBe('2 questions need attention.')
    observer.disconnect()
  })

  it('clears after a server error on a field is fixed', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void }
    vm.setServerErrors({ mail: [{ code: 'invalid_email', message: 'That address is not accepted.' }] }, [])
    await wrapper.vm.$nextTick()
    expect(status(wrapper)).toBe('1 question needs attention.')

    await inputOf(wrapper, 'Email').setValue('ada@elsewhere.example')
    expect(status(wrapper)).toBe('')
  })

  it('keeps a submit-failure message in the status when a field is fixed afterwards', async () => {
    const wrapper = mountForm()
    await failSubmit(wrapper)
    await wrapper.setProps({ banner: { message: 'Could not send. Check your connection.', retryable: true } })
    expect(status(wrapper)).toBe('Could not send. Check your connection.')
    await inputOf(wrapper, 'Full name').setValue('Ada')
    expect(status(wrapper)).toBe('Could not send. Check your connection.')
  })

  it('starts empty and says nothing before a submit', () => {
    expect(status(mountForm())).toBe('')
  })
})

describe('ActiveForm — a form-level error is its own text, not a question', () => {
  type ServerErrors = { setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void }
  const STALE = { code: 'stale', message: 'This form changed since you loaded it.' }
  const MAIL = { code: 'invalid_email', message: 'That address is not accepted.' }
  const status = (wrapper: ReturnType<typeof mountForm>) => wrapper.find('[role="status"]').text()

  async function serverErrors(wrapper: ReturnType<typeof mountForm>, fields: Record<string, { code: string, message: string }[]>, form: { code: string, message: string }[]) {
    await fillValid(wrapper)
    ;(wrapper.vm as unknown as ServerErrors).setServerErrors(fields, form)
    await wrapper.vm.$nextTick()
  }

  it('says the form-level message in the status region and counts no question for it', async () => {
    const wrapper = mountForm()
    await serverErrors(wrapper, {}, [STALE])
    expect(status(wrapper)).toBe('This form changed since you loaded it.')
    expect(status(wrapper)).not.toContain('question')
  })

  it('counts only the fields in error as questions and adds the form-level message after them', async () => {
    const wrapper = mountForm()
    await serverErrors(wrapper, { mail: [MAIL] }, [STALE])
    expect(status(wrapper)).toBe('1 question needs attention. This form changed since you loaded it.')
  })

  it('joins several form-level messages', async () => {
    const wrapper = mountForm()
    await serverErrors(wrapper, {}, [STALE, { code: 'closed', message: 'This form is closed.' }])
    expect(status(wrapper)).toBe('This form changed since you loaded it. This form is closed.')
  })

  it('keeps the form-level message when the last field error is fixed, and drops the count', async () => {
    const wrapper = mountForm()
    await serverErrors(wrapper, { mail: [MAIL] }, [STALE])
    await inputOf(wrapper, 'Email').setValue('ada@elsewhere.example')
    expect(status(wrapper)).toBe('This form changed since you loaded it.')
  })

  it('shows the form-level message under the fields as before', async () => {
    const wrapper = mountForm()
    await serverErrors(wrapper, { mail: [MAIL] }, [STALE])
    expect(wrapper.find('[part~="fields-error"]').text()).toBe('This form changed since you loaded it.')
  })

  it('clears the form-level message from the status when the form is submitted again', async () => {
    const wrapper = mountForm()
    await serverErrors(wrapper, {}, [STALE])
    expect(status(wrapper)).toBe('This form changed since you loaded it.')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    // The client check passes and hands the answers over; the server decides again.
    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(status(wrapper)).toBe('')
    expect(wrapper.find('[part~="fields-error"]').exists()).toBe(false)
  })
})

describe('ActiveForm — a submit-failure banner is announced once', () => {
  const BANNER = { message: 'Could not send. Check your connection.', retryable: true }

  /** Every element a screen reader treats as a live region. */
  const liveRegions = (wrapper: ReturnType<typeof mountForm>) => wrapper.findAll('[role="alert"], [role="status"], [role="log"], [aria-live]')

  it('puts the message in the polite status region and nowhere else that is live', async () => {
    const wrapper = mountForm()
    await wrapper.setProps({ banner: BANNER })
    const announcing = liveRegions(wrapper).filter(el => el.text().includes(BANNER.message))
    expect(announcing).toHaveLength(1)
    expect(announcing[0].attributes('role')).toBe('status')
  })

  it('still shows the message and its Retry button, which is not a live region', async () => {
    const wrapper = mountForm()
    await wrapper.setProps({ banner: BANNER })
    expect(wrapper.find('.p-message').text()).toContain(BANNER.message)
    expect(wrapper.find('.p-message button').text()).toBe('Retry')
    expect(wrapper.find('.p-message').attributes('role')).toBeUndefined()
    expect(wrapper.find('.p-message').attributes('aria-live')).toBeUndefined()
  })

  it('does the same for a message that cannot be retried', async () => {
    const wrapper = mountForm()
    await wrapper.setProps({ banner: { message: 'This form was already answered.' } })
    expect(liveRegions(wrapper).filter(el => el.text().includes('This form was already answered.'))).toHaveLength(1)
  })

  it('announces a repeated failure with the same text: the region is emptied when the send starts', async () => {
    const wrapper = mountForm()
    const status = wrapper.find('[role="status"]')
    await wrapper.setProps({ banner: BANNER })
    expect(status.text()).toBe(BANNER.message)
    await wrapper.setProps({ banner: null, submitting: true })
    expect(status.text()).toBe('')
    await wrapper.setProps({ banner: BANNER, submitting: false })
    expect(status.text()).toBe(BANNER.message)
  })
})

describe('ActiveForm — screen reader text', () => {
  it('hides the status region from sight, so it shows no text and takes no space', async () => {
    const wrapper = mountForm()
    expect(wrapper.find('[role="status"]').classes()).toContain('sr-only')
  })
})

describe('ActiveForm — Retry', () => {
  const BANNER = { message: 'Could not send.', retryable: true }

  it('checks the answers first, so a value edited into something invalid is shown and not dropped', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await wrapper.setProps({ banner: BANNER })
    await inputOf(wrapper, 'Email').setValue('not an address')

    ;(wrapper.vm as unknown as { retry: () => void }).retry()
    await nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Enter a valid email address.')
    expect(inputOf(wrapper, 'Email').attributes('aria-invalid')).toBe('true')
  })

  it('sends valid answers', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await wrapper.setProps({ banner: BANNER })
    ;(wrapper.vm as unknown as { retry: () => void }).retry()
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})

describe('ActiveForm — focus around a send', () => {
  const BANNER = { message: 'Could not send.', retryable: true }

  function mountWatched() {
    const wrapper = mountForm()
    const stop = applyFocusFixup(wrapper.element)
    return { wrapper, stop, submit: () => wrapper.find('button[type="submit"]') }
  }

  it('keeps focus on Submit while a send is in flight: it is aria-disabled, not disabled', async () => {
    const { wrapper, stop, submit } = mountWatched()
    ;(submit().element as HTMLElement).focus()
    await wrapper.setProps({ submitting: true })
    await nextTick()
    expect(submit().attributes('disabled')).toBeUndefined()
    expect(submit().attributes('aria-disabled')).toBe('true')
    expect(submit().classes()).toContain('p-disabled')
    expect(document.activeElement).toBe(submit().element)

    await wrapper.setProps({ submitting: false, banner: BANNER })
    await nextTick()
    expect(submit().attributes('aria-disabled')).toBeUndefined()
    expect(document.activeElement).toBe(submit().element)
    stop()
    wrapper.unmount()
  })

  it('ignores a submit while one is in flight', async () => {
    const { wrapper, stop } = mountWatched()
    await fillValid(wrapper)
    await wrapper.setProps({ submitting: true })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    stop()
    wrapper.unmount()
  })

  it('gives focus to Submit after a failed send left none: a text box is disabled while it sends', async () => {
    const { wrapper, stop, submit } = mountWatched()
    const box = inputOf(wrapper, 'Full name')
    ;(box.element as HTMLElement).focus()
    await wrapper.setProps({ submitting: true })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve))
    // Positive control: the disabled box really dropped focus.
    expect(document.activeElement).toBe(document.body)

    await wrapper.setProps({ submitting: false, banner: BANNER })
    await nextTick()
    expect(document.activeElement).toBe(submit().element)
    stop()
    wrapper.unmount()
  })

  it('gives focus to Submit after a form-level 422, and leaves focus that moved elsewhere alone', async () => {
    const { wrapper, stop, submit } = mountWatched()
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: unknown, f?: { code: string, message: string }[]) => void }
    vm.setServerErrors(undefined, [{ code: 'version_conflict', message: 'The form changed.' }])
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(submit().element)

    const elsewhere = document.createElement('button')
    document.body.append(elsewhere)
    elsewhere.focus()
    await wrapper.setProps({ banner: BANNER })
    await nextTick()
    expect(document.activeElement).toBe(elsewhere)
    elsewhere.remove()
    stop()
    wrapper.unmount()
  })
})
