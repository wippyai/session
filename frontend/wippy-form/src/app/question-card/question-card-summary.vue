<script setup lang="ts">
import type { ChoiceFormState } from '../../lib/definition'
import { computed, ref } from 'vue'
import { answerDisplayItems } from '../../lib/answers'
import { partAttrs } from '../../lib/part-attrs'
import FormAnsweredStatus from '../form-answered-status.vue'
import QuestionCardAnswerItems from './question-card-answer-items.vue'
import QuestionCardHeading from './question-card-heading.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The read-only card shown once the form is answered: each answer, then the delivery status and the time it was answered. */
const props = defineProps<{
  state: ChoiceFormState
}>()

const rows = computed(() => props.state.definition.fields.map(field => ({
  field,
  items: answerDisplayItems(field, props.state.data?.[field.id]),
})))

const statusRef = ref<InstanceType<typeof FormAnsweredStatus> | null>(null)

defineExpose({
  /** Moves focus to the status line after a send, so focus is not lost when the form swaps to this view. */
  focusStatus() {
    statusRef.value?.focus()
  },
})
</script>

<template>
  <section
    class="w-form"
    v-bind="partAttrs('card', 'answered')"
    :aria-label="`${state.definition.title}, answered`"
  >
    <QuestionCardHeading
      :definition="state.definition"
      icon="tabler:circle-check"
    />

    <dl v-bind="partAttrs('summary')">
      <div
        v-for="row in rows"
        :key="row.field.id"
        v-bind="partAttrs('summary-item')"
      >
        <dt v-bind="partAttrs('summary-question')">
          <QuestionCardRichText :text="row.field.label" />
        </dt>
        <dd v-bind="partAttrs('summary-answer')">
          <QuestionCardAnswerItems
            v-if="row.items"
            :items="row.items"
          />
          <span
            v-else
            v-bind="partAttrs('answer-empty')"
          >Skipped</span>
        </dd>
      </div>
    </dl>

    <FormAnsweredStatus
      ref="statusRef"
      :state="state"
    />
  </section>
</template>
