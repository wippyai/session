<script setup lang="ts">
import type { MessageSeverity } from '../lib/error-text'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { textClassFor } from '../lib/error-text'

/**
 * A PrimeVue `Message` whose text takes the theme's severity class, with an
 * optional Retry button. The colour is on the text because the `Message`'s own
 * text colours are below 4.5:1 contrast in some themes. Other attributes
 * (`id`, `part`, `variant`) fall through to the `Message`.
 */
defineProps<{
  severity: MessageSeverity
  /** Show a Retry button that emits `retry`. */
  retry?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <Message
    :severity="severity"
    :closable="false"
  >
    <div class="flex items-center gap-2">
      <span :class="textClassFor(severity)"><slot /></span>
      <Button
        v-if="retry"
        type="button"
        link
        size="small"
        @click="emit('retry')"
      >
        Retry
      </Button>
    </div>
  </Message>
</template>
