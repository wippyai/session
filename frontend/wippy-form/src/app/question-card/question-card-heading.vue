<script setup lang="ts">
import type { FormDefinition } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import { partAttrs } from '../../lib/part-attrs'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The form title with an icon, and the form description under it. */
defineProps<{
  definition: Pick<FormDefinition, 'title' | 'description'>
  icon: string
}>()
</script>

<template>
  <p v-bind="partAttrs('title')">
    <Icon
      :icon="icon"
      aria-hidden="true"
    />
    {{ definition.title }}
  </p>
  <p
    v-if="definition.description"
    v-bind="partAttrs('form-description')"
  >
    <QuestionCardRichText :text="definition.description" />
  </p>
</template>
