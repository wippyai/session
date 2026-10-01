<script setup lang="ts">
import { computed } from 'vue'
import { partClass } from '../../lib/part-class'

/**
 * A field's label and, on an editable required field, its "(required)" marker
 * (text, never colour alone), under the `field-label` and `field-marker`
 * parts. `FieldShell` renders it as a `<label>` (pointing at the control), a
 * `<legend>` (a choice's fieldset) or a plain `<span>` (the read-only view).
 */
defineProps<{
  tag: 'label' | 'legend' | 'span'
  /** The id of the control a `<label>` points at; ignored for the other tags. */
  controlId: string
  label: string
  /** Show the "(required)" marker. */
  required: boolean
}>()

const labelPart = computed(() => partClass('field-label'))
const markerPart = computed(() => partClass('field-marker'))
</script>

<template>
  <component
    :is="tag"
    :for="tag === 'label' ? controlId : undefined"
    :part="labelPart.part"
    :class="labelPart.class"
  >
    {{ label }}<span
      v-if="required"
      :part="markerPart.part"
      :class="`${markerPart.class} text-danger-600 dark:text-danger-400`"
    > (required)</span>
  </component>
</template>
