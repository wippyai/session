<script setup lang="ts">
import type { CheckboxFormField, FieldAnswer, FieldError } from '../../lib/definition'
import Checkbox from 'primevue/checkbox'
import { computed, ref } from 'vue'
import { partAttrs } from '../../lib/part-attrs'
import FieldShell from './field-shell.vue'

/**
 * The single yes/no field: a PrimeVue `Checkbox` with a clickable label. The
 * draft is always an explicit boolean, so an optional box left unchecked is
 * sent as `false`; a required one must be checked.
 */
const props = defineProps<{
  field: CheckboxFormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

const checked = computed(() => props.modelValue === true)
const inputPart = computed(() => partAttrs('field-input'))

// A PrimeVue Checkbox puts `$attrs` on its wrapper div, so the description
// and error links go to the real `<input>` through its pass-through instead.
function inputAttrs(describedBy: string | undefined) {
  return {
    input: {
      'aria-describedby': describedBy,
      'aria-required': props.field.required ? 'true' : undefined,
    },
  }
}

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
    layout="inline"
  >
    <template #default="{ id, describedBy, invalid }">
      <Checkbox
        :model-value="checked"
        binary
        :input-id="id"
        :disabled="disabled"
        :invalid="invalid"
        :pt="inputAttrs(describedBy)"
        :part="inputPart.part"
        :class="inputPart.class"
        @update:model-value="(v) => emit('update:modelValue', !!v)"
      />
    </template>
  </FieldShell>
</template>
