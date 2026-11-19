<script setup lang="ts">
import type { ChoiceAnswer, ChoiceFormField, FieldAnswer, FieldError, OtherAnswer } from '../../lib/definition'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import { computed, ref, useId, watch } from 'vue'
import { answerHasOption, answerHasOther, answerOtherText } from '../../lib/definition'
import { partAttrs } from '../../lib/part-attrs'
import FieldShell from './field-shell.vue'

/**
 * A `choice` field as radios or checkboxes (with an optional Other box), on
 * the shared `FieldShell`. This is how a choice renders inside a form that
 * also holds standard fields; a form of choices only renders as the question
 * card instead. No per-option notes here — the card has those.
 *
 * A group in error marks every radio or checkbox `aria-invalid` (the
 * PrimeVue `invalid` prop), the inputs a screen reader lands on, as the other
 * controls do; the fieldset is described by the field description and the
 * error list, and so is every input (and the Other text box), because a screen
 * reader that lands on one input reads that input's own description. A `group`
 * role may not carry `aria-invalid` or `aria-required`, so the state sits on
 * the inputs and not on the group.
 *
 * Roles: the fieldset is the group. A single choice adds a `radiogroup` (with
 * `aria-required`, and named by the legend through `aria-labelledby`, because a
 * legend names only its fieldset) around its radios; a multiple choice adds no role, since its
 * fieldset already is the group and `aria-required` is not allowed on one.
 *
 * Other is its own selection state, never a reserved option value: an option
 * value is any text the agent wrote, so no string is safe to reserve. Every
 * control is binary: it reads whether its option (or Other) is chosen.
 */
const props = defineProps<{
  field: ChoiceFormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  /** Read-only, submitted display — no controls, just the accepted values as text. */
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

const groupId = useId()
// Distinct prefixes ("opt-<index>" vs "other"/"other-text") so the Other
// control's id can never collide with an option id, regardless of what the
// option values are (they may contain spaces, or literally be "other").
const otherControlId = `${groupId}-other`
const otherTextId = `${groupId}-other-text`

function optionId(index: number): string {
  return `${groupId}-opt-${index}`
}

const shell = ref<InstanceType<typeof FieldShell> | null>(null)
const bodyEl = ref<HTMLElement | null>(null)

// A PrimeVue radio or checkbox puts `$attrs` on its wrapper div, so the
// description and error links go to the real `<input>` through its pass-through.
function inputPt(describedBy: string | undefined) {
  return { input: { 'aria-describedby': describedBy } }
}

const optionsPart = partAttrs('field-options')
const optionPart = partAttrs('field-option')
const otherOptionPart = partAttrs('field-option', 'other')
const optionInputPart = partAttrs('field-option-input')
const optionLabelPart = partAttrs('field-option-label')
const optionDescriptionPart = partAttrs('field-option-description')
const otherBodyPart = partAttrs('field-other')
const otherInputPart = partAttrs('field-other-input')

const control = computed(() => props.field.multiple ? Checkbox : RadioButton)

// The answer a choice field holds is always a choice answer.
const answer = computed(() => props.modelValue as ChoiceAnswer | undefined)

// A blank or too long Other text is the one error that is about the text box
// rather than the choice, so only then is the box itself marked invalid.
const otherTextInvalid = computed(() => props.errors.some(e => e.code === 'blank' || e.code === 'too_long'))

const otherChosen = computed(() => answerHasOther(answer.value))
const otherText = ref(answerOtherText(answer.value))
watch(answer, (v) => {
  otherText.value = answerOtherText(v)
})

function isChosen(value: string): boolean {
  return answerHasOption(answer.value, value)
}

/** A multiple choice's answer: the options `chosen` keeps, in definition order, then Other. */
function emitMulti(chosen: (value: string) => boolean, includeOther: boolean) {
  const arr: Array<string | OtherAnswer> = props.field.options.map(o => o.value).filter(chosen)
  if (includeOther)
    arr.push({ other: otherText.value })
  emit('update:modelValue', arr.length > 0 ? arr : undefined)
}

// A radio only ever reports becoming checked.
function setOption(value: string, checked: boolean) {
  if (props.field.multiple)
    emitMulti(v => v === value ? checked : isChosen(v), otherChosen.value)
  else
    emit('update:modelValue', value)
}

function setOther(checked: boolean) {
  if (props.field.multiple)
    emitMulti(isChosen, checked)
  else
    emit('update:modelValue', { other: otherText.value })
}

watch(otherText, () => {
  if (otherChosen.value)
    setOther(true)
})

defineExpose({
  focusFirstControl() {
    shell.value?.focusFirstControl()
  },
  // For a blank Other answer the text box is what needs fixing.
  focusOtherText() {
    // Ids come from Vue's useId plus a fixed suffix, so a quoted attribute
    // selector needs no escaping.
    const text = bodyEl.value?.querySelector<HTMLElement>(`[id="${otherTextId}"]`)
    if (text)
      text.focus()
    else
      shell.value?.focusFirstControl()
  },
})
</script>

<template>
  <FieldShell
    v-slot="{ invalid, describedBy, labelId }"
    ref="shell"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    layout="group"
  >
    <div
      ref="bodyEl"
      v-bind="optionsPart"
      :role="field.multiple ? undefined : 'radiogroup'"
      :aria-labelledby="field.multiple ? undefined : labelId"
      :aria-required="!field.multiple && field.required ? 'true' : undefined"
    >
      <div
        v-for="(option, index) in field.options"
        :key="option.value"
        v-bind="optionPart"
      >
        <component
          :is="control"
          :model-value="isChosen(option.value)"
          binary
          :input-id="optionId(index)"
          :name="field.multiple ? undefined : groupId"
          :disabled="disabled"
          :invalid="invalid"
          :pt="inputPt(describedBy)"
          v-bind="optionInputPart"
          @update:model-value="(checked: unknown) => setOption(option.value, !!checked)"
        />
        <label
          :for="optionId(index)"
          v-bind="optionLabelPart"
        >
          {{ option.label }}
          <span
            v-if="option.description"
            v-bind="optionDescriptionPart"
          >{{ option.description }}</span>
        </label>
      </div>
      <div
        v-if="field.allow_other"
        v-bind="otherOptionPart"
      >
        <component
          :is="control"
          :model-value="otherChosen"
          binary
          :input-id="otherControlId"
          :name="field.multiple ? undefined : groupId"
          :disabled="disabled"
          :invalid="invalid"
          :pt="inputPt(describedBy)"
          v-bind="optionInputPart"
          @update:model-value="(checked: unknown) => setOther(!!checked)"
        />
        <div v-bind="otherBodyPart">
          <label
            :for="otherControlId"
            v-bind="optionLabelPart"
          >Other</label>
          <label
            :for="otherTextId"
            class="sr-only"
          >Other answer</label>
          <InputText
            :id="otherTextId"
            v-model="otherText"
            :disabled="disabled || !otherChosen"
            :aria-describedby="describedBy"
            :invalid="invalid && otherTextInvalid"
            v-bind="otherInputPart"
            size="small"
            fluid
          />
        </div>
      </div>
    </div>
  </FieldShell>
</template>
