<script setup lang="ts">
import type { FormState } from '../lib/definition'
import ChoiceField from './fields/ChoiceField.vue'

defineProps<{
  state: FormState
}>()

function formatTime(iso: string | null): string | null {
  if (!iso)
    return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}
</script>

<template>
  <div class="flex flex-col gap-4 min-w-0">
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semibold text-surface-900 dark:text-surface-0 break-words">
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

    <div class="text-xs text-muted-color flex flex-col gap-0.5">
      <p v-if="state.late">
        Late answer — this was answered after the conversation moved on. The assistant will confirm before
        acting on the earlier request.
      </p>
      <p v-if="state.delivery === 'pending'">
        Submitted. Waiting for the assistant.
      </p>
      <p v-if="formatTime(state.submitted_at)">
        Answered {{ formatTime(state.submitted_at) }}
      </p>
    </div>
  </div>
</template>
