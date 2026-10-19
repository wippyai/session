<script setup lang="ts">
import type { FieldError, FormAnswers, FormState } from '../../lib/definition'
import type { FocusTarget } from '../../lib/focus-key'
import type { SubmitBanner } from '../../lib/submit-error'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useQuestionCard } from '../../composables/use-question-card'
import { trimAnswerText } from '../../lib/answers'
import { joinIds } from '../../lib/aria'
import { optionIndexOf, optionKey } from '../../lib/focus-key'
import { partAttrs, partSelector } from '../../lib/part-attrs'
import FormMessage from '../form-message.vue'
import QuestionCardHeader from './question-card-header.vue'
import QuestionCardHeading from './question-card-heading.vue'
import QuestionCardQuestion from './question-card-question.vue'
import QuestionCardReview from './question-card-review.vue'

/**
 * The interactive question card. It owns the interaction state through
 * `useQuestionCard` and hands the finished answers to `wippy-form.vue` with
 * `submit`, which sends them and reports the outcome back through the props.
 */
const props = defineProps<{
  state: FormState
  submitting: boolean
  banner: SubmitBanner | null
  offline?: boolean
}>()

const emit = defineEmits<{
  'submit': [answers: FormAnswers]
  'retry': []
  'step-change': [step: 'active' | 'review']
  'collapsed-change': [collapsed: boolean]
}>()

const OFFLINE_MESSAGE = 'You are offline. Your choices are kept.'
const SUBMITTING_MESSAGE = 'Sending your answer…'

// A submit while offline can only fail, and a second one while the first is in
// flight gets a 409. A single question submits straight from a row click or a
// number key, with no button to disable, so the guard sits on the callback.
const controller = useQuestionCard(props.state.definition, props.state.data, (answers) => {
  if (props.offline || props.submitting)
    return
  emit('submit', answers)
})

/** True while any answer input must be blocked: offline, or a send in flight. */
const inputsBlocked = computed(() => !!props.offline || props.submitting)

const qid = `${useId()}-q`
const cardRoot = ref<HTMLElement | null>(null)

watch(controller.inReview, v => emit('step-change', v ? 'review' : 'active'), { immediate: true })
watch(controller.collapsed, v => emit('collapsed-change', v), { immediate: true })

// 422 field errors from the server, by field id. They show on the question that
// owns the field, and a card with several questions jumps there.
const serverFieldErrors = ref<Record<string, string>>({})
const serverFormErrors = ref<string[]>([])

// Once a send starts, the polite region must not go on describing the step the
// reader sent from, and a failed send is announced by its own alert. The
// previous send's server errors go too, as its banner does, so a resent answer
// never shows an old 422 next to the new outcome.
watch(() => props.submitting, (sending) => {
  if (!sending)
    return
  controller.quiet()
  serverFieldErrors.value = {}
  serverFormErrors.value = []
})

// Only the question's own field error goes down to it. A form-level error has no
// question to sit on, and showing it there as well would announce it twice.
function serverErrorFor(fieldId: string): string {
  return serverFieldErrors.value[fieldId] ?? ''
}

const knownFieldIds = computed(() => new Set(props.state.definition.fields.map(f => f.id)))

// Form-level errors, and field errors for an id this definition does not
// know, have no question to show on. They appear in one notice that stays
// visible on every question and on the review.
const generalServerError = computed(() => {
  const unknown = Object.entries(serverFieldErrors.value)
    .filter(([id]) => !knownFieldIds.value.has(id))
    .map(([, message]) => message)
  return [...serverFormErrors.value, ...unknown].join(' ')
})

// The ids of the two card-wide messages, the notice above and the submit
// failure banner. Each is announced once by its own alert, and the answer
// control that has focus names them in `aria-describedby` too.
const generalErrorId = `${qid}-general-err`
const bannerId = `${qid}-banner`
const cardErrorIds = computed(() => joinIds(generalServerError.value && generalErrorId, props.banner && bannerId))

// A changed answer clears the server error of that question, and the next
// submit checks it again. The snapshot is per field because a deep watch on the
// reactive answers cannot tell old from new, so only a field that changed
// loses its error.
watch(
  () => Object.fromEntries(props.state.definition.fields.map(f => [f.id, JSON.stringify(controller.ans(f))])),
  (curr, prev) => {
    if (!prev)
      return
    const changedIds = new Set(
      props.state.definition.fields
        .map(f => f.id)
        .filter(id => curr[id] !== prev[id] && serverFieldErrors.value[id]),
    )
    if (changedIds.size === 0)
      return
    serverFieldErrors.value = Object.fromEntries(
      Object.entries(serverFieldErrors.value).filter(([id]) => !changedIds.has(id)),
    )
  },
  { deep: true },
)

