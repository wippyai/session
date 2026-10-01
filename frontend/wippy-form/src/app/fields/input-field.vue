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
 *  - `email` is `type="email"` for the keyboard hint; the form is
 *    `novalidate`, so the browser's own bubble never replaces the form's
 *    accessible error. Autofill is off: an agent may ask for someone else's
 *    address, and the browser must not offer the user's own.
 *  - `number` is deliberately NOT `InputNumber`, which clamps to min/max,
 *    rounds extra digits and strips the locale's group character. It is a
 *    text input; what the user typed is the draft, and `lib/decimal.ts` judges
 *    it strictly, so nothing is silently rewritten. The on-screen keyboard is
 *    chosen so the user can type what the parser accepts (a dot for decimals,
 *    an optional minus): see `numberInputMode`.
 *  - `placeholder` is a `text` (and `textarea`) key only; the other types
 *    take none.
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

/** True when the user's locale writes a decimal with a dot, the only separator the number parser takes. */
function localeWritesDotDecimal(): boolean {
  return new Intl.NumberFormat(undefined).formatToParts(1.1).find(part => part.type === 'decimal')?.value === '.'
}

/**
 * The on-screen keyboard for a number field. `numeric` has no minus key and
 * no separator, and `decimal` has no minus key on iOS and shows the locale's
 * separator (a comma in many locales, which the dot-only parser rejects). So
 * the digit keypads are used only where they cannot lock the user out: a whole
 * number that cannot be negative gets `numeric`, a fraction that cannot be
 * negative gets `decimal` when the locale's separator is a dot, and every
 * other number gets the full keyboard.
 */
function numberInputMode(field: NumberFormField): 'numeric' | 'decimal' | 'text' {
  const cannotBeNegative = field.min !== undefined && field.min >= 0
  if (!cannotBeNegative)
    return 'text'
  if (field.integer)
    return 'numeric'
  return localeWritesDotDecimal() ? 'decimal' : 'text'
}

const attrs = computed(() => {
  switch (props.field.type) {
    case 'email':
      return { type: 'email', inputmode: 'email', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' } as const
    case 'number':
      return { type: 'text', inputmode: numberInputMode(props.field), autocomplete: 'off', spellcheck: 'false' } as const
    default:
      return { type: 'text' } as const
  }
})
const placeholder = computed(() => props.field.type === 'text' ? props.field.placeholder : undefined)
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
        :placeholder="placeholder"
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
