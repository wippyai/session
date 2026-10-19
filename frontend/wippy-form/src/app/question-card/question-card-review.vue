<script setup lang="ts">
import type { QuestionCardController } from '../../composables/use-question-card'
import type { FormDefinition } from '../../lib/definition'
import { computed } from 'vue'
import { ERROR_TEXT_CLASS } from '../../lib/error-text'
import { reviewItemKey } from '../../lib/focus-key'
import { partAttrs } from '../../lib/part-attrs'
import QuestionCardAnswerItems from './question-card-answer-items.vue'
import QuestionCardRichText from './question-card-rich-text.vue'
import QuestionCardSendButton from './question-card-send-button.vue'

/** The review step of a card with several questions: every answer, each one a button that goes back to change it, then "Send answers". */
const props = defineProps<{
  definition: FormDefinition
  controller: QuestionCardController
  /** True while offline or a send is in flight. "Send answers" stays focusable but ignores activation. */
  disabled?: boolean
  /** The ids of the card-wide error messages on screen. "Send answers" usually still has focus after a failed send, so it names them. */
  cardErrorIds?: string
}>()

// A required question with no answer is outlined, and its "Not answered yet" is in the error colour.
const rows = computed(() => props.definition.fields.map((field, i) => {
  const items = props.controller.answerItemsFor(field)
  return { field, number: i + 1, key: reviewItemKey(i), items, missing: !items && field.required }
}))

const missingText = computed(() => {
  const list = props.controller.missingRequired.value
  if (list.length === 0)
    return ''
  if (list.length === 1)
    return `Question ${list[0].index + 1} still needs an answer.`
  return `Questions ${list.map(m => m.index + 1).join(' and ')} still need answers.`
})
</script>

<template>
  <ol v-bind="partAttrs('review')">
    <li
      v-for="(row, i) in rows"
      :key="row.field.id"
      v-bind="partAttrs('review-item', row.missing && 'missing')"
    >
      <button
        v-bind="partAttrs('review-edit')"
        type="button"
        :data-focus="row.key"
        @click="controller.go(i, 'first')"
      >
        <!-- No aria-label: it would replace the question and the answer in the button's name. The name is built from the content instead: this prefix, the question, the answer, then the action. -->
        <span
          v-bind="partAttrs('review-number')"
          aria-hidden="true"
        >{{ row.number }}</span>
        <span class="sr-only">Question {{ row.number }}: </span>
        <span v-bind="partAttrs('review-question')">
          <QuestionCardRichText :text="row.field.label" />
        </span>
        <span
          v-bind="partAttrs('review-answer')"
          :class="row.missing && ERROR_TEXT_CLASS"
        >
          <QuestionCardAnswerItems
            v-if="row.items"
            :items="row.items"
          />
          <template v-else-if="row.field.required">
            Not answered yet
          </template>
          <span
            v-else
            v-bind="partAttrs('answer-empty')"
          >Skipped</span>
        </span>
        <span class="sr-only">. Change the answer.</span>
      </button>
    </li>
  </ol>

  <div v-bind="partAttrs('footer')">
    <p
      v-if="missingText"
      v-bind="partAttrs('footer-text')"
      :class="ERROR_TEXT_CLASS"
    >
      {{ missingText }}
    </p>
    <QuestionCardSendButton
      name="send-all"
      label="Send answers"
      :blocked="disabled"
      :nothing-to-send="controller.missingRequired.value.length > 0"
      :described-by="cardErrorIds"
      @send="controller.submitAll()"
    />
  </div>
  <p v-bind="partAttrs('keys')">
    Enter sends. Pick a row to change it. ← goes back to the last question.
  </p>
</template>
