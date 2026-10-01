export type MessageSeverity = 'error' | 'warn' | 'secondary'

/** Error text. Each constant is one literal string so Tailwind generates both utilities of the pair. */
export const ERROR_TEXT_CLASS = 'text-danger-600 dark:text-danger-400'
/** Warning text, for a message whose meaning is a warning. */
export const WARN_TEXT_CLASS = 'text-warn-700 dark:text-warn-400'

/** The text class for a PrimeVue `Message` of this severity. A secondary message keeps the theme colour. */
export function textClassFor(severity: MessageSeverity): string | undefined {
  if (severity === 'error')
    return ERROR_TEXT_CLASS
  return severity === 'warn' ? WARN_TEXT_CLASS : undefined
}
