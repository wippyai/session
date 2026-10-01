<script setup lang="ts">
import type { QuestionCardController } from '../../composables/use-question-card'
import type { FormDefinition, FormField } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { computed } from 'vue'
import { ERROR_TEXT_CLASS } from '../../lib/error-text'
import { partClass } from '../../lib/part-class'
import QuestionCardAnswerItems from './question-card-answer-items.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The review step for a several-question card: every question's answer, editable, then "Send answers". */
const props = defineProps<{
  definition: FormDefinition
  controller: QuestionCardController
  /** True while offline or a submit is already in flight — "Send answers" stays focusable but is marked `aria-disabled` and ignores activation. */
  disabled?: boolean
  /**
   * Space-separated ids of the card-wide error messages on screen (the
   * submit-failure banner, a form-level server error). "Send answers" is the
   * control that just failed and usually still has focus, so it names them.
   */
  cardErrorIds?: string
}>()

const reviewPart = computed(() => partClass('review'))
const footerPart = computed(() => partClass('footer'))
const footerTextPart = computed(() => partClass('footer-text'))
const sendAllPart = computed(() => partClass('send-all'))
const keysPart = computed(() => partClass('keys'))
const reviewNumberPart = computed(() => partClass('review-number'))
const reviewQuestionPart = computed(() => partClass('review-question'))
const reviewAnswerPart = computed(() => partClass('review-answer'))
const answerEmptyPart = computed(() => partClass('answer-empty'))

function itemPart(missing: boolean) {
  return partClass('review-item', missing && 'missing')
}

/** A required question with no answer yet: its row is outlined and its "Not answered yet" text is in the error colour. */
function isMissing(field: FormField): boolean {
  return !props.controller.answerItemsFor(field) && field.required
}
function editPart() {
  return partClass('review-edit')
}

function onSendAll() {
  // Focusable but inert while the card is blocked (see the template comment).
  if (props.disabled)
    return
  props.controller.submitAll()
}

const missingList = computed(() => props.controller.missingRequired.value)
const missingText = computed(() => {
  const list = missingList.value
  if (list.length === 0)
    return ''
  if (list.length === 1)
    return `Question ${list[0].index + 1} still needs an answer.`
  return `Questions ${list.map(m => m.index + 1).join(' and ')} still need answers.`
})
</script>

<template>
  <ol
    :part="reviewPart.part"
    :class="reviewPart.class"
  >
    <li
      v-for="(field, i) in definition.fields"
      :key="field.id"
      :part="itemPart(isMissing(field)).part"
      :class="itemPart(isMissing(field)).class"
    >
      <button
        type="button"
        :part="editPart().part"
        :class="editPart().class"
        :aria-label="`Question ${i + 1}: change the answer`"
        :data-focus="`review-item-${i}`"
        @click="controller.go(i, 'first')"
      >
        <span
          :part="reviewNumberPart.part"
          :class="reviewNumberPart.class"
          aria-hidden="true"
        >{{ i + 1 }}</span>
        <span
          :part="reviewQuestionPart.part"
          :class="reviewQuestionPart.class"
        >
          <QuestionCardRichText :text="field.label" />
        </span>
        <span
          :part="reviewAnswerPart.part"
          :class="[reviewAnswerPart.class, isMissing(field) && ERROR_TEXT_CLASS]"
        >
          <QuestionCardAnswerItems
            v-if="controller.answerItemsFor(field)"
            :items="controller.answerItemsFor(field)!"
          />
          <template v-else-if="field.required">
            Not answered yet
          </template>
          <span
            v-else
            :part="answerEmptyPart.part"
            :class="answerEmptyPart.class"
          >Skipped</span>
        </span>
      </button>
    </li>
  </ol>

  <div
    :part="footerPart.part"
    :class="footerPart.class"
  >
    <p
      v-if="missingText"
      :part="footerTextPart.part"
      :class="[footerTextPart.class, ERROR_TEXT_CLASS]"
    >
      {{ missingText }}
    </p>
    <!--
      "Send answers" is the control that just failed when a send is rejected,
      and it has focus. While the card is blocked (a send in flight, or
      offline) it is marked `aria-disabled` and dimmed with the theme's own
      `p-disabled` marker, not given the `disabled` attribute: a focused button
      that becomes disabled hands focus to <body>, so a rejected send left the
      reader with nothing focused. Activation is ignored in `onSendAll`. While a
      required answer is missing it stays a real disabled button; focus is on
      that question's row then (see `go` in use-question-card.ts).
    -->
    <Button
      type="button"
      :part="sendAllPart.part"
      :class="[sendAllPart.class, disabled && 'p-disabled']"
      data-focus="send-all"
      :aria-describedby="cardErrorIds"
      :aria-disabled="disabled ? 'true' : undefined"
      :disabled="missingList.length > 0"
      @click="onSendAll"
    >
      Send answers
      <Icon
        icon="tabler:send-2"
        aria-hidden="true"
      />
    </Button>
  </div>
  <p
    :part="keysPart.part"
    :class="keysPart.class"
  >
    Enter sends. Pick a row to change it. ← goes back to the last question.
  </p>
</template>
