/**
 * The theme's severity utilities for message text, one constant per severity,
 * so one meaning reads the same everywhere ("same semantics, same looks"):
 *
 * - `ERROR_TEXT_CLASS` is what the fields form (`ChoiceField.vue`,
 *   `ActiveForm.vue`) puts on its field and form errors.
 * - `WARN_TEXT_CLASS` is the same pattern on the warning scale, for a message
 *   whose meaning is a warning (a retryable failure, an unsupported version).
 *
 * They go on the text, not on a PrimeVue `Message`'s root: the `Message` keeps
 * its own box, outline and `role="alert"`, and only the text takes its colour
 * from here. The `Message`'s own text colours fall below WCAG 1.4.3's 4.5:1 for
 * small text in at least one theme (the simple field error: `danger-500` 3.6:1
 * light, `danger-600` 2.1:1 dark; the boxed form-level notice: `danger-500`
 * 3.1:1 dark; the warn banner: `warn-600` 4.0:1 light, `warn-500` 3.9:1 dark).
 * Computed from the theme tokens on the same backgrounds (the light card
 * rgb(251,247,255) and the dark card rgb(54,41,63), each with the `Message`
 * box tint over it), the steps below give:
 *
 * - `danger-600` light 5.2:1 and `danger-400` dark 6.8 to 7.9:1 (the fields
 *   form's own error text measured 5.19:1 and 7.82:1 on the card in the
 *   EE2-2461 re-check);
 * - `warn-700` light 5.0:1 and `warn-400` dark 7.2 to 9.0:1 on the warn box and
 *   the card. The light step is one darker than the error one because
 *   `warn-600` is only 4.0:1 on the warn box.
 *
 * Fixing the `Message` colours themselves is a theme-level change, tracked
 * separately.
 *
 * Each is kept as one literal string in a `.ts` file, which the Tailwind
 * `content` glob (`./src/**\/*.{vue,ts}`) scans, so both utilities of each pair
 * are generated.
 */
export const ERROR_TEXT_CLASS = 'text-danger-600 dark:text-danger-400'
export const WARN_TEXT_CLASS = 'text-warn-700 dark:text-warn-400'
