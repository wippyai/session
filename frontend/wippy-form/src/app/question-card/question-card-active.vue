<script setup lang="ts">
import type { FocusTarget } from '../../composables/use-question-card'
import type { FieldError, FormAnswers, FormState } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useQuestionCard } from '../../composables/use-question-card'
import { trimAnswerText } from '../../lib/answers'
import { partClass } from '../../lib/part-class'
import QuestionCardHeader from './question-card-header.vue'
import QuestionCardQuestion from './question-card-question.vue'
import QuestionCardReview from './question-card-review.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/**
 * The interactive question card — the question-card counterpart of
 * `ActiveForm.vue`, swapped in by `wippy-form.vue` when every field in the
 * definition is `type: 'choice'`. Owns the card's own interaction state via
 * `useQuestionCard` and forwards to the SAME submit pipeline `ActiveForm`
 * uses (`@submit`), so request-id reuse, the automatic no-response retry,
 * and 422/409 handling in `wippy-form.vue` all keep working unchanged.
 */
const props = defineProps<{
  state: FormState
  submitting: boolean
  banner: { message: string, retryable?: boolean } | null
  offline?: boolean
}>()

const emit = defineEmits<{
  submit: [answers: FormAnswers]
  retry: []
  'update:state': ['active' | 'review']
  'update:collapsed': [boolean]
}>()

const OFFLINE_MESSAGE = 'You are offline. Your choices are kept.'
const SUBMITTING_MESSAGE = 'Sending your answer…'

// Submitting while offline, or while a previous submit is still in flight,
// can only fail or double-post (see use-online-status.ts — a second pick
// while `submitting` got a 409 "answered elsewhere"). The same guard
// ActiveForm.vue applies via its Submit button's :disabled. Here
// submission can be triggered straight from a row click/number key
// (single-question, no explicit button), so the guard lives at the
// controller's own submit callback rather than only on a button.
const controller = useQuestionCard(props.state.definition, props.state.data, (answers) => {
  if (props.offline || props.submitting)
    return
  emit('submit', answers)
})

/** True while any answer input must be blocked — offline, or a submit already in flight. */
const inputsBlocked = computed(() => !!props.offline || props.submitting)

const qid = `${useId()}-q`
const cardRoot = ref<HTMLElement | null>(null)

watch(controller.inReview, v => emit('update:state', v ? 'review' : 'active'), { immediate: true })
watch(controller.collapsed, v => emit('update:collapsed', v), { immediate: true })

// 422 field errors from the server, by field id — the question-card
// equivalent of ActiveForm's fieldErrors, shown on the question that owns
// the field; a several-question card jumps there.
const serverFieldErrors = ref<Record<string, string>>({})
const serverFormErrors = ref<string[]>([])

function serverErrorFor(fieldId: string): string {
  const parts = [...serverFormErrors.value]
  if (serverFieldErrors.value[fieldId])
    parts.push(serverFieldErrors.value[fieldId])
  return parts.join(' ')
}

const knownFieldIds = computed(() => new Set(props.state.definition.fields.map(f => f.id)))

// Form-level errors, and field errors for an id this definition does not
// recognize, have no per-question place to show — the review step and an
// id-not-found rejection both hit this. Shown as one always-visible
// notice (regardless of which question/review is currently showing)
// instead of nowhere.
const generalServerError = computed(() => {
  const unknown = Object.entries(serverFieldErrors.value)
    .filter(([id]) => !knownFieldIds.value.has(id))
    .map(([, message]) => message)
  return [...serverFormErrors.value, ...unknown].join(' ')
})

// A changed answer clears that question's own server error — the same
// "the next submit re-checks it" contract ActiveForm.vue's updateField()
// applies. Snapshotted per field (not a raw deep watch on the reactive
// answers object, which can't tell old from new since it's the same mutated
// proxy) so only the field that actually changed loses its error.
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
    // Rebuilt rather than `delete`d (no-dynamic-delete) — the same
    // filter-and-rebuild shape ActiveForm.vue's updateField() uses.
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
  },
  retry() {
    emit('submit', controller.buildAnswers())
  },
  /**
   * True once ANY question has a chosen/ticked answer, a note, or Other
   * text that has not yet been sent — a saved-but-never-submitted draft.
   * `wippy-form.vue` reads this before showing the "answered elsewhere"
   * notice for a background state flip (another tab/client answering the
   * same artifact): a passive copy that never touched this card must just
   * switch to the read-only summary, not claim an answer went unsent when
   * nothing was ever entered.
   */
  hasUnsentInput(): boolean {
    return Object.values(controller.answers).some(a =>
      a.chosen.length > 0 || trimAnswerText(a.other) !== '' || Object.values(a.notes).some(n => trimAnswerText(n) !== ''),
    )
  },
})

const cardPart = computed(() => partClass('card'))
const titlePart = computed(() => partClass('title'))
const formDescriptionPart = computed(() => partClass('form-description'))

