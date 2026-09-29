<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import Message from 'primevue/message'
import ChoiceField from './fields/ChoiceField.vue'

defineProps<{
  definition: FormDefinition
}>()
</script>

<template>
  <div class="flex flex-col gap-4 min-w-0">
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semibold text-surface-900 dark:text-surface-0 break-words">
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
      :model-value="undefined"
      :errors="[]"
      :disabled="true"
      :readonly="true"
    />

    <Message
      severity="secondary"
      :closable="false"
    >
      This form cannot be submitted here.
    </Message>
  </div>
</template>
