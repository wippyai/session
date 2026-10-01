<script setup lang="ts">
import type { ChoiceAnswer, ChoiceFormField, FieldAnswer, FieldError, OtherAnswer } from '../../lib/definition'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import { computed, ref, useId, watch } from 'vue'
import { answerHasOther, answerOtherText } from '../../lib/definition'
import { partClass } from '../../lib/part-class'
import FieldShell from './field-shell.vue'

/**
 * A `choice` field as radios or checkboxes (with an optional Other box), on
 * the shared `FieldShell`. This is how a choice renders inside a form that
 * also holds standard fields; a form of choices only renders as the question
 * card instead. No per-option notes here — the card has those.
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
const otherLabelId = `${otherControlId}-label`
const otherTextId = `${groupId}-other-text`
const otherTextLabelId = `${otherTextId}-label`

function optionId(index: number): string {
  return `${groupId}-opt-${index}`
}

const shell = ref<InstanceType<typeof FieldShell> | null>(null)
const bodyEl = ref<HTMLElement | null>(null)

const optionsPart = computed(() => partClass('field-options'))
const optionPart = computed(() => partClass('field-option'))
const otherOptionPart = computed(() => partClass('field-option', 'other'))
const optionInputPart = computed(() => partClass('field-option-input'))
const optionLabelPart = computed(() => partClass('field-option-label'))
const optionDescriptionPart = computed(() => partClass('field-option-description'))
const otherBodyPart = computed(() => partClass('field-other'))
const otherInputPart = computed(() => partClass('field-other-input'))

// The answer a choice field holds is always a choice answer.
const answer = computed(() => props.modelValue as ChoiceAnswer | undefined)

// ── Single choice ──────────────────────────────────────────────
// Local sentinel value for the "Other" radio's v-model binding — never sent
// anywhere; just distinguishes "Other is selected" from a real option value.
const OTHER_TOKEN = 'choice-field-other-sentinel'

function isOther(v: ChoiceAnswer | undefined): v is OtherAnswer {
  return !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as OtherAnswer).other === 'string'
}

const singleSelected = computed<string>({
  get() {
    const v = answer.value
    if (typeof v === 'string')
      return v
    if (isOther(v))
      return OTHER_TOKEN
    return ''
  },
  set(next) {
    if (next === OTHER_TOKEN)
      emit('update:modelValue', { other: singleOtherText.value })
    else if (next === '')
      emit('update:modelValue', undefined)
    else
      emit('update:modelValue', next)
  },
})

const singleOtherText = ref(answerOtherText(answer.value))
watch(answer, (v) => {
  if (!props.field.multiple)
    singleOtherText.value = answerOtherText(v)
})
watch(singleOtherText, (text) => {
  if (!props.field.multiple && singleSelected.value === OTHER_TOKEN)
    emit('update:modelValue', { other: text })
})

// ── Multiple choice ─────────────────────────────────────────────
const multiSelected = computed<string[]>(() => {
  const v = answer.value
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
})
const multiOtherChecked = computed(() => props.field.multiple && answerHasOther(answer.value))
const multiOtherText = ref(answerOtherText(answer.value))
watch(answer, (v) => {
  if (props.field.multiple)
    multiOtherText.value = answerOtherText(v)
})

function emitMulti(values: string[], includeOther: boolean, otherText: string) {
  const arr: Array<string | OtherAnswer> = [...values]
  if (includeOther)
    arr.push({ other: otherText })
  emit('update:modelValue', arr.length > 0 ? arr : undefined)
}

function toggleOption(value: string, checked: boolean) {
  const set = new Set(multiSelected.value)
  if (checked)
    set.add(value)
  else
    set.delete(value)
  emitMulti(props.field.options.filter(o => set.has(o.value)).map(o => o.value), multiOtherChecked.value, multiOtherText.value)
}

function toggleOther(checked: boolean) {
  emitMulti(multiSelected.value, checked, multiOtherText.value)
}

watch(multiOtherText, (text) => {
  if (multiOtherChecked.value)
    emitMulti(multiSelected.value, true, text)
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
      :part="optionsPart.part"
      :class="optionsPart.class"
      :role="field.multiple ? 'group' : 'radiogroup'"
      :aria-required="field.required ? 'true' : undefined"
    >
      <template v-if="!field.multiple">
        <div
          v-for="(option, index) in field.options"
          :key="option.value"
          :part="optionPart.part"
          :class="optionPart.class"
        >
          <RadioButton
            v-model="singleSelected"
            :input-id="optionId(index)"
            :name="groupId"
            :value="option.value"
            :disabled="disabled"
            :part="optionInputPart.part"
            :class="optionInputPart.class"
          />
          <label
            :for="optionId(index)"
            :part="optionLabelPart.part"
            :class="optionLabelPart.class"
          >
            {{ option.label }}
            <span
              v-if="option.description"
              :part="optionDescriptionPart.part"
              :class="optionDescriptionPart.class"
            >{{ option.description }}</span>
          </label>
        </div>
        <div
          v-if="field.allow_other"
          :part="otherOptionPart.part"
          :class="otherOptionPart.class"
        >
          <RadioButton
            v-model="singleSelected"
            :input-id="otherControlId"
            :name="groupId"
            :value="OTHER_TOKEN"
            :disabled="disabled"
            :part="optionInputPart.part"
            :class="optionInputPart.class"
          />
          <div
            :part="otherBodyPart.part"
            :class="otherBodyPart.class"
          >
            <label
              :id="otherLabelId"
              :for="otherControlId"
              :part="optionLabelPart.part"
              :class="optionLabelPart.class"
            >Other</label>
            <label
              :id="otherTextLabelId"
              :for="otherTextId"
              class="w-form__sr"
            >Other answer</label>
            <InputText
              :id="otherTextId"
              v-model="singleOtherText"
              :disabled="disabled || singleSelected !== OTHER_TOKEN"
              :part="otherInputPart.part"
              :class="otherInputPart.class"
              size="small"
              fluid
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(option, index) in field.options"
          :key="option.value"
          :part="optionPart.part"
          :class="optionPart.class"
        >
          <Checkbox
            :model-value="multiSelected.includes(option.value)"
            binary
            :input-id="optionId(index)"
            :disabled="disabled"
            :part="optionInputPart.part"
            :class="optionInputPart.class"
            @update:model-value="(checked) => toggleOption(option.value, !!checked)"
          />
          <label
            :for="optionId(index)"
            :part="optionLabelPart.part"
            :class="optionLabelPart.class"
          >
            {{ option.label }}
            <span
              v-if="option.description"
              :part="optionDescriptionPart.part"
              :class="optionDescriptionPart.class"
            >{{ option.description }}</span>
          </label>
        </div>
        <div
          v-if="field.allow_other"
          :part="otherOptionPart.part"
          :class="otherOptionPart.class"
        >
          <Checkbox
            :model-value="multiOtherChecked"
            binary
            :input-id="otherControlId"
            :disabled="disabled"
            :part="optionInputPart.part"
            :class="optionInputPart.class"
            @update:model-value="(checked) => toggleOther(!!checked)"
          />
          <div
            :part="otherBodyPart.part"
            :class="otherBodyPart.class"
          >
            <label
              :id="otherLabelId"
              :for="otherControlId"
              :part="optionLabelPart.part"
              :class="optionLabelPart.class"
            >Other</label>
            <label
              :id="otherTextLabelId"
              :for="otherTextId"
              class="w-form__sr"
            >Other answer</label>
            <InputText
              :id="otherTextId"
              v-model="multiOtherText"
              :disabled="disabled || !multiOtherChecked"
              :part="otherInputPart.part"
              :class="otherInputPart.class"
              size="small"
              fluid
            />
          </div>
        </div>
      </template>
    </div>
  </FieldShell>
</template>
