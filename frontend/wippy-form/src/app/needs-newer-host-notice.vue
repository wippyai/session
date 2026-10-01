<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import Message from 'primevue/message'
import { WARN_TEXT_CLASS } from '../lib/error-text'
import ChoiceField from './fields/choice-field.vue'

defineProps<{
  definition: FormDefinition
  /**
   * The Host's own `state` prop (the package-tag lifecycle mirrored from the
   * artifact) says `idle`: an answer was already accepted. Without the
   * artifact-state API this component cannot read that answer back, so the
   * notice says where it is instead of implying the form is still open.
   */
  answered?: boolean
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

    <!--
      `:readonly="false"` (unlike NoArtifactNotice, which has no state to
      show at all): the Host still handed this component its `definition`
      prop directly — it just predates the artifact-state API, so there is
      no GET to fetch an answer from. Rendering the real options disabled
      gives the reader something to look at instead of "—" placeholder rows,
      without inventing an answer that was never loaded.

      For the same reason the notice below points at the chat for an answer
      that was already sent (the user's "Answered …" message and the agent's
      reply are readable there): every option here is unselected, so the card
      alone would look like an open, unanswered form (EE2-2461 / F-P4F-6).
    -->
    <ChoiceField
      v-for="field in definition.fields"
      :key="field.id"
      :field="field"
      :model-value="undefined"
      :errors="[]"
      :disabled="true"
      :readonly="false"
    />

    <Message
      v-if="answered"
      severity="secondary"
      :closable="false"
    >
      This form was answered. Your answer is in the chat.
    </Message>
    <Message
      v-else
      severity="warn"
      :closable="false"
    >
      <span :class="WARN_TEXT_CLASS">This form needs a newer Web Host. If you already answered it, your answer is in the chat.</span>
    </Message>
  </div>
</template>
