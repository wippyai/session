<script setup lang="ts">
import { lengthLimitMessage } from '../../lib/answers'
import { ERROR_TEXT_CLASS } from '../../lib/error-text'
import { partAttrs } from '../../lib/part-attrs'

/** The alert under a note or Other box whose text is over the length limit. */
defineProps<{
  max: number
}>()
</script>

<template>
  <p
    v-bind="partAttrs('error')"
    :class="ERROR_TEXT_CLASS"
    role="alert"
  >
    {{ lengthLimitMessage(max) }}
  </p>
</template>
