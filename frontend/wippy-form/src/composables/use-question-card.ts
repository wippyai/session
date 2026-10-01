import type { ComputedRef, Ref } from 'vue'
import type { AnswerDisplayItem } from '../lib/answers'
import type { FieldAnswer, FormAnswers, FormDefinition, FormField, SingleFieldAnswer } from '../lib/definition'
import { computed, reactive, ref } from 'vue'
import { answerDisplayItems, buildNotedValue, trimAnswerText } from '../lib/answers'
import { answerHasOption, answerHasOther, answerNoteFor, answerOtherText } from '../lib/definition'

/** One question's in-progress answer while the card is active (not yet submitted). */
export interface QuestionAnswerState {
  chosen: string[]
  other: string
  useOther: boolean
  /** Option value -> note text, only for options currently chosen. */
  notes: Record<string, string>
  /** Option value whose note editor is open, or `null`. */
  noteOpen: string | null
  done: boolean
}

/** Where focus should move next — read by the view via `focusTarget`/`focusSeq`. */
export type FocusTarget = 'first' | 'card' | 'send-all' | 'other' | `opt-${number}` | `note-${string}` | `review-item-${number}`

export interface QuestionCardController {
  readonly n: number
  readonly multi: boolean
  index: Ref<number>
  collapsed: Ref<boolean>
  error: Ref<string>
  liveMessage: Ref<string>
  focusTarget: Ref<FocusTarget | null>
  focusSeq: Ref<number>
  answers: Record<string, QuestionAnswerState>
  inReview: ComputedRef<boolean>
  currentQuestion: ComputedRef<FormField | null>
  missingRequired: ComputedRef<Array<{ field: FormField, index: number }>>
  ans: (q: FormField) => QuestionAnswerState
  hasContent: (q: FormField) => boolean
  answered: (q: FormField) => boolean
  answerItemsFor: (q: FormField) => AnswerDisplayItem[] | null
  keysText: (q: FormField) => string
  activate: (q: FormField, i: number) => void
  toggleNote: (q: FormField, value: string, openOnly?: boolean) => void
  setNote: (q: FormField, value: string, text: string) => void
  sendNote: (q: FormField, value: string) => void
  sendOther: (q: FormField) => void
  commit: (q: FormField) => void
  go: (i: number, focus?: FocusTarget) => void
  submitAll: () => void
  requestFocus: (target: FocusTarget) => void
  /** Empties the polite live region — used when a send starts, so it does not keep announcing the step that was sent from. */
  quiet: () => void
  buildAnswers: () => FormAnswers
}

/** At most this many rows (options, then Other) get a number-key badge — see the design decision "Nine keys". */
export const MAX_KEYED_ROWS = 9

/**
 * Interaction state of the question card: the answer in progress for each
 * question, navigation (a single question submits at once, several advance to
 * the next unseen question and then to a review step), notes and Other. Focus
 * is not moved here. `focusTarget` names where it should go next and
 * `focusSeq` increments on every request, even a repeat, so the view's
 * watcher always fires and makes the `.focus()` call.
 *
 * `definition` and `initialData` are read once, when the card is created, so
 * an answer in progress survives a background reload of `state`.
 */
