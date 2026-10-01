<script setup lang="ts">
import type { FormState } from '../lib/definition'
import { computed, ref } from 'vue'
import { partAttrs } from '../lib/part-attrs'
import FormFieldControl from './fields/form-field.vue'
import FormHeader from './form-header.vue'

/**
 * The read-only, post-submit view of a fields form — the counterpart of
 * `ActiveForm`. Every field shows its stored answer as text (an unanswered
 * one says "Skipped"), then the delivery status, late notice and answered
 * time. A form of choices only shows `QuestionCardSummary` instead.
 */
defineProps<{
  state: FormState
}>()

function formatTime(iso: string | null): string | null {
  if (!iso)
    return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

const statusEl = ref<HTMLElement | null>(null)

const rootPart = computed(() => partAttrs('card', 'answered'))
const fieldsPart = computed(() => partAttrs('fields'))
const statusPart = computed(() => partAttrs('status'))

defineExpose({
  /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
  focusStatus() {
    statusEl.value?.focus()
  },
})
</script>

<template>
  <div
    :part="`${rootPart.part} ${fieldsPart.part}`"
    :class="`w-form ${rootPart.class} ${fieldsPart.class}`"
  >
    <FormHeader
      :title="state.definition.title"
      :description="state.definition.description"
    />

    <FormFieldControl
      v-for="field in state.definition.fields"
      :key="field.id"
      :field="field"
      :model-value="state.data ? state.data[field.id] : undefined"
      :errors="[]"
      :disabled="true"
      :readonly="true"
    />

    <div
      ref="statusEl"
      tabindex="-1"
      :part="statusPart.part"
      :class="statusPart.class"
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
      <p v-if="formatTime(state.submitted_at)">
        Answered {{ formatTime(state.submitted_at) }}
      </p>
    </div>
  </div>
</template>
