<script setup lang="ts">
import { richSegments } from '../../lib/rich-text'

/**
 * Renders `text` with backtick-delimited spans as inline `<code>` — plain
 * text nodes only (Vue interpolation), never `v-html`. A fragment (no
 * wrapping element), so it can sit directly inside a `question`/
 * `option-label`/`review-question` part without adding an extra node to
 * that part's content.
 */
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <template
    v-for="(seg, i) in richSegments(props.text)"
    :key="i"
  >
    <!-- Adjacent text/code segments must not gain a whitespace text node between them. -->
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <code
      v-if="seg.code"
      part="code"
      class="w-form__code"
    >{{ seg.text }}</code><template v-else>{{ seg.text }}</template>
    <!-- eslint-enable vue/singleline-html-element-content-newline -->
  </template>
</template>
