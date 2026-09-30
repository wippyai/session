<script setup lang="ts">
import type { QuestionCardController } from '../../composables/use-question-card'
import type { FormDefinition } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { computed } from 'vue'
import { partClass } from '../../lib/part-class'
import QuestionCardAnswerItems from './question-card-answer-items.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The review step for a several-question card: every question's answer, editable, then "Send answers". */
const props = defineProps<{
  definition: FormDefinition
  controller: QuestionCardController
  /** True while offline or a submit is already in flight — disables "Send answers". */
  disabled?: boolean
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
function editPart() {
  return partClass('review-edit')
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
      :part="itemPart(!controller.answerItemsFor(field) && field.required).part"
      :class="itemPart(!controller.answerItemsFor(field) && field.required).class"
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
          :class="reviewAnswerPart.class"
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
      :class="footerTextPart.class"
    >
      {{ missingText }}
    </p>
    <Button
      type="button"
      :part="sendAllPart.part"
      :class="sendAllPart.class"
      data-focus="send-all"
      :disabled="missingList.length > 0 || disabled"
      @click="controller.submitAll()"
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
