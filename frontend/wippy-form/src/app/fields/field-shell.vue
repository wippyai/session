<script setup lang="ts">
import type { FieldAnswer, FieldError, FormField } from '../../lib/definition'
import { computed, ref, useId } from 'vue'
import { readOnlyAnswer } from '../../lib/answers'
import { partClass } from '../../lib/part-class'
import { textLines } from '../../lib/rich-text'
import FieldLabel from './field-label.vue'

/**
 * The one shell every field renders in, whatever its type: label (with the
 * required marker), description, the control, the error list and, once the
 * form is answered, the read-only value. It owns the ids that tie them
 * together, so a control only has to bind what the slot hands it:
 *
 *  - `group` — a `<fieldset>` with a `<legend>`, for a field made of several
 *    controls (a choice's radios or checkboxes). The fieldset is described.
 *  - `stacked` — a `<label>` above a single control (text, textarea, email,
 *    number, date). The label points at the control, and the control carries
 *    `aria-describedby` for the description and the errors.
 *  - `inline` — the control first and its clickable `<label>` beside it (a
 *    checkbox).
 *
 * Errors are linked by `aria-describedby`, not announced by a live region of
 * their own: the form has one polite status region for the error summary and
 * moves focus to the first invalid control, which reads its description.
 *
 * Styling API: the field is the `field` part with `field-<state>` parts
 * (`required`, `invalid`, `readonly`, `disabled`, `group`, `inline`), and
 * the `w-form__field*` classes carry the same names. See the README.
 */
const props = defineProps<{
  field: FormField
  /** The answer, shown when `readonly`. The editing controls bind their own value through the slot's control. */
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  /** Read-only, submitted display — no control, just the accepted value as text. */
  readonly: boolean
  layout: 'group' | 'stacked' | 'inline'
}>()

defineSlots<{
  default?: (props: { id: string, describedBy: string | undefined, invalid: boolean }) => unknown
}>()

const baseId = useId()
const controlId = `${baseId}-control`
const descriptionId = `${baseId}-desc`
const errorId = `${baseId}-err`

const rootEl = ref<HTMLElement | null>(null)

const hasErrors = computed(() => !props.readonly && props.errors.length > 0)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.field.description)
    ids.push(descriptionId)
  if (hasErrors.value)
    ids.push(errorId)
  return ids.length > 0 ? ids.join(' ') : undefined
})

const rootTag = computed(() => props.layout === 'group' ? 'fieldset' : 'div')
const labelTag = computed(() => {
  if (props.layout === 'group')
    return 'legend'
  return props.readonly ? 'span' : 'label'
})
const inlineEditable = computed(() => props.layout === 'inline' && !props.readonly)

const rootPart = computed(() => partClass(
  'field',
  props.layout !== 'stacked' && props.layout,
  !!props.field.required && 'required',
  hasErrors.value && 'invalid',
  props.readonly && 'readonly',
  props.disabled && 'disabled',
))
const descriptionPart = computed(() => partClass('field-description'))
const controlPart = computed(() => partClass('field-control'))
const errorPart = computed(() => partClass('field-error'))
const showMarker = computed(() => !!props.field.required && !props.readonly)

const value = computed(() => readOnlyAnswer(props.field, props.modelValue))
const valuePart = computed(() => partClass('field-value', value.value.kind === 'empty' && 'empty'))
const notePart = computed(() => partClass('field-note'))

defineExpose({
  /** Focuses the first focusable control, e.g. the first invalid field after a failed submit. */
  focusFirstControl() {
    rootEl.value?.querySelector<HTMLElement>('input, textarea')?.focus()
  },
})
</script>

<template>
  <component
    :is="rootTag"
    ref="rootEl"
    :part="rootPart.part"
    :class="rootPart.class"
    :aria-describedby="layout === 'group' ? describedBy : undefined"
  >
    <div
      v-if="inlineEditable"
      class="w-form__field-row"
    >
      <div
        :part="controlPart.part"
        :class="controlPart.class"
      >
        <slot
          :id="controlId"
          :described-by="describedBy"
          :invalid="hasErrors"
        />
      </div>
      <FieldLabel
        tag="label"
        :control-id="controlId"
        :label="field.label"
        :required="showMarker"
      />
    </div>
    <FieldLabel
      v-else
      :tag="labelTag"
      :control-id="controlId"
      :label="field.label"
      :required="showMarker"
    />

    <p
      v-if="field.description"
      :id="descriptionId"
      :part="descriptionPart.part"
      :class="descriptionPart.class"
    >
      {{ field.description }}
    </p>

    <template v-if="readonly">
      <p
        v-if="value.kind === 'empty'"
        :part="valuePart.part"
        :class="valuePart.class"
      >
        Skipped
      </p>
      <p
        v-else-if="value.kind === 'text'"
        :part="valuePart.part"
        :class="valuePart.class"
      >
        <!--
          Free text is split on line breaks and joined back with real <br>s —
          never a `\n` left in one text node, so a line break shows without
          relying on a CSS `white-space` rule, and never HTML parsed from the
          user's own text.
        -->
        <!-- eslint-disable vue/multiline-html-element-content-newline, vue/singleline-html-element-content-newline -->
        <template
          v-for="(line, i) in textLines(value.text)"
          :key="i"
        ><br v-if="i > 0">{{ line }}</template>
        <!-- eslint-enable vue/multiline-html-element-content-newline, vue/singleline-html-element-content-newline -->
      </p>
      <div
        v-else
        :part="valuePart.part"
        :class="valuePart.class"
      >
        <p
          v-for="(item, i) in value.items"
          :key="i"
          class="w-form__field-item"
        >
          {{ item.own ? `Other: ${item.label}` : item.label }}
          <span
            v-if="item.note"
            :part="notePart.part"
            :class="notePart.class"
          >{{ item.note }}</span>
        </p>
      </div>
    </template>

    <div
      v-else-if="!inlineEditable"
      :part="controlPart.part"
      :class="controlPart.class"
    >
      <slot
        :id="controlId"
        :described-by="describedBy"
        :invalid="hasErrors"
      />
    </div>

    <ul
      v-if="hasErrors"
      :id="errorId"
      :part="errorPart.part"
      :class="`${errorPart.class} text-danger-600 dark:text-danger-400`"
    >
      <li
        v-for="(err, i) in errors"
        :key="i"
      >
        {{ err.message }}
      </li>
    </ul>
  </component>
</template>
