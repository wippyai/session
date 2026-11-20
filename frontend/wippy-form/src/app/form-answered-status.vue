<script setup lang="ts">
import type { FormState } from '../lib/definition'
import { computed, ref } from 'vue'
import { partAttrs } from '../lib/part-attrs'

/**
 * The status line under an answered form, shared by the question card summary
 * and the fields form: the late notice, where the answer is on its way to the
 * assistant, and the time it was answered.
 */
const props = defineProps<{
  state: Pick<FormState, 'late' | 'delivery' | 'submitted_at'>
}>()

const answeredAt = computed(() => {
  const iso = props.state.submitted_at
  const date = iso ? new Date(iso) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : null
})

const statusEl = ref<HTMLElement | null>(null)

defineExpose({
  /** Moves focus to the status line after a send, so focus is not lost when the form swaps to its answered view. */
  focus() {
    statusEl.value?.focus()
  },
})
</script>

<template>
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
</template>
