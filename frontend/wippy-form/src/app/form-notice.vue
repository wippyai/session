<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import type { MessageSeverity } from '../lib/error-text'
import { partAttrs } from '../lib/part-attrs'
import FormFieldControl from './fields/form-field.vue'
import FormHeader from './form-header.vue'
import FormMessage from './form-message.vue'

/**
 * A form that cannot be answered here, under a message saying why. The
 * definition is known, so every field shows as a disabled control of its own
 * kind (a text box for a text field, never an empty radio group) below the
 * form's title and description. No answer was loaded and none is invented, so
 * the controls are empty and not read-only: a read-only "Skipped" under every
 * question would claim the reader skipped it.
 */
defineProps<{
  definition: FormDefinition
  severity: MessageSeverity
  message: string
}>()

const root = partAttrs('card', 'unsupported')
const fields = partAttrs('fields')
</script>

<template>
  <div
    :part="`${root.part} ${fields.part}`"
    :class="`w-form ${root.class} ${fields.class}`"
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

    <FormMessage :severity="severity">
      {{ message }}
    </FormMessage>
  </div>
</template>
