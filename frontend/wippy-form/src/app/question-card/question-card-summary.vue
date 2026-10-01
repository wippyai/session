<script setup lang="ts">
import type { FormState } from '../../lib/definition'
import { computed, ref } from 'vue'
import { answerDisplayItems } from '../../lib/answers'
import { partAttrs } from '../../lib/part-attrs'
import QuestionCardAnswerItems from './question-card-answer-items.vue'
import QuestionCardHeading from './question-card-heading.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The read-only card shown once the form is answered: each answer, then the delivery status and the time it was answered. */
const props = defineProps<{
  state: FormState
}>()

const rows = computed(() => props.state.definition.fields.map(field => ({
  field,
  items: answerDisplayItems(field, props.state.data?.[field.id]),
})))

const answeredAt = computed(() => {
  const iso = props.state.submitted_at
  const date = iso ? new Date(iso) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : null
})

const statusEl = ref<HTMLElement | null>(null)

defineExpose({
  /** Moves focus to the status line after a send, so focus is not lost when the form swaps to this view. */
  focusStatus() {
    statusEl.value?.focus()
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

    <div
      ref="statusEl"
      tabindex="-1"
      v-bind="partAttrs('status')"
    >
      <p v-if="state.late">
        Late answer — this was answered after the conversation moved on. The assistant will confirm before
        acting on the earlier request.
      </p>
      <p v-if="state.delivery === 'pending'">
        Submitted. Waiting for the assistant.
      </p>
      <p v-else-if="state.delivery === 'running'">
        The assistant is reading your answer.
      </p>
      <p v-else-if="state.delivery === 'interrupted'">
        The assistant stopped before answering. Send a message to continue.
      </p>
      <p v-if="answeredAt">
        Answered {{ answeredAt }}
      </p>
    </div>
  </section>
</template>