defineExpose({
  setServerErrors(fieldErrors?: Record<string, FieldError[]>, formErrors?: FieldError[]) {
    const flat: Record<string, string> = {}
    for (const [id, errs] of Object.entries(fieldErrors ?? {}))
      flat[id] = errs.map(e => e.message).join(' ')
    serverFieldErrors.value = flat
    serverFormErrors.value = (formErrors ?? []).map(e => e.message)
    const firstIndex = props.state.definition.fields.findIndex(f => flat[f.id])
    if (firstIndex >= 0)
      controller.go(firstIndex, 'first')
    else
      void nextTick(restoreFocusAfterFailure)
  },
  retry() {
    emit('submit', controller.buildAnswers())
  },
  /**
   * True when any question has a chosen answer, a note or Other text that was
   * never sent. `wippy-form.vue` reads it when another client answers first, to
   * tell a card that holds a draft from one nothing was entered into.
   */
  hasUnsentInput(): boolean {
    return Object.values(controller.answers).some(a =>
      a.chosen.length > 0 || trimAnswerText(a.other) !== '' || Object.values(a.notes).some(n => trimAnswerText(n) !== ''),
    )
  },
})

const ANSWER_CONTROLS = `${partSelector('option-main')}, ${partSelector('other-input')}`

function focusOn(target: FocusTarget) {
  const root = cardRoot.value
  if (!root)
    return
  let el: HTMLElement | null = null
  if (target === 'card') {
    el = root
  }
  else if (target === 'first') {
    el = root.querySelector<HTMLElement>(`${partSelector('option', 'selected')} ${partSelector('option-main')}`)
      ?? root.querySelector<HTMLElement>(ANSWER_CONTROLS)
  }
  else {
    // The `data-focus` values are compared directly. Option values can contain
    // characters that are awkward in a selector, and `CSS.escape` is not
    // available everywhere.
    el = Array.from(root.querySelectorAll<HTMLElement>('[data-focus]')).find(node => node.dataset.focus === target) ?? null
  }
  if (!el)
    return
  el.focus()
  if (el.tagName === 'TEXTAREA') {
    const ta = el as HTMLTextAreaElement
    ta.setSelectionRange(ta.value.length, ta.value.length)
  }
}

watch(controller.focusSeq, () => {
  void nextTick(() => {
    const target = controller.focusTarget.value
    if (target)
      focusOn(target)
  })
})

/** True when nothing on the page has focus, because it is on <body> or the root element, as after a focused control is removed. */
function pageHasNoFocus(): boolean {
  const doc = cardRoot.value?.ownerDocument
  if (!doc)
    return false
  const active = doc.activeElement
  return !active || active === doc.body || active === doc.documentElement
}

/**
 * After a failed send, keeps the reader inside the card. The send buttons stay
 * focusable while a send is in flight, so usually the one pressed still has
 * focus. Focus can be missing all the same: the Retry button of the banner is
 * removed when pressed, a browser may not focus a button on click, and the small
 * send buttons of the Other and note boxes are disabled while sending. Then
 * focus goes to the control that sends, "Send answers" on the review and
 * otherwise the chosen or first answer. Focus on another control of the page,
 * such as the chat box, is left alone.
 */
function restoreFocusAfterFailure() {
  if (!pageHasNoFocus())
    return
  controller.requestFocus(controller.inReview.value ? 'send-all' : 'first')
}

// A banner means the send was rejected. A 422 field error has no banner and
// moves focus to its question, and a form-level one is handled in `setServerErrors`.
watch(() => props.banner, (banner) => {
  if (banner)
    void nextTick(restoreFocusAfterFailure)
})

// Focus stays on the toggle that was pressed: it is not unmounted, and it names
// the new state ("Show answers" / "Hide answers"), so a screen reader hears it.
function toggleCollapse() {
  controller.collapsed.value = !controller.collapsed.value
}

