<script setup lang="ts">
import type { FieldAnswer, FieldError, FormField } from '../../lib/definition'
import { ref } from 'vue'
import CheckboxField from './checkbox-field.vue'
import ChoiceField from './choice-field.vue'
import DateField from './date-field.vue'
import InputField from './input-field.vue'
import TextareaField from './textarea-field.vue'

/**
 * Renders one field of any type through its own control, all on the shared
 * `FieldShell`. The active form, the answered view and both notices go
 * through this one component, so a field looks and reads the same wherever it
 * shows: editable, disabled (a form that cannot be answered here), or
 * read-only (a stored answer).
 */
defineProps<{
  field: FormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

type FieldHandle = { focusFirstControl: () => void, focusOtherText?: () => void }
const control = ref<FieldHandle | null>(null)

defineExpose({
  focusFirstControl: () => control.value?.focusFirstControl(),
  // Only a choice field has an Other box; any other type falls back to its control.
  focusOtherText() {
    if (control.value?.focusOtherText)
      control.value.focusOtherText()
    else
      control.value?.focusFirstControl()
  },
})
</script>

<template>
  <ChoiceField
    v-if="field.type === 'choice'"
    ref="control"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    @update:model-value="(v) => emit('update:modelValue', v)"
  />
  <InputField
    v-else-if="field.type === 'text' || field.type === 'email' || field.type === 'number'"
    ref="control"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    @update:model-value="(v) => emit('update:modelValue', v)"
  />
  <TextareaField
    v-else-if="field.type === 'textarea'"
    ref="control"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    @update:model-value="(v) => emit('update:modelValue', v)"
  />
  <DateField
    v-else-if="field.type === 'date'"
    ref="control"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    @update:model-value="(v) => emit('update:modelValue', v)"
  />
  <CheckboxField
    v-else-if="field.type === 'checkbox'"
    ref="control"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    @update:model-value="(v) => emit('update:modelValue', v)"
  />
</template>
