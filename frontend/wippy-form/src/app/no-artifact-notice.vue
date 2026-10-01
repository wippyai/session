<script setup lang="ts">
import type { FormDefinition } from '../lib/definition'
import Message from 'primevue/message'
import { computed } from 'vue'
import { partClass } from '../lib/part-class'
import FormFieldControl from './fields/form-field.vue'

defineProps<{
  definition: FormDefinition
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
      Disabled controls of each field's own kind, not read-only values: with
      no artifact there is no answer to show, and a read-only "Skipped" under
      every question would claim the reader skipped it.
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
      severity="secondary"
      :closable="false"
    >
      This form cannot be submitted here.
    </Message>
  </div>
</template>
