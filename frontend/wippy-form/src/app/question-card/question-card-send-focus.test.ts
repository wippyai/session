import type { FormDefinition } from '../../lib/definition'
import { mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import buttonCss from '@wippy-fe/theme/primevue/button.css?raw'
import commonCss from '@wippy-fe/theme/primevue/common.css?raw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuestionCard } from '../../composables/use-question-card'
import { choiceField, definitionOf, formState } from '../../test-support/fixtures'
import { hostError } from '../../test-support/host-error'
import { artifactElement, mountWippyForm } from '../../test-support/mount-form'
import { artifactStateMock, resetProxyMock } from '../../test-support/proxy-control'
import QuestionCardQuestion from './question-card-question.vue'
import QuestionCardReview from './question-card-review.vue'

/**
 * Focus and double-submit behavior of the controls that send the question card,
 * through the real submit cycle (`wippy-form.vue`, `useFormSubmit` and the
 * mocked Host artifact-state client), with the real `<transition>` a browser
 * renders.
 *
 * "Send answers" on the review step and "Send" on a several-answer question are
 * the controls that just failed when a send is rejected, and they have focus.
 * These buttons stay focusable while a send is in flight: they are `aria-disabled`
 * and ignore activation, instead of taking the `disabled` attribute, which
 * would hand focus to <body>.
 */

const SERVER_ERROR = 'The server could not save this. Try again.'
const FORM_ERROR = 'This form changed since you loaded it.'

const singleQuestion = choiceField({ id: 'a', label: 'Deploy now?', required: true, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] })
const packagesQuestion = choiceField({ id: 'b', label: 'Which packages?', required: true, options: [{ value: 'proxy', label: 'proxy' }, { value: 'theme', label: 'theme' }], multiple: true })

const reviewDefinition: FormDefinition = { ...definitionOf(singleQuestion, packagesQuestion), title: 'Release' }
const sendDefinition: FormDefinition = { ...definitionOf(packagesQuestion), title: 'Pick' }

interface Deferred {
  promise: Promise<never>
  reject: (reason: unknown) => void
}

function deferred(): Deferred {
  let reject: (reason: unknown) => void = () => {}
  const promise = new Promise<never>((_resolve, rej) => { reject = rej })
  return { promise, reject }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Lets the Vue render queue, the card's focus move (`nextTick`) and the promise chain settle. */
async function settle() {
  await sleep(0)
  await sleep(0)
}

/**
 * jsdom does not implement the HTML "focus fixup rule": when the focused
 * element stops being focusable (here: it gets the `disabled` attribute), a
 * browser gives focus back to the document, so `document.activeElement`
 * becomes <body>. Without this, no jsdom test can tell a button that keeps
 * focus from one that loses it. Applied the way Chromium does it; the first
 * test below proves the emulation really takes focus away. Returns a stop
 * function.
 */
function applyFocusFixup(root: Element): () => void {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const el = record.target as HTMLElement
      if (el !== document.activeElement || !el.matches(':disabled'))
        continue
      // jsdom's blur() does nothing for a disabled element, so the attribute
      // is lifted for the call and put back (a browser needs no such step).
      el.removeAttribute('disabled')
      el.blur()
      el.setAttribute('disabled', '')
    }
  })
  observer.observe(root, { attributes: true, attributeFilter: ['disabled'], subtree: true })
  return () => observer.disconnect()
}

const cleanups: Array<() => void> = []

function mountForm(definition: FormDefinition, submit: ReturnType<typeof vi.fn>) {
  artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState({ definition })), submit } as never)
  const wrapper = mountWippyForm({ formVersion: 1, definition, state: 'active' }, artifactElement('artifact-1'), { attachToBody: true, realTransition: true })
  cleanups.push(applyFocusFixup(wrapper.element))
  return wrapper
}

beforeEach(resetProxyMock)

afterEach(() => {
  while (cleanups.length > 0)
    cleanups.pop()?.()
  document.body.replaceChildren()
})

type Wrapper = ReturnType<typeof mountForm>

async function loaded(definition: FormDefinition, submit: ReturnType<typeof vi.fn>) {
  const wrapper = mountForm(definition, submit)
  await settle()
  return wrapper
}

/** Answers question 1, ticks question 2 and sends it: lands on the review step, focus on "Send answers". */
async function reachReview(wrapper: Wrapper) {
  await wrapper.find('[role="radio"]').trigger('click')
  await settle()
  await wrapper.find('[role="checkbox"]').trigger('click')
  await wrapper.find('[data-focus="send"]').trigger('click')
  await settle()
  expect(wrapper.find('.w-form__review').exists()).toBe(true)
  // The step announcement is spoken ~30 ms after the step changes.
  await sleep(50)
}

