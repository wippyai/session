<script setup lang="ts">
import type { FormState } from '../lib/definition'
import { ref } from 'vue'
import ChoiceField from './fields/choice-field.vue'

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

defineExpose({
  /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
  focusStatus() {
    statusEl.value?.focus()
  },
})
</script>

<template>
  <div class="flex flex-col gap-4 min-w-0">
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semibold text-color break-words">
        {{ state.definition.title }}
      </h2>
      <p
        v-if="state.definition.description"
        class="text-sm text-muted-color break-words"
      >
        {{ state.definition.description }}
      </p>
    </div>

    <ChoiceField
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
      class="text-xs text-muted-color flex flex-col gap-0.5 outline-none"
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
