import type { VueWrapper } from '@vue/test-utils'
import type { FormDefinition, FormState } from '../../lib/definition'
import type { ComponentProps } from '../../types'
import { mount } from '@vue/test-utils'
import * as WippyProxy from '@wippy-fe/proxy'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import buttonCss from '@wippy-fe/theme/primevue/button.css?raw'
import commonCss from '@wippy-fe/theme/primevue/common.css?raw'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useQuestionCard } from '../../composables/use-question-card'
import { ELEMENT_PROVIDER } from '../../element-context'
import WippyForm from '../wippy-form.vue'
import QuestionCardQuestion from './question-card-question.vue'
import QuestionCardReview from './question-card-review.vue'

/**
 * Focus and double-submit behavior of the controls that SEND the question
 * card, through the real submit cycle (`wippy-form.vue` -> `useFormSubmit` ->
 * the mocked Host artifact-state client), with the REAL `<transition>` a
 * browser renders.
 *
 * "Send answers" on the review step, and "Send" on a several-answer question,
 * are the controls that just failed when a send is rejected, and they are the
 * control that has focus. While the send is in flight they used to carry the
 * `disabled` attribute, and a focused button that becomes disabled hands
 * focus to <body>: after a rejected send (a 500, or a form-level 422) the
 * reader had nowhere to continue from. They now stay focusable
 * (`aria-disabled`) and ignore activation while the card is blocked.
 */

vi.mock('@wippy-fe/proxy', () => ({
  artifactState: vi.fn(),
  on: vi.fn(() => () => {}),
}))

/** Realm-stable brand the Host stamps on every `ArtifactStateError` (see `lib/submit-error.ts`). */
const ARTIFACT_STATE_ERROR_BRAND = Symbol.for('wippy.artifactStateError')

const SERVER_ERROR = 'The server could not save this. Try again.'
const FORM_ERROR = 'This form changed since you loaded it.'

const reviewDefinition: FormDefinition = {
  title: 'Release',
  fields: [
    { id: 'a', type: 'choice', label: 'Deploy now?', required: true, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], multiple: false, allow_other: false },
    { id: 'b', type: 'choice', label: 'Which packages?', required: true, options: [{ value: 'proxy', label: 'proxy' }, { value: 'theme', label: 'theme' }], multiple: true, allow_other: false },
  ],
}

const sendDefinition: FormDefinition = {
  title: 'Pick',
  fields: [
    { id: 'b', type: 'choice', label: 'Which packages?', required: true, options: [{ value: 'proxy', label: 'proxy' }, { value: 'theme', label: 'theme' }], multiple: true, allow_other: false },
  ],
}

function activeState(definition: FormDefinition): FormState {
  return {
    form_version: 1,
    artifact_id: 'artifact-1',
    session_id: 'session-1',
    status: 'active',
    stale: false,
    late: false,
    content_version: 1,
    definition,
    data: null,
    submitted_at: null,
    answer_message_id: null,
    delivery: null,
  }
}

interface Deferred {
  promise: Promise<never>
  reject: (reason: unknown) => void
}

function deferred(): Deferred {
  let reject: (reason: unknown) => void = () => {}
  const promise = new Promise<never>((_resolve, rej) => { reject = rej })
  return { promise, reject }
}

function hostError(status: number, extra: Record<string, unknown> = {}) {
  return Object.assign(new Error(`HTTP ${status}`), { name: 'ArtifactStateError', [ARTIFACT_STATE_ERROR_BRAND]: true, status, ...extra })
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

const mounted: Array<VueWrapper<unknown>> = []
const cleanups: Array<() => void> = []

function mountForm(definition: FormDefinition, submit: ReturnType<typeof vi.fn>) {
  vi.mocked(WippyProxy.artifactState).mockReturnValue({ get: vi.fn().mockResolvedValue(activeState(definition)), submit } as never)
  const element = document.createElement('div')
  element.setAttribute('data-wippy-artifact-id', 'artifact-1')
  const props: ComponentProps = { formVersion: 1, definition, state: 'active' }
  const wrapper = mount(WippyForm, {
    attachTo: document.body,
    global: {
      plugins: [PrimeVuePlugin],
      stubs: { transition: false },
      provide: {
        [PROPS_PROVIDER as unknown as symbol]: ref(props),
        [PROPS_ERROR_PROVIDER as unknown as symbol]: ref([]),
        [EVENT_PROVIDER as unknown as symbol]: vi.fn(),
        [ELEMENT_PROVIDER as unknown as symbol]: element,
      },
    },
  })
  mounted.push(wrapper as unknown as VueWrapper<unknown>)
  cleanups.push(applyFocusFixup(wrapper.element))
  return wrapper
}

beforeEach(() => {
  vi.mocked(WippyProxy.artifactState).mockReset()
  vi.mocked(WippyProxy.on).mockReset().mockReturnValue(() => {})
})

afterEach(() => {
  while (cleanups.length > 0)
    cleanups.pop()?.()
  while (mounted.length > 0)
    mounted.pop()?.unmount()
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

    pending.reject(hostError(422, { errors: {}, formErrors: [{ code: 'version_conflict', message: FORM_ERROR }] }))
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
  // `p-disabled` marker instead of the `disabled` attribute. The component's
  // stylesheet never styles `.p-*` (the compliance gate forbids it), so the
  // dimming has to come from the theme the Host serves as `primeVueCssUrl`
  // (`@styles/primevue/tailwind.css`, which imports the theme's `common.css`
  // first). If the theme stopped defining it, the buttons would look enabled
  // while inert, and this fails instead.
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