function politeText(wrapper: Wrapper): string {
  return wrapper.find('[aria-live="polite"]').text()
}

function alertTexts(wrapper: Wrapper): string[] {
  return wrapper.findAll('[role="alert"]').map(a => a.text())
}

describe('the focus emulation used below', () => {
  it('takes focus away from a button that becomes disabled (positive control), and not from one that is only aria-disabled', async () => {
    const root = document.createElement('div')
    const plain = document.createElement('button')
    const aria = document.createElement('button')
    root.append(plain, aria)
    document.body.append(root)
    const stop = applyFocusFixup(root)
    try {
      plain.focus()
      plain.disabled = true
      await sleep(0)
      expect(document.activeElement).toBe(document.body)

      aria.focus()
      aria.setAttribute('aria-disabled', 'true')
      await sleep(0)
      expect(document.activeElement).toBe(aria)
    }
    finally {
      stop()
      root.remove()
    }
  })
})

describe('"Send answers" on the review step: a failed send keeps focus on it', () => {
  it('stays focused and is not disabled while the send is in flight, then after a 500 still has focus, and the polite region does not repeat the step', async () => {
    const pending = deferred()
    const submit = vi.fn().mockReturnValue(pending.promise)
    const wrapper = await loaded(reviewDefinition, submit)
    await reachReview(wrapper)

    const sendAll = wrapper.find('[data-focus="send-all"]')
    // Positive controls: focus really starts on the button, and the polite region really said something.
    expect(document.activeElement).toBe(sendAll.element)
    expect(politeText(wrapper)).toBe('Review your answers')

    await sendAll.trigger('click')
    await settle()
    expect(submit).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.w-form').attributes('aria-busy')).toBe('true')
    // In flight: focus has not moved, and the button is unavailable to assistive tech but still a focusable button.
    expect(document.activeElement).toBe(wrapper.find('[data-focus="send-all"]').element)
    expect(wrapper.find('[data-focus="send-all"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-focus="send-all"]').attributes('aria-disabled')).toBe('true')

    pending.reject(hostError(500))
    await settle()
    await sleep(50)

    expect(alertTexts(wrapper).join(' ')).toContain(SERVER_ERROR)
    expect(wrapper.find('.w-form').attributes('aria-busy')).toBe('false')
    const after = wrapper.find('[data-focus="send-all"]')
    expect(after.attributes('aria-disabled')).toBeUndefined()
    expect(document.activeElement).toBe(after.element)
    expect(politeText(wrapper)).toBe('')
  })

  it('stays focused after a form-level 422, which is drawn once, and the polite region does not repeat the step', async () => {
    const pending = deferred()
    const submit = vi.fn().mockReturnValue(pending.promise)
    const wrapper = await loaded(reviewDefinition, submit)
    await reachReview(wrapper)
    const sendAll = wrapper.find('[data-focus="send-all"]')
    expect(document.activeElement).toBe(sendAll.element)

    await sendAll.trigger('click')
    await settle()
    expect(document.activeElement).toBe(wrapper.find('[data-focus="send-all"]').element)

    pending.reject(hostError(422, undefined, { errors: {}, formErrors: [{ code: 'version_conflict', message: FORM_ERROR }] }))
    await settle()
    await sleep(50)

    expect(alertTexts(wrapper).filter(t => t.includes(FORM_ERROR))).toHaveLength(1)
    const after = wrapper.find('[data-focus="send-all"]')
    expect(after.exists()).toBe(true)
    expect(after.attributes('aria-disabled')).toBeUndefined()
    expect(document.activeElement).toBe(after.element)
    expect(politeText(wrapper)).toBe('')
  })

  it('sends once: a second click, Enter or Space while the first send is in flight is ignored, and a later attempt is possible again', async () => {
    const first = deferred()
    const second = deferred()
    const submit = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const wrapper = await loaded(reviewDefinition, submit)
    await reachReview(wrapper)

    const sendAll = wrapper.find('[data-focus="send-all"]')
    await sendAll.trigger('click')
    await settle()
    expect(submit).toHaveBeenCalledTimes(1)

    // The button is still focusable and still receives events, so every way of activating it must be ignored.
    const inFlight = wrapper.find('[data-focus="send-all"]')
    await inFlight.trigger('click')
    await inFlight.trigger('click')
    await inFlight.trigger('keydown', { key: 'Enter' })
    await inFlight.trigger('keydown', { key: ' ' })
    await settle()
    expect(submit).toHaveBeenCalledTimes(1)

    first.reject(hostError(500))
    await settle()
    await sleep(50)
    await wrapper.find('[data-focus="send-all"]').trigger('click')
    await settle()
    expect(submit).toHaveBeenCalledTimes(2)
    second.reject(hostError(500))
    await settle()
  })

  it('puts focus back on it after a failed send when focus had been lost (a browser that does not focus a button on click)', async () => {
    const pending = deferred()
    const submit = vi.fn().mockReturnValue(pending.promise)
    const wrapper = await loaded(reviewDefinition, submit)
    await reachReview(wrapper)

    const sendAll = wrapper.find('[data-focus="send-all"]')
    ;(document.activeElement as HTMLElement).blur()
    expect(document.activeElement).toBe(document.body)
    await sendAll.trigger('click')
    await settle()
    expect(document.activeElement).toBe(document.body)

    pending.reject(hostError(500))
    await settle()
    await sleep(50)

    expect(document.activeElement).toBe(wrapper.find('[data-focus="send-all"]').element)
  })

  it('puts focus back on it after a second failure that follows Retry, which removes the focused Retry button', async () => {
    const first = deferred()
    const second = deferred()
    const submit = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const wrapper = await loaded(reviewDefinition, submit)
    await reachReview(wrapper)

    await wrapper.find('[data-focus="send-all"]').trigger('click')
    await settle()
    first.reject(hostError(500))
    await settle()
    await sleep(50)

    const retry = wrapper.findAll('button').find(b => b.text() === 'Retry')
    expect(retry).toBeDefined()
    ;(retry?.element as HTMLElement).focus()
    expect(document.activeElement).toBe(retry?.element)
    await retry?.trigger('click')
    await settle()
    // Retry is gone with the banner it lived in; wait out the banner's leave transition.
    await sleep(80)
    expect(submit).toHaveBeenCalledTimes(2)
    expect(document.activeElement).toBe(document.body)

    second.reject(hostError(500))
    await settle()
    await sleep(50)

    expect(alertTexts(wrapper).join(' ')).toContain(SERVER_ERROR)
    expect(document.activeElement).toBe(wrapper.find('[data-focus="send-all"]').element)
  })

  it('leaves focus alone when the reader has moved on to another control on the page while the send was in flight', async () => {
    const pending = deferred()
    const submit = vi.fn().mockReturnValue(pending.promise)
    const wrapper = await loaded(reviewDefinition, submit)
    await reachReview(wrapper)

    await wrapper.find('[data-focus="send-all"]').trigger('click')
    await settle()
    const chatBox = document.createElement('textarea')
    document.body.append(chatBox)
    chatBox.focus()

    pending.reject(hostError(500))
    await settle()
    await sleep(50)

    expect(alertTexts(wrapper).join(' ')).toContain(SERVER_ERROR)
    expect(document.activeElement).toBe(chatBox)
  })
})

