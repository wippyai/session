<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import Message from 'primevue/message'
import { computed } from 'vue'
import { partClass } from '../lib/part-class'
import FormFieldControl from './fields/form-field.vue'
import FormHeader from './form-header.vue'

/**
 * A form this component shows but cannot let the user answer, in one of two
 * cases:
 *
 *  - `needs-newer-host`: the Host predates the artifact-state API, so there is
 *    no way to load the form's state or submit it.
 *  - `no-artifact`: the element is not bound to an artifact, so there is
 *    nothing to submit to.
 *
 * Either way the definition itself is known (the Host handed it over as a
 * prop), so every field is shown as a real, disabled control of its own kind
 * (a V2 text box is a text box, never an empty radio group) with the form's
 * title and description above and a message below. `:readonly="false"` (unlike
 * a read-only answer) and `:model-value="undefined"`: no answer was loaded, and
 * none is invented. A read-only "Skipped" under every question would claim the
 * reader skipped it.
 */
const props = defineProps<{
  definition: FormDefinition
  reason: 'needs-newer-host' | 'no-artifact'
  /**
   * With `needs-newer-host`: the Host's own `state` prop (the package-tag
   * lifecycle mirrored from the artifact) says `idle`, so an answer was already
   * accepted. Without the artifact-state API this component cannot read that
   * answer back, so the message says where it is instead of implying the form
   * is still open: every control here is empty, so the card alone would look
   * like an open, unanswered form (EE2-2461 / F-P4F-6).
   */
  answered?: boolean
}>()

const rootPart = computed(() => partClass('card', 'unsupported'))
const fieldsPart = computed(() => partClass('fields'))

const message = computed(() => {
  if (props.reason === 'no-artifact')
    return { severity: 'secondary', text: 'This form cannot be submitted here.' } as const
  if (props.answered)
    return { severity: 'secondary', text: 'This form was answered. Your answer is in the chat.' } as const
  return { severity: 'warn', text: 'This form needs a newer Web Host. If you already answered it, your answer is in the chat.' } as const
})
</script>

<template>
  <div
    :part="`${rootPart.part} ${fieldsPart.part}`"
    :class="`w-form ${rootPart.class} ${fieldsPart.class}`"
  >
    <FormHeader
      :title="definition.title"
      :description="definition.description"
    />

    <FormFieldControl
      v-for="field in definition.fields"
      :key="field.id"
      :field="field"
      :model-value="undefined"
      :errors="[]"
      :disabled="true"
      :readonly="false"
    />

    <Message
      :severity="message.severity"
      :closable="false"
    >
      {{ message.text }}
    </Message>
  </div>
</template>