function onKeydown(event: KeyboardEvent) {
  const target = event.composedPath()[0] as HTMLElement
  // The note and Other boxes handle Enter and Escape themselves, and every other
  // key typed there is ordinary text.
  if (target?.tagName === 'TEXTAREA')
    return
  // An input method composing a character, for example choosing a candidate with
  // a digit key, must not be read as a shortcut.
  if (event.isComposing)
    return
  if (event.ctrlKey || event.metaKey || event.altKey || controller.collapsed.value || inputsBlocked.value)
    return

  if (controller.inReview.value) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      controller.go(controller.n - 1, 'first')
    }
    return
  }

  const q = controller.currentQuestion.value
  if (!q)
    return
  const a = controller.ans(q)

  // A plain digit is read from `event.key`. With NumLock off a numpad digit
  // keeps its `.code` but reports `.key` as an arrow, and answering from `.code`
  // would answer when the reader meant to navigate. Shift plus a digit is read
  // from `.code`, because its `.key` depends on the keyboard layout.
  const digitMatch = event.shiftKey
    ? /^Digit([1-9])$/.exec(event.code)
    : /^([1-9])$/.exec(event.key)
  if (digitMatch) {
    const i = Number(digitMatch[1]) - 1
    if (i >= q.options.length + (q.allow_other ? 1 : 0))
      return
    event.preventDefault()
    if (event.shiftKey && i < q.options.length)
      controller.toggleNote(q, q.options[i].value, true)
    else
      controller.activate(q, i)
    return
  }

  const at = optionIndexOf(target?.dataset?.focus)

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    const list = Array.from(cardRoot.value?.querySelectorAll<HTMLElement>(ANSWER_CONTROLS) ?? [])
    if (list.length === 0)
      return
    event.preventDefault()
    const from = list.indexOf(target)
    const to = event.key === 'ArrowDown' ? (from + 1) % list.length : (from <= 0 ? list.length - 1 : from - 1)
    list[to]?.focus()
    return
  }
  if (controller.multi && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
    event.preventDefault()
    controller.go(controller.index.value + (event.key === 'ArrowRight' ? 1 : -1), 'first')
    return
  }
  if ((event.key === 'n' || event.key === 'N') && at >= 0) {
    event.preventDefault()
    controller.toggleNote(q, q.options[at].value, true)
    return
  }
  if (at >= 0 && (event.key === ' ' || (event.key === 'Enter' && !q.multiple))) {
    event.preventDefault()
    controller.activate(q, at)
    return
  }
  if (event.key === 'Enter' && q.multiple && !target?.matches?.('button')) {
    event.preventDefault()
    if (a.chosen.length > 0 || trimAnswerText(a.other))
      controller.commit(q)
    else {
      controller.error.value = 'Tick at least one answer, or type your own.'
      controller.requestFocus(at >= 0 ? optionKey(at) : 'first')
    }
  }
}
</script>

<template>
  <section
    ref="cardRoot"
    class="w-form"
    v-bind="partAttrs('card')"
    role="group"
    :aria-labelledby="qid"
    :aria-busy="submitting ? 'true' : 'false'"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <p
      v-if="offline"
      role="status"
      class="text-xs text-muted-color m-0 mb-2"
    >
      {{ OFFLINE_MESSAGE }}
    </p>

    <p
      v-if="submitting"
      role="status"
      class="text-xs text-muted-color m-0 mb-2"
    >
      {{ SUBMITTING_MESSAGE }}
    </p>

    <FormMessage
      v-if="generalServerError"
      :id="generalErrorId"
      severity="error"
    >
      {{ generalServerError }}
    </FormMessage>

    <QuestionCardHeading
      :definition="state.definition"
      icon="tabler:messages"
    />

    <QuestionCardHeader
      :multi="controller.multi"
      :index="controller.index.value"
      :n="controller.n"
      :review="controller.inReview.value"
      :question-text="controller.currentQuestion.value?.label ?? ''"
      :collapsed="controller.collapsed.value"
      :qid="qid"
      @prev="controller.go(controller.index.value - 1, 'first')"
      @next="controller.go(controller.index.value + 1, 'first')"
      @toggle-collapse="toggleCollapse"
    />

    <FormMessage
      v-if="banner"
      :id="bannerId"
      :severity="banner.retryable ? 'warn' : 'error'"
      :retry="banner.retryable"
      @retry="emit('retry')"
    >
      {{ banner.message }}
    </FormMessage>

    <template v-if="!controller.collapsed.value">
      <QuestionCardReview
        v-if="controller.inReview.value"
        :definition="state.definition"
        :controller="controller"
        :card-error-ids="cardErrorIds"
        :disabled="inputsBlocked"
      />
      <QuestionCardQuestion
        v-else-if="controller.currentQuestion.value"
        :question="controller.currentQuestion.value"
        :controller="controller"
        :qid="qid"
        :stale="!!state.stale"
        :server-error="serverErrorFor(controller.currentQuestion.value.id)"
        :card-error-ids="cardErrorIds"
        :disabled="inputsBlocked"
      />
    </template>

    <p
      aria-live="polite"
      class="sr-only"
    >
      {{ controller.liveMessage.value }}
    </p>
  </section>
</template>
