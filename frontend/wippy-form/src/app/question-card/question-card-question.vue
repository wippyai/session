<script setup lang="ts">
import type { QuestionCardController } from '../../composables/use-question-card'
import type { FormField } from '../../lib/definition'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import { MAX_KEYED_ROWS } from '../../composables/use-question-card'
import { isNoteTextTooLong, isOtherTextTooLong, trimAnswerText } from '../../lib/answers'
import { partClass } from '../../lib/part-class'
import QuestionCardComposer from './question-card-composer.vue'
import QuestionCardOption from './question-card-option.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/** One question's body: notice, hint, the options list (+ Other), footer send (multi without Other), error, keyboard hint. */
const props = defineProps<{
  question: FormField
  controller: QuestionCardController
  qid: string
  stale: boolean
  serverError: string
  /** True while offline or a submit is already in flight — disables the explicit send actions. */
  disabled?: boolean
}>()

const noticePart = computed(() => partClass('notice'))
const descriptionPart = computed(() => partClass('description'))
const hintPart = computed(() => partClass('hint'))
const optionsPart = computed(() => partClass('options'))
const footerPart = computed(() => partClass('footer'))
const sendPart = computed(() => partClass('send'))
const errorPart = computed(() => partClass('error'))
const keysPart = computed(() => partClass('keys'))

const hint = computed(() => {
  const parts: string[] = []
  if (props.question.multiple)
    parts.push('Choose any that apply.')
  if (!props.question.required)
    parts.push('Optional.')
  return parts.join(' ')
})

const displayError = computed(() => props.controller.error.value || props.serverError || '')

function keyLabelFor(index: number): string | null {
  return index < MAX_KEYED_ROWS ? String(index + 1) : null
}
const otherKeyLabel = computed(() => {
  const n = props.question.options.length + 1
  return n <= MAX_KEYED_ROWS ? String(n) : null
})

function answerState() {
  return props.controller.ans(props.question)
}

const otherRowPart = computed(() => {
  const a = answerState()
  const selected = props.question.multiple ? trimAnswerText(a.other) !== '' : (a.useOther && a.done)
  return partClass('option', 'other', selected && 'selected')
})
const otherEnabled = computed(() => {
  const a = answerState()
  return trimAnswerText(a.other) !== '' || (props.question.multiple && a.chosen.length > 0)
})
// Client-side mirror of the server's 2,000-code-point Other limit — the
// same pre-check the note composer already applies (isNoteTextTooLong,
// 1,000), so a too-long Other answer is caught before a round trip
// instead of only surfacing as a 422.
const otherTooLong = computed(() => isOtherTextTooLong(answerState().other))
const otherErrorId = `${props.qid}-other-err`
// Links the Other textarea's aria-invalid/aria-describedby to whichever
// role="alert" text actually applies to it right now — the too-long notice
// and/or the question's server/validation error (`displayError`, already
// shown in the Message with id `${qid}-err`) — instead of leaving both
// alerts unlinked to any control.
const otherDescribedBy = computed(() => {
  const ids: string[] = []
  if (otherTooLong.value)
    ids.push(otherErrorId)
  if (displayError.value)
    ids.push(`${props.qid}-err`)
  return ids.join(' ') || undefined
})
const otherInvalid = computed(() => otherTooLong.value || !!displayError.value)

function onOtherWrapperClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.w-form__composer'))
    props.controller.requestFocus('other')
}

/**
 * Roving tabindex for a single-choice (`role="radio"`) question — the
 * WAI-ARIA radio group pattern: the group is ONE Tab stop, and arrow keys
 * (already handled in question-card-active.vue's keydown handler, which
 * moves DOM focus between rows) move within it. `question-card-option.vue`
 * stays the one place that decides `tabindex` (0 for multi-choice rows
 * always; for a radio row, 0 only for the index this ref names). Reset
 * whenever the QUESTION changes (this component persists across question-to
 * -question navigation, only its `question` prop changes) to the already-
 * chosen option, or the first row if none is chosen yet.
 */
const rovingIndex = ref(0)
watch(() => props.question.id, () => {
  if (props.question.multiple)
    return
  const a = answerState()
  const chosenIndex = a.useOther ? -1 : props.question.options.findIndex(o => o.value === a.chosen[0])
  rovingIndex.value = chosenIndex >= 0 ? chosenIndex : 0
}, { immediate: true })

