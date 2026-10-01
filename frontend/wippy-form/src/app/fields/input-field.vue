<script setup lang="ts">
import type { EmailFormField, FieldAnswer, FieldError, NumberFormField, TextFormField } from '../../lib/definition'
import InputText from 'primevue/inputtext'
import { computed, ref } from 'vue'
import { partClass } from '../../lib/part-class'
import FieldShell from './field-shell.vue'

/**
 * The single-line fields: `text`, `email` and `number` are one PrimeVue
 * `InputText` with the attributes of their kind.
 *
 *  - `email` is `type="email"` for the keyboard and autofill hints; the form
 *    is `novalidate`, so the browser's own bubble never replaces the form's
 *    accessible error.
 *  - `number` is deliberately NOT `InputNumber`, which clamps to min/max,
 *    rounds extra digits and strips the locale's group character. It is a
 *    text input with `inputmode="decimal"`; what the user typed is the draft,
 *    and `lib/decimal.ts` judges it strictly, so nothing is silently rewritten.
 */
const props = defineProps<{
  field: TextFormField | EmailFormField | NumberFormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

const ATTRS = {
  text: { type: 'text' },
  email: { type: 'email', inputmode: 'email', autocomplete: 'email', autocapitalize: 'off', spellcheck: 'false' },
  number: { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' },
} as const

const attrs = computed(() => ATTRS[props.field.type])
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
      <InputText
        v-bind="attrs"
        :id="id"
        :model-value="text"
        :placeholder="field.placeholder"
        :disabled="disabled"
        :invalid="invalid"
        :aria-describedby="describedBy"
        :aria-required="field.required ? 'true' : undefined"
        :part="inputPart.part"
        :class="inputPart.class"
        size="small"
        fluid
        @update:model-value="(v) => emit('update:modelValue', String(v ?? ''))"
      />
    </template>
  </FieldShell>
</template>