export function useQuestionCard(
  definition: FormDefinition,
  initialData: FormAnswers | null,
  onSubmit: (answers: FormAnswers) => void,
): QuestionCardController {
  const n = definition.fields.length
  const multi = n > 1
  // Questions already shown (answered or skipped) — once every question has
  // been seen, the next answer returns to the review step instead of
  // forwarding to a question already visited. Plain Set: nothing in the
  // template reads it, so it does not need to be reactive.
  const seen = new Set<number>([0])

  const index = ref(0)
  const collapsed = ref(false)
  const error = ref('')
  const liveMessage = ref('')
  const focusTarget = ref<FocusTarget | null>(null)
  const focusSeq = ref(0)

  const answers = reactive<Record<string, QuestionAnswerState>>(
    Object.fromEntries(definition.fields.map((field) => {
      const existing = initialData?.[field.id]
      const chosen = field.options.filter(o => answerHasOption(existing, o.value)).map(o => o.value)
      const notes: Record<string, string> = {}
      for (const value of chosen) {
        const note = answerNoteFor(existing, value)
        if (note)
          notes[value] = note
      }
      const useOther = answerHasOther(existing)
      const other = answerOtherText(existing)
      const done = chosen.length > 0 || (useOther && trimAnswerText(other) !== '')
      const state: QuestionAnswerState = { chosen, other, useOther, notes, noteOpen: null, done }
      return [field.id, state]
    })),
  )

  function ans(q: FormField): QuestionAnswerState {
    return answers[q.id]
  }

  function hasContent(q: FormField): boolean {
    const a = ans(q)
    return q.multiple
      ? (a.chosen.length > 0 || trimAnswerText(a.other) !== '')
      : (a.chosen.length > 0 || (a.useOther && trimAnswerText(a.other) !== ''))
  }

  function answered(q: FormField): boolean {
    return ans(q).done && hasContent(q)
  }

  const inReview = computed(() => multi && index.value === n)
  const currentQuestion = computed<FormField | null>(() => inReview.value ? null : (definition.fields[index.value] ?? null))
  const missingRequired = computed(() =>
    definition.fields
      .map((field, i) => ({ field, index: i }))
      .filter(({ field }) => field.required && !answered(field)),
  )

  // The polite region speaks by changing its text, so it is cleared first and
  // set a moment later. One pending timer at most: a newer message, or `quiet`,
  // replaces the one still waiting.
  let sayTimer: ReturnType<typeof setTimeout> | undefined

  function say(text: string) {
    clearTimeout(sayTimer)
    liveMessage.value = ''
    sayTimer = setTimeout(() => { liveMessage.value = text }, 30)
  }

  /** Empties the polite region (and drops a message still waiting to be spoken), so it never keeps describing a step the reader has left. */
  function quiet() {
    clearTimeout(sayTimer)
    liveMessage.value = ''
  }

  function requestFocus(target: FocusTarget) {
    focusTarget.value = target
    focusSeq.value++
  }

  /** Number of rows (options + Other, if any) that get a number-key badge. */
  function keyableCount(q: FormField): number {
    return Math.min(q.options.length + (q.allow_other ? 1 : 0), MAX_KEYED_ROWS)
  }

  function keysText(q: FormField): string {
    const keyable = keyableCount(q)
    const range = keyable > 1 ? `1–${keyable}` : '1'
    const noteKeyable = Math.min(q.options.length, MAX_KEYED_ROWS)
    const noteRange = noteKeyable > 1 ? `Shift+1–${noteKeyable}` : 'Shift+1'
    const move = multi ? ' ← and → change questions.' : ''
    return q.multiple
      ? `${range} ticks, ${noteRange} adds a note, Enter sends.${move}`
      : `${range} answers, ${noteRange} adds a note first.${move}`
  }

  function fieldAnswer(q: FormField): FieldAnswer | undefined {
    const a = ans(q)
    if (q.multiple) {
      const list: SingleFieldAnswer[] = q.options
        .filter(o => a.chosen.includes(o.value))
        .map(o => buildNotedValue(o.value, a.notes[o.value] ?? ''))
      const otherText = trimAnswerText(a.other)
      if (otherText)
        list.push({ other: otherText })
      return list.length > 0 ? list : undefined
    }
    if (a.useOther)
      return { other: trimAnswerText(a.other) }
    if (a.chosen[0])
      return buildNotedValue(a.chosen[0], a.notes[a.chosen[0]] ?? '')
    return undefined
  }

  function answerItemsFor(q: FormField): AnswerDisplayItem[] | null {
    if (!answered(q))
      return null
    return answerDisplayItems(q, fieldAnswer(q))
  }

  function buildAnswers(): FormAnswers {
    const out: FormAnswers = {}
    for (const q of definition.fields) {
      if (!answered(q))
        continue
      const value = fieldAnswer(q)
      if (value !== undefined)
        out[q.id] = value
    }
    return out
  }

  function go(i: number, focus: FocusTarget = 'first') {
    // A multi-choice question the user ticked (or typed an Other answer
    // into) but never explicitly sent still counts as answered once they
    // leave it — otherwise those ticks are silently dropped as "Skipped"
    // in the review step and the final submission alike.
    const leaving = currentQuestion.value
    if (leaving && leaving.multiple && !ans(leaving).done && hasContent(leaving))
      ans(leaving).done = true

    const last = multi ? n : n - 1
    index.value = Math.max(0, Math.min(i, last))
    error.value = ''
    if (!inReview.value)
      seen.add(index.value)
    if (inReview.value) {
      // "Send answers" is disabled while a required question is still
      // unanswered — focusing it then is a no-op (a disabled button can't
      // take focus), which silently dropped focus to <body>. Focus the
      // first missing item's row instead so it's reachable immediately.
      const firstMissing = missingRequired.value[0]
      requestFocus(firstMissing ? `review-item-${firstMissing.index}` : 'send-all')
    }
    else {
      requestFocus(focus)
    }
    say(inReview.value ? 'Review your answers' : `Question ${index.value + 1} of ${n}`)
  }

  function submitAll() {
    if (missingRequired.value.length > 0)
      return
    onSubmit(buildAnswers())
  }

  function commit(q: FormField) {
    ans(q).done = true
    error.value = ''
    if (!multi) {
      onSubmit(buildAnswers())
      return
    }
    // Forward to the next question not yet seen; once every question has
    // been seen (answered or skipped), an answer returns to the review.
    const next = definition.fields.findIndex((_field, i) => i > index.value && !seen.has(i))
    go(next === -1 ? n : next)
  }

  function activate(q: FormField, i: number) {
    const a = ans(q)
    if (i >= q.options.length) {
      requestFocus('other')
      return
    }
    const value = q.options[i].value
    // A note editor already open on THIS row, for a single-choice question,
    // would otherwise commit-and-advance immediately via the plain-`chosen`
    // branch below — eat the click/number and move focus into the note
    // instead, so the note-in-progress isn't abandoned mid-edit. Multi-choice
    // never auto-commits from `activate()` (only `commit()`/Enter do), so a
    // tick is always safe to apply even while that same row's note is open —
    // gating it here too silently dropped the tick (clicking the row, or its
    // checkbox, while its own note was open did nothing) until the next
    // question/Other commit fired and read a `chosen` that was never updated.
    if (a.noteOpen === value && !q.multiple) {
      requestFocus(`note-${value}`)
      return
    }
    if (q.multiple) {
      a.chosen = a.chosen.includes(value) ? a.chosen.filter(x => x !== value) : [...a.chosen, value]
      if (!hasContent(q))
        a.done = false
      error.value = ''
      requestFocus(`opt-${i}`)
      say(a.chosen.includes(value) ? 'Ticked' : 'Unticked')
      return
    }
    a.chosen = [value]
    a.useOther = false
    commit(q)
  }

  function toggleNote(q: FormField, value: string, openOnly = false) {
    const a = ans(q)
    const i = q.options.findIndex(o => o.value === value)
    if (a.noteOpen === value && !openOnly) {
      a.noteOpen = null
      requestFocus(`opt-${i}`)
    }
    else {
      a.noteOpen = value
      requestFocus(`note-${value}`)
    }
  }

  /** Live-updates a note's draft text as the user types — tracked per option value regardless of `chosen`. */
  function setNote(q: FormField, value: string, text: string) {
    ans(q).notes[value] = text
  }

  function sendNote(q: FormField, value: string) {
    const a = ans(q)
    a.noteOpen = null
    if (q.multiple) {
      if (!a.chosen.includes(value))
        a.chosen = [...a.chosen, value]
      requestFocus(`opt-${q.options.findIndex(o => o.value === value)}`)
      say('Note saved')
      return
    }
    a.chosen = [value]
    a.useOther = false
    // Sending a single-answer note sends the form, and the note editor closes
    // here and takes its focus with it. On a one-question card `commit` only
    // calls onSubmit, so nothing else would move focus and a rejected send
    // would leave it on <body>. Hand it to the row that owns the note first:
    // the same row closing the note by toggle or Escape returns to, and the
    // one a 422 field error focuses (it is the selected row). The row stays
    // in the DOM, and the error text is linked to it. A several-question
    // card's `commit` moves on to the next question or the review and makes
    // its own request after this one, which wins.
    requestFocus(`opt-${q.options.findIndex(o => o.value === value)}`)
    commit(q)
  }

  function sendOther(q: FormField) {
    const a = ans(q)
    const text = trimAnswerText(a.other)
    if (q.multiple) {
      if (!text && a.chosen.length === 0)
        return
    }
    else {
      if (!text)
        return
      a.useOther = true
      a.chosen = []
    }
    commit(q)
  }

  return {
    n,
    multi,
    index,
    collapsed,
    error,
    liveMessage,
    focusTarget,
    focusSeq,
    answers,
    inReview,
    currentQuestion,
    missingRequired,
    ans,
    hasContent,
    answered,
    answerItemsFor,
    keysText,
    activate,
    toggleNote,
    setNote,
    sendNote,
    sendOther,
    commit,
    go,
    submitAll,
    requestFocus,
    quiet,
    buildAnswers,
  }
}
