<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import type { MessageSeverity } from '../lib/error-text'
import ChoiceField from './fields/choice-field.vue'
import FormMessage from './form-message.vue'

/** The form's questions with their options disabled, under a message saying why it cannot be answered here. */
defineProps<{
  definition: FormDefinition
  severity: MessageSeverity
  message: string
}>()
</script>

<template>
  <div class="flex flex-col gap-4 min-w-0">
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semibold text-color break-words">
        {{ definition.title }}
      </h2>
      <p
        v-if="definition.description"
        class="text-sm text-muted-color break-words"
      >
        {{ definition.description }}
      </p>
    </div>

    <ChoiceField
      v-for="field in definition.fields"
      :key="field.id"
      :field="field"
    />

    <FormMessage :severity="severity">
      {{ message }}
    </FormMessage>
  </div>
</template>
