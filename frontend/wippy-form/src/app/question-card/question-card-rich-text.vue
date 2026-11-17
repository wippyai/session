<script setup lang="ts">
import { richSegments } from '../../lib/rich-text'

/**
 * Renders `text` with backtick spans as inline `<code>`, as text nodes only
 * and never as `v-html`. It has no wrapping element, so it can sit directly
 * in a part without adding a node to it.
 */
defineProps<{
  text: string
}>()
</script>

<template>
  <template
    v-for="(seg, i) in richSegments(text)"
    :key="i"
  >
    <!-- Adjacent text and code segments must not gain a whitespace text node between them. -->
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <code
      v-if="seg.code"
      part="code"
      class="w-form__code"
    >{{ seg.text }}</code><template v-else>{{ seg.text }}</template>
    <!-- eslint-enable vue/singleline-html-element-content-newline -->
  </template>
</template>
