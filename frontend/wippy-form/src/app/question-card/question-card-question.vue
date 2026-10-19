<script setup lang="ts">
import type { QuestionCardController } from '../../composables/use-question-card'
import type { FormField } from '../../lib/definition'
import { computed, ref, watch } from 'vue'
import { MAX_KEYED_ROWS } from '../../composables/use-question-card'
import { exceedsLength, NOTE_TEXT_MAX, OTHER_TEXT_MAX, trimAnswerText } from '../../lib/answers'
import { joinIds } from '../../lib/aria'
import { optionIndexOf } from '../../lib/focus-key'
import { partAttrs, partSelector } from '../../lib/part-attrs'
import FormMessage from '../form-message.vue'
import QuestionCardComposer from './question-card-composer.vue'
import QuestionCardLengthAlert from './question-card-length-alert.vue'
import QuestionCardOption from './question-card-option.vue'
import QuestionCardRichText from './question-card-rich-text.vue'
import QuestionCardSendButton from './question-card-send-button.vue'

/** One question: the notice, description and hint, the answer rows with Other, the send button, the error and the keyboard hint. */
const props = defineProps<{
  question: FormField
  controller: QuestionCardController
  qid: string
  stale: boolean
  serverError: string
  /** The ids of the card-wide error messages on screen. Each answer control names them in `aria-describedby`, so the control that has focus reads them. */
  cardErrorIds?: string
  /** True while offline or a send is in flight. "Send" stays focusable but ignores activation. */
  disabled?: boolean
}>()

const hint = computed(() => {
  const parts: string[] = []
  if (props.question.multiple)
    parts.push('Choose any that apply.')
  if (!props.question.required)
    parts.push('Optional.')
  return parts.join(' ')
})

const answer = computed(() => props.controller.ans(props.question))
const displayError = computed(() => props.controller.error.value || props.serverError || '')

function keyLabelFor(index: number): string | null {
  return index < MAX_KEYED_ROWS ? String(index + 1) : null
}
const otherKeyLabel = computed(() => keyLabelFor(props.question.options.length))

const otherSelected = computed(() => props.question.multiple ? trimAnswerText(answer.value.other) !== '' : (answer.value.useOther && answer.value.done))
const otherEnabled = computed(() => trimAnswerText(answer.value.other) !== '' || (props.question.multiple && answer.value.chosen.length > 0))
const otherTooLong = computed(() => exceedsLength(answer.value.other, OTHER_TEXT_MAX))
const otherErrorId = `${props.qid}-other-err`
const errorId = `${props.qid}-err`

// The errors that apply to every answer control of this question: its own
// error and the card-wide ones. The control that has focus names them in
// `aria-describedby`, so the error is read with the control and not only when
// it appears.
const errorIds = computed(() => joinIds(displayError.value && errorId, props.cardErrorIds))
// The Other box names its own length alert as well.
const otherDescribedBy = computed(() => joinIds(otherTooLong.value && otherErrorId, errorIds.value))
// `aria-invalid` marks a problem with what was entered. A failed send or a
// form-level error describes the control but does not make it invalid.
const otherInvalid = computed(() => otherTooLong.value || !!displayError.value)

function onOtherWrapperClick(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest(partSelector('composer')))
    props.controller.requestFocus('other')
}

/**
 * The roving tab stop of a single-answer question: the group is one Tab stop and
 * the arrow keys, handled by the card, move focus within it. A row that
 * receives focus by any means takes the stop. It starts on the chosen row, or
 * the first, and resets when the question changes, because this component stays
 * mounted while only its `question` prop changes.
 */
const rovingIndex = ref(0)
watch(() => props.question.id, () => {
  if (props.question.multiple)
    return
  const a = answer.value
  const chosenIndex = a.useOther ? -1 : props.question.options.findIndex(o => o.value === a.chosen[0])
  rovingIndex.value = chosenIndex >= 0 ? chosenIndex : 0
}, { immediate: true })