describe('"Send" on a several-answer question: a failed send keeps focus on it', () => {
  async function tickAndFocusSend(wrapper: Wrapper) {
    await wrapper.find('[role="checkbox"]').trigger('click')
    await settle()
    const send = wrapper.find('[data-focus="send"]')
    expect(send.attributes('disabled')).toBeUndefined()
    ;(send.element as HTMLElement).focus()
    // Positive control.
    expect(document.activeElement).toBe(send.element)
    return send
  }

  it('stays focused and is not disabled while the send is in flight, and after a 500 still has focus', async () => {
    const pending = deferred()
    const submit = vi.fn().mockReturnValue(pending.promise)
    const wrapper = await loaded(sendDefinition, submit)
    const send = await tickAndFocusSend(wrapper)

    await send.trigger('click')
    await settle()
    expect(submit).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(wrapper.find('[data-focus="send"]').element)
    expect(wrapper.find('[data-focus="send"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-focus="send"]').attributes('aria-disabled')).toBe('true')

    pending.reject(hostError(500))
    await settle()
    await sleep(50)

    expect(alertTexts(wrapper).join(' ')).toContain(SERVER_ERROR)
    const after = wrapper.find('[data-focus="send"]')
    expect(after.attributes('aria-disabled')).toBeUndefined()
    expect(document.activeElement).toBe(after.element)
  })

  it('sends once: a second click, Enter or Space while the first send is in flight is ignored', async () => {
    const pending = deferred()
    const submit = vi.fn().mockReturnValue(pending.promise)
    const wrapper = await loaded(sendDefinition, submit)
    const send = await tickAndFocusSend(wrapper)

    await send.trigger('click')
    await settle()
    const inFlight = wrapper.find('[data-focus="send"]')
    await inFlight.trigger('click')
    await inFlight.trigger('keydown', { key: 'Enter' })
    await inFlight.trigger('keydown', { key: ' ' })
    await settle()
    expect(submit).toHaveBeenCalledTimes(1)

    pending.reject(hostError(500))
    await settle()
  })
})

