<script setup lang="ts">
import type { FieldAnswer, FieldError, TextareaFormField } from '../../lib/definition'
import Textarea from 'primevue/textarea'
import { computed, ref } from 'vue'
import { partClass } from '../../lib/part-class'
import FieldShell from './field-shell.vue'

/**
 * The multi-line text field: a PrimeVue `Textarea` that grows with its
 * content. Enter adds a line (it never submits), and the value keeps its line
 * breaks exactly as typed.
 */
const props = defineProps<{
  field: TextareaFormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

const text = computed(() => typeof props.modelValue === 'string' ? props.modelValue : '')
const inputPart = computed(() => partClass('field-input'))

const shell = ref<InstanceType<typeof FieldShell> | null>(null)
defineExpose({ focusFirstControl: () => shell.value?.focusFirstControl() })
</script>

<template>
  <FieldShell
    ref="shell"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    layout="stacked"
  >
    <template #default="{ id, describedBy, invalid }">
      <Textarea
        :id="id"
        :model-value="text"
        :placeholder="field.placeholder"
        :disabled="disabled"
        :invalid="invalid"
        :aria-describedby="describedBy"
        :aria-required="field.required ? 'true' : undefined"
        :part="inputPart.part"
        :class="inputPart.class"
        rows="3"
        auto-resize
        fluid
        @update:model-value="(v) => emit('update:modelValue', String(v ?? ''))"
      />
    </template>
  </FieldShell>
</template>
