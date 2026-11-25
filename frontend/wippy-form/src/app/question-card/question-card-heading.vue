<script setup lang="ts">
import type { FormDefinition } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import { partAttrs } from '../../lib/part-attrs'
import QuestionCardRichText from './question-card-rich-text.vue'

/**
 * The form title with an icon, and the form description under it. The title
 * is the form's heading (`<h2>`); a card's question under it is an `<h3>`.
 * One wrapper keeps them, and what the default slot adds under them, together
 * as one item of a flex layout.
 */
defineProps<{
  definition: Pick<FormDefinition, 'title' | 'description'>
  icon: string
}>()
</script>

<template>
  <div>
    <h2 v-bind="partAttrs('title')">
      <Icon
        :icon="icon"
        aria-hidden="true"
      />
      {{ definition.title }}
    </h2>
    <p
      v-if="definition.description"
      v-bind="partAttrs('form-description')"
    >
      <QuestionCardRichText :text="definition.description" />
    </p>
    <slot />
  </div>
</template>
