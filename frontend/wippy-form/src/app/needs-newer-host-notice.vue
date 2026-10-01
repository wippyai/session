<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import Message from 'primevue/message'
import ChoiceField from './fields/choice-field.vue'

defineProps<{
  definition: FormDefinition
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
      severity="warn"
      :closable="false"
    >
      This form needs a newer Web Host.
    </Message>
  </div>
</template>
