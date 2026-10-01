<script setup lang="ts">
import { computed } from 'vue'
import { partAttrs } from '../lib/part-attrs'

/**
 * The top of a fields form: its title and, when it has one, its description,
 * under the `fields-title` and `form-description` parts. The open form, the
 * answered view and the two "cannot answer here" notices all show it, so it
 * lives here once; the default slot adds anything that belongs under it (the
 * open form's "asked earlier" line).
 */
defineProps<{
  title: string
  description?: string
}>()

const titlePart = computed(() => partAttrs('fields-title'))
const descriptionPart = computed(() => partAttrs('form-description'))
</script>

<template>
  <div>
    <h2
      :part="titlePart.part"
      :class="titlePart.class"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      :part="descriptionPart.part"
      :class="descriptionPart.class"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>
