<script setup lang="ts">
import type { FormState } from '../lib/definition'
import { computed, ref } from 'vue'
import { partAttrs } from '../lib/part-attrs'
import FormFieldControl from './fields/form-field.vue'
import FormAnsweredStatus from './form-answered-status.vue'
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

const statusRef = ref<InstanceType<typeof FormAnsweredStatus> | null>(null)

const rootPart = computed(() => partAttrs('card', 'answered'))
const fieldsPart = computed(() => partAttrs('fields'))

defineExpose({
  /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
  focusStatus() {
    statusRef.value?.focus()
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

    <FormAnsweredStatus
      ref="statusRef"
      :state="state"
    />
  </div>
</template>