function focusOn(target: FocusTarget | string) {
  const root = cardRoot.value
  if (!root)
    return
  let el: HTMLElement | null = null
  if (target === 'card') {
    el = root
  }
  else if (target === 'first') {
    el = root.querySelector<HTMLElement>('.w-form__option--selected .w-form__option-main')
      ?? root.querySelector<HTMLElement>('.w-form__option-main, .w-form__other-input')
  }
  else {
    // Matched by comparing the dataset value directly (not by building a CSS
    // attribute-selector string) — option values can contain characters
    // that are awkward to escape into a selector, and this needs no
    // `CSS.escape` (not polyfilled in every test/host environment).
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

function toggleCollapse() {
  controller.collapsed.value = !controller.collapsed.value
  controller.requestFocus('card')
}

function onKeydown(event: KeyboardEvent) {
  const target = event.composedPath()[0] as HTMLElement
  // Enter/Escape inside a note or the Other box are fully handled by
  // question-card-composer.vue's own keydown listener; every other key
  // while typing is left alone (normal text input). This also covers "ignore
  // when typing in Other/note": every keystroke while one of those textareas
  // has focus is filtered out here before any answer-affecting key below can
  // match it.
  if (target?.tagName === 'TEXTAREA')
    return
  // An IME composing a character (e.g. picking a candidate with a digit key,
  // or Escape to cancel the composition) must never be read as an answer
  // shortcut — only reachable here for a non-textarea focus target (rare,
  // but the row/card itself is still focusable), the textarea case above
  // already covers the far more common in-composer path.
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

  // A plain digit is read from `event.key`, not `.code`: a numpad digit's
  // `.code` (`Numpad2`, …) stays the same physical-key identity regardless
  // of NumLock, but with NumLock off the browser turns it into navigation
  // (`event.key` becomes `"ArrowDown"`, etc.) — matching `.code` there
  // answered a question the user meant to navigate with. `.key` naturally
  // reports the digit only when NumLock actually produces one, on either
  // the top row or the numpad. Shift+digit (open the note) keeps matching
  // `.code`'s `Digit*` instead, since `.key` for Shift+number differs by
  // keyboard layout (not `1`..`9` at all on some) while `.code` does not.
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

  const focusAttr = target?.dataset?.focus ?? ''
  const at = focusAttr.startsWith('opt-') ? Number(focusAttr.slice(4)) : -1

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    const list = Array.from(cardRoot.value?.querySelectorAll<HTMLElement>('.w-form__option-main, .w-form__other-input') ?? [])
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
  if (event.key === 'Enter' && q.multiple && !(target as HTMLElement)?.matches?.('button')) {
    event.preventDefault()
    if (a.chosen.length > 0 || trimAnswerText(a.other))
      controller.commit(q)
    else {
      controller.error.value = 'Tick at least one answer, or type your own.'
      // `focusAttr` is a live DOM data-focus value, not one of FocusTarget's literal template forms.
      controller.requestFocus((at >= 0 ? focusAttr : 'first') as FocusTarget)
    }
  }
}
</script>

<template>
  <section
    ref="cardRoot"
    :part="cardPart.part"
    :class="`w-form ${cardPart.class}`"
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

    <Message
      v-if="generalServerError"
      severity="error"
      :closable="false"
    >
      {{ generalServerError }}
    </Message>

    <p
      :part="titlePart.part"
      :class="titlePart.class"
    >
      <Icon
        icon="tabler:messages"
        aria-hidden="true"
      />
      {{ state.definition.title }}
    </p>
    <p
      v-if="state.definition.description"
      :part="formDescriptionPart.part"
      :class="formDescriptionPart.class"
    >
      <QuestionCardRichText :text="state.definition.description" />
    </p>

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

    <Message
      v-if="banner"
      :severity="banner.retryable ? 'warn' : 'error'"
      :closable="false"
    >
      <div class="flex items-center gap-2">
        <span>{{ banner.message }}</span>
        <Button
          v-if="banner.retryable"
          type="button"
          link
          size="small"
          @click="emit('retry')"
        >
          Retry
        </Button>
      </div>
    </Message>

    <template v-if="!controller.collapsed.value">
      <QuestionCardReview
        v-if="controller.inReview.value"
        :definition="state.definition"
        :controller="controller"
        :disabled="inputsBlocked"
      />
      <QuestionCardQuestion
        v-else-if="controller.currentQuestion.value"
        :question="controller.currentQuestion.value"
        :controller="controller"
        :qid="qid"
        :stale="!!state.stale"
        :server-error="serverErrorFor(controller.currentQuestion.value.id)"
        :disabled="inputsBlocked"
      />
    </template>

    <p
      aria-live="polite"
      class="w-form__sr"
    >
      {{ controller.liveMessage.value }}
    </p>
  </section>
</template>