describe('the send buttons look disabled while the card is blocked: the theme defines the `p-disabled` marker they carry', () => {
  // `aria-disabled` has no look of its own, so the buttons carry the theme's
  // `p-disabled` marker. The component's stylesheet has no `.p-*` rules, so the
  // dimming comes from the theme's `common.css`, which the Host serves as
  // `primeVueCssUrl`. If the theme stops defining the marker, the buttons look
  // enabled while inert, and this test fails.
  it('common.css dims `.p-disabled` (opacity-60) and makes it inert to the pointer', () => {
    // Positive control: the file was really read (the stylesheet import is stubbed to '' otherwise).
    expect(commonCss.length).toBeGreaterThan(0)
    expect(commonCss).toMatch(/\.p-disabled,\s*\.p-disabled \*\s*\{[^}]*pointer-events-none/)
    expect(commonCss).toMatch(/\.p-disabled,\s*\.p-component:disabled\s*\{[^}]*opacity-60/)
  })

  it('the theme\'s button.css does not override the marker on a Button', () => {
    expect(buttonCss.length).toBeGreaterThan(0)
    expect(buttonCss).not.toMatch(/p-disabled/)
  })

  it('a blocked send button carries p-disabled on a PrimeVue Button root, and an enabled one does not', async () => {
    const controller = useQuestionCard(reviewDefinition, { a: 'yes', b: ['proxy'] }, vi.fn())
    const wrapper = mount(QuestionCardReview, {
      props: { definition: reviewDefinition, controller, disabled: true },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })
    const blocked = wrapper.find('[data-focus="send-all"]')
    expect(blocked.classes()).toContain('p-button')
    expect(blocked.classes()).toContain('p-component')
    expect(blocked.classes()).toContain('p-disabled')

    await wrapper.setProps({ disabled: false })
    expect(wrapper.find('[data-focus="send-all"]').classes()).not.toContain('p-disabled')
  })
})

describe('the send buttons ignore activation while the card is blocked (the button\'s own guard, not only the card\'s)', () => {
  const answered = { a: 'yes', b: ['proxy'] }

  it('"Send answers" does not send while `disabled`, and does send when it is not (positive control)', async () => {
    const onSubmit = vi.fn()
    const controller = useQuestionCard(reviewDefinition, answered, onSubmit)
    const wrapper = mount(QuestionCardReview, {
      props: { definition: reviewDefinition, controller, disabled: true },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })

    const button = wrapper.find('[data-focus="send-all"]')
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('disabled')).toBeUndefined()
    await button.trigger('click')
    expect(onSubmit).not.toHaveBeenCalled()

    await wrapper.setProps({ disabled: false })
    expect(wrapper.find('[data-focus="send-all"]').attributes('aria-disabled')).toBeUndefined()
    await wrapper.find('[data-focus="send-all"]').trigger('click')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('"Send answers" stays a real disabled button while a required answer is missing (it cannot hold focus then; focus goes to that row)', () => {
    const controller = useQuestionCard(reviewDefinition, { a: 'yes' }, vi.fn())
    const wrapper = mount(QuestionCardReview, {
      props: { definition: reviewDefinition, controller, disabled: false },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })
    expect(wrapper.find('[data-focus="send-all"]').attributes('disabled')).toBeDefined()
  })

  it('"Send" does not send while `disabled`, and does send when it is not (positive control)', async () => {
    const onSubmit = vi.fn()
    const controller = useQuestionCard(sendDefinition, { b: ['proxy'] }, onSubmit)
    const question = sendDefinition.fields[0]
    const wrapper = mount(QuestionCardQuestion, {
      props: { question, controller, qid: 'q', stale: false, serverError: '', disabled: true },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })

    const button = wrapper.find('[data-focus="send"]')
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('disabled')).toBeUndefined()
    await button.trigger('click')
    expect(onSubmit).not.toHaveBeenCalled()

    await wrapper.setProps({ disabled: false })
    expect(wrapper.find('[data-focus="send"]').attributes('aria-disabled')).toBeUndefined()
    await wrapper.find('[data-focus="send"]').trigger('click')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('"Send" stays a real disabled button while nothing is ticked', () => {
    const controller = useQuestionCard(sendDefinition, null, vi.fn())
    const wrapper = mount(QuestionCardQuestion, {
      props: { question: sendDefinition.fields[0], controller, qid: 'q', stale: false, serverError: '', disabled: false },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })
    expect(wrapper.find('[data-focus="send"]').attributes('disabled')).toBeDefined()
  })
})