/** Any option row actually receiving DOM focus (click, arrow-key `.focus()`, or Tab) moves the roving stop with it. */
function onOptionsFocusIn(event: FocusEvent) {
  if (props.question.multiple)
    return
  const focusAttr = (event.target as HTMLElement)?.dataset?.focus ?? ''
  if (focusAttr.startsWith('opt-'))
    rovingIndex.value = Number(focusAttr.slice(4))
}
</script>

<template>
  <p
    v-if="stale"
    :part="noticePart.part"
    :class="noticePart.class"
  >
    Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the
    earlier request.
  </p>
  <p
    v-if="question.description"
    :part="descriptionPart.part"
    :class="descriptionPart.class"
  >
    <QuestionCardRichText :text="question.description" />
  </p>
  <p
    v-if="hint"
    :part="hintPart.part"
    :class="hintPart.class"
  >
    {{ hint }}
  </p>

  <div
    :part="optionsPart.part"
    :class="optionsPart.class"
    :role="question.multiple ? 'group' : 'radiogroup'"
    :aria-labelledby="qid"
    :aria-describedby="`${qid}-err`"
    @focusin="onOptionsFocusIn"
  >
    <QuestionCardOption
      v-for="(option, i) in question.options"
      :key="option.value"
      :option="option"
      :index="i"
      :multiple="question.multiple"
      :selected="question.multiple ? controller.ans(question).chosen.includes(option.value) : (!controller.ans(question).useOther && controller.ans(question).chosen[0] === option.value)"
      :note="trimAnswerText(controller.ans(question).notes[option.value] || '')"
      :editing="controller.ans(question).noteOpen === option.value"
      :note-draft="controller.ans(question).notes[option.value] || ''"
      :key-label="keyLabelFor(i)"
      :note-too-long="isNoteTextTooLong(controller.ans(question).notes[option.value] || '')"
      :disabled="!!disabled"
      :roving-tabbable="i === rovingIndex"
      @activate="controller.activate(question, i)"
      @toggle-note="controller.toggleNote(question, option.value)"
      @update:note-draft="(v) => controller.setNote(question, option.value, v)"
      @send-note="controller.sendNote(question, option.value)"
      @escape-note="controller.toggleNote(question, option.value, false)"
    />

    <div
      v-if="question.allow_other"
      :part="otherRowPart.part"
      :class="otherRowPart.class"
      @click="onOtherWrapperClick"
    >
      <QuestionCardComposer
        kind="other"
        :model-value="answerState().other"
        :placeholder="question.multiple ? 'Add your own answer (optional). Enter sends.' : 'Type your own answer'"
        label="Your own answer"
        :send-label="question.multiple ? 'Send the ticked answers' : 'Send this answer'"
        :enabled="otherEnabled && !disabled && !otherTooLong"
        :invalid="otherInvalid"
        :described-by="otherDescribedBy"
        data-focus="other"
        @update:model-value="(v) => { answerState().other = v }"
        @send="controller.sendOther(question)"
        @escape="controller.requestFocus('card')"
      />
      <kbd
        v-if="otherKeyLabel"
        part="option-key"
        class="w-form__option-key"
        aria-hidden="true"
      >{{ otherKeyLabel }}</kbd>
      <span v-else />
      <p
        v-if="otherTooLong"
        :id="otherErrorId"
        :part="errorPart.part"
        :class="errorPart.class"
        role="alert"
      >
        Use at most 2,000 characters.
      </p>
    </div>
  </div>

  <div
    v-if="question.multiple && !question.allow_other"
    :part="footerPart.part"
    :class="footerPart.class"
  >
    <Button
      type="button"
      :part="sendPart.part"
      :class="sendPart.class"
      data-focus="send"
      :disabled="controller.ans(question).chosen.length === 0 || disabled"
      @click="controller.commit(question)"
    >
      Send
      <Icon
        icon="tabler:send-2"
        aria-hidden="true"
      />
    </Button>
  </div>

  <Message
    v-if="displayError"
    :id="`${qid}-err`"
    severity="error"
    variant="simple"
    size="small"
    :part="errorPart.part"
    :class="errorPart.class"
    role="alert"
  >
    {{ displayError }}
  </Message>
  <p
    v-else
    :id="`${qid}-err`"
    class="hidden"
  />

  <p
    :part="keysPart.part"
    :class="keysPart.class"
  >
    {{ controller.keysText(question) }}
  </p>
</template>
