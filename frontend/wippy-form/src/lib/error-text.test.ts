import type { Mode, Rgb } from '../test-support/contrast'
import messageCss from '@wippy-fe/theme/primevue/message.css?raw'
import { describe, expect, it } from 'vitest'
import { contrast, mix, resolveColor } from '../test-support/contrast'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from './error-text'

/**
 * The severity text classes are at least 4.5:1 against the card background and
 * against the PrimeVue `Message` box tinted over it, in light and dark. The
 * colours come from the theme's tokens and message.css, so a theme change that
 * breaks the contrast fails here.
 */

const MIN_CONTRAST = 4.5

/** `text-warn-700` is the colour of `--p-warn-700`, and a `dark:` class applies in dark mode. */
function textColor(utility: string): { color: Rgb, mode: Mode } {
  const match = /^(dark:)?text-(\w+)-(\d+)$/.exec(utility)
  if (!match)
    throw new Error(`not a severity text utility: ${utility}`)
  const mode: Mode = match[1] ? 'dark' : 'light'
  return { color: resolveColor(`var(--p-${match[2]}-${match[3]})`, mode), mode }
}

/** The body of one `.p-message-*` rule in the theme's message.css. */
function messageRule(selector: string): string {
  const match = new RegExp(`${selector.replaceAll('.', '\\.')}\\s*\\{([^}]*)\\}`).exec(messageCss)
  if (!match)
    throw new Error(`message.css has no rule ${selector}`)
  return match[1]
}

/** The colour of the `Message` box over the card, from the theme's `bg-<family>-<step>/<alpha>` utility. */
function boxColor(messageClass: string, family: string, mode: Mode, card: Rgb): Rgb {
  const body = messageRule(`.p-message-${messageClass}`)
  const utility = mode === 'dark'
    ? new RegExp(`dark:bg-${family}-(\\d+)/(\\d+)`).exec(body)
    : new RegExp(`(?<![:\\w-])bg-${family}-(\\d+)/(\\d+)`).exec(body)
  if (!utility)
    throw new Error(`no ${mode} box in .p-message-${messageClass}`)
  return mix(resolveColor(`var(--p-${family}-${utility[1]})`, mode), card, Number(utility[2]) / 100)
}

const SEVERITIES = [
  { label: 'ERROR_TEXT_CLASS', classes: ERROR_TEXT_CLASS, messageClass: 'error', family: 'danger' },
  { label: 'WARN_TEXT_CLASS', classes: WARN_TEXT_CLASS, messageClass: 'warn', family: 'warn' },
]

describe.each(SEVERITIES)('$label ($classes)', ({ classes, messageClass, family }) => {
  it('is one light step and one dark step of its own severity family', () => {
    expect(classes).toMatch(new RegExp(`^text-${family}-\\d+ dark:text-${family}-\\d+$`))
  })

  it.each(['light', 'dark'] as const)('is at least 4.5:1 in %s on the card and on the Message box', (mode) => {
    const utility = classes.split(' ').map(textColor).find(t => t.mode === mode)
    if (!utility)
      throw new Error(`no ${mode} step in ${classes}`)
    const card = resolveColor('var(--p-content-background)', mode)
    expect(contrast(utility.color, card), `${classes} on the ${mode} card`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    expect(contrast(utility.color, boxColor(messageClass, family, mode, card)), `${classes} on the ${mode} Message box`).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})
