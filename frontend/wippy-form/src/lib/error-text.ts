/**
 * The theme's severity utilities for error text: the same classes the fields
 * form (`ChoiceField.vue`, `ActiveForm.vue`) puts on its field and form errors,
 * so one meaning reads the same everywhere ("same semantics, same looks").
 *
 * The question card puts these on the text INSIDE a PrimeVue `Message` (field
 * error, submit-failure banner, form-level notice), not on the `Message` itself:
 * the `Message` keeps its own box, outline and `role="alert"`, and only the text
 * takes its colour from here. The `Message`'s own text colours fall below
 * WCAG 1.4.3's 4.5:1 for small text in at least one theme (the simple field
 * error: `danger-500` 3.6:1 light, `danger-600` 2.1:1 dark; the boxed form-level
 * notice: `danger-500` 3.1:1 dark; the retryable banner: `warn-600` 4.0:1
 * light, `warn-500` 3.9:1 dark). Computed from the theme tokens on the same
 * backgrounds, these give 5.2:1 (light, `danger-600`) and 6.4:1 to 7.9:1 (dark,
 * `danger-400`); the fields form's own error text measured 5.19:1 and 7.82:1
 * on the card in the re-check. Fixing the `Message` colours themselves is a
 * theme-level change, tracked separately.
 *
 * Kept as one literal string in a `.ts` file, which the Tailwind `content`
 * glob (`./src/**\/*.{vue,ts}`) scans, so both utilities are generated.
 */
export const ERROR_TEXT_CLASS = 'text-danger-600 dark:text-danger-400'
