import type { ComputedRef, Ref } from 'vue'
import type { AnswerDisplayItem } from '../lib/answers'
import type { FieldAnswer, FormAnswers, FormDefinition, FormField, SingleFieldAnswer } from '../lib/definition'
import { computed, reactive, ref } from 'vue'
import { answerDisplayItems, buildNotedValue } from '../lib/answers'
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
  buildAnswers: () => FormAnswers
}

/** At most this many rows (options, then Other) get a number-key badge — see the design decision "Nine keys". */
export const MAX_KEYED_ROWS = 9

/**
 * Interactive state machine for the question card, mirroring the approved
 * prototype's `WippyForm` class (`.local/work/session-forms/design/
 * 2026-09-30-question-card-v2.html`) but as a Vue composable: reactive
 * per-question answer state, question navigation (single question ->
 * immediate submit; several questions -> advance to the next unseen
 * question, then a review step), notes, and Other. DOM focus movement is
 * NOT done here — `focusTarget`/`focusSeq` name the intent (`focusSeq`
 * increments on every request, even a repeat, so the view's watcher always
 * fires) and the view (which owns the actual elements) performs the
 * `.focus()` call.
 *
 * `definition` and `initialData` are read once, at creation — the same
 * "hydrate on mount, don't re-sync on background prop changes" contract
 * `ActiveForm.vue`'s own `reactive(draftFromAnswers(...))` already uses, so
 * an in-progress answer survives a background reload of `state`.
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
      const done = chosen.length > 0 || (useOther && other.trim() !== '')
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
      ? (a.chosen.length > 0 || a.other.trim() !== '')
      : (a.chosen.length > 0 || (a.useOther && a.other.trim() !== ''))
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

  function say(text: string) {
    liveMessage.value = ''
    setTimeout(() => { liveMessage.value = text }, 30)
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
      if (a.other.trim())
        list.push({ other: a.other.trim() })
      return list.length > 0 ? list : undefined
    }
    if (a.useOther)
      return { other: a.other.trim() }
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
    // A note editor already open on this answer eats the click/number —
    // focus moves into the note instead of committing.
    if (a.noteOpen === value) {
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
    commit(q)
  }

  function sendOther(q: FormField) {
    const a = ans(q)
    const text = a.other.trim()
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
    buildAnswers,
  }
}