function onOptionsFocusIn(event: FocusEvent) {
  if (props.question.multiple)
    return
  const index = optionIndexOf((event.target as HTMLElement)?.dataset?.focus)
  if (index >= 0)
    rovingIndex.value = index
}
</script>

<template>
  <p
    v-if="stale"
    v-bind="partAttrs('notice')"
  >
    Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the
    earlier request.
  </p>
  <p
    v-if="question.description"
    v-bind="partAttrs('description')"
  >
    <QuestionCardRichText :text="question.description" />
  </p>
  <p
    v-if="hint"
    v-bind="partAttrs('hint')"
  >
    {{ hint }}
  </p>

  <div
    v-bind="partAttrs('options')"
    :role="question.multiple ? 'group' : 'radiogroup'"
    :aria-labelledby="qid"
    :aria-describedby="displayError ? errorId : undefined"
    :aria-invalid="!question.multiple && displayError ? 'true' : undefined"
    @focusin="onOptionsFocusIn"
  >
    <QuestionCardOption
      v-for="(option, i) in question.options"
      :key="option.value"
      :option="option"
      :index="i"
      :multiple="question.multiple"
      :selected="question.multiple ? answer.chosen.includes(option.value) : (!answer.useOther && answer.chosen[0] === option.value)"
      :note="trimAnswerText(answer.notes[option.value] || '')"
      :editing="answer.noteOpen === option.value"
      :note-draft="answer.notes[option.value] || ''"
      :key-label="keyLabelFor(i)"
      :note-too-long="exceedsLength(answer.notes[option.value] || '', NOTE_TEXT_MAX)"
      :disabled="!!disabled"
      :described-by="errorIds"
      :invalid="!!displayError"
      :roving-tabbable="i === rovingIndex"
      @activate="controller.activate(question, i)"
      @toggle-note="controller.toggleNote(question, option.value)"
      @update:note-draft="(v) => controller.setNote(question, option.value, v)"
      @send-note="controller.sendNote(question, option.value)"
      @escape-note="controller.toggleNote(question, option.value, false)"
    />

    <div
      v-if="question.allow_other"
      v-bind="partAttrs('option', 'other', otherSelected && 'selected')"
      @click="onOtherWrapperClick"
    >
      <QuestionCardComposer
        kind="other"
        :model-value="answer.other"
        :placeholder="question.multiple ? 'Add your own answer (optional). Enter sends.' : 'Type your own answer'"
        label="Your own answer"
        :send-label="question.multiple ? 'Send the ticked answers' : 'Send this answer'"
        :enabled="otherEnabled && !disabled && !otherTooLong"
        :invalid="otherInvalid"
        :described-by="otherDescribedBy"
        data-focus="other"
        @update:model-value="(v) => { answer.other = v }"
        @send="controller.sendOther(question)"
        @escape="controller.requestFocus('card')"
      />
      <kbd
        v-if="otherKeyLabel"
        v-bind="partAttrs('option-key')"
        aria-hidden="true"
      >{{ otherKeyLabel }}</kbd>
      <span v-else />
      <QuestionCardLengthAlert
        v-if="otherTooLong"
        :id="otherErrorId"
        :max="OTHER_TEXT_MAX"
      />
    </div>
  </div>

  <div
    v-if="question.multiple && !question.allow_other"
    v-bind="partAttrs('footer')"
  >
    <QuestionCardSendButton
      name="send"
      label="Send"
      :blocked="disabled"
      :nothing-to-send="answer.chosen.length === 0"
      :described-by="errorIds"
      @send="controller.commit(question)"
    />
  </div>

  <FormMessage
    v-if="displayError"
    :id="errorId"
    v-bind="partAttrs('error')"
    severity="error"
    variant="simple"
    size="small"
    role="alert"
  >
    {{ displayError }}
  </FormMessage>

  <p v-bind="partAttrs('keys')">
    {{ controller.keysText(question) }}
  </p>
</template>
