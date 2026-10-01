<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import Message from 'primevue/message'
import { computed } from 'vue'
import { partClass } from '../lib/part-class'
import FormFieldControl from './fields/form-field.vue'

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

const rootPart = computed(() => partClass('card', 'unsupported'))
const fieldsPart = computed(() => partClass('fields'))
const titlePart = computed(() => partClass('fields-title'))
const formDescriptionPart = computed(() => partClass('form-description'))
</script>

<template>
  <div
    :part="`${rootPart.part} ${fieldsPart.part}`"
    :class="`w-form ${rootPart.class} ${fieldsPart.class}`"
  >
    <div>
      <h2
        :part="titlePart.part"
        :class="titlePart.class"
      >
        {{ definition.title }}
      </h2>
      <p
        v-if="definition.description"
        :part="formDescriptionPart.part"
        :class="formDescriptionPart.class"
      >
        {{ definition.description }}
      </p>
    </div>

    <!--
      `:readonly="false"` (unlike a read-only answer): the Host still handed
      this component its `definition` prop directly — it just predates the
      artifact-state API, so there is no GET to fetch an answer from.
      Rendering the real controls disabled, each of its own kind (a V2 text
      box is a text box, never an empty radio group), gives the reader
      something to look at instead of "—" placeholder rows, without inventing
      an answer that was never loaded.

      For the same reason the notice below points at the chat for an answer
      that was already sent (the user's "Answered …" message and the agent's
      reply are readable there): every control here is empty, so the card
      alone would look like an open, unanswered form (EE2-2461 / F-P4F-6).
    -->
    <FormFieldControl
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
      This form needs a newer Web Host. If you already answered it, your answer is in the chat.
    </Message>
  </div>
</template>
