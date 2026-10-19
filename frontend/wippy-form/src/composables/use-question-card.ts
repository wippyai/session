import type { ComputedRef, Ref } from 'vue'
import type { AnswerDisplayItem } from '../lib/answers'
import type { FieldAnswer, FormAnswers, FormDefinition, FormField, SingleFieldAnswer } from '../lib/definition'
import type { FocusTarget } from '../lib/focus-key'
import { computed, reactive, ref } from 'vue'
import { answerDisplayItems, buildNotedValue, trimAnswerText } from '../lib/answers'
import { answerHasOption, answerHasOther, answerNoteFor, answerOtherText } from '../lib/definition'
import { noteKey, optionKey, reviewItemKey } from '../lib/focus-key'

/** One question's answer in progress, before it is submitted. */
export interface QuestionAnswerState {
  chosen: string[]
  other: string
  useOther: boolean
  /** Option value to note text, for options currently chosen. */
  notes: Record<string, string>
  /** The option value whose note editor is open, or `null`. */
  noteOpen: string | null
  done: boolean
}

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
  /** Empties the polite live region, so it does not keep announcing the step a send started from. */
  quiet: () => void
  buildAnswers: () => FormAnswers
}

/** The first this many rows (options, then Other) get a number key. */
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
  // Questions already shown, answered or skipped. Once all have been seen, an
  // answer returns to the review step. Nothing in a template reads it.
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
  // set a moment later. At most one message waits, and a newer one or `quiet`
  // replaces it.
  let sayTimer: ReturnType<typeof setTimeout> | undefined

  function say(text: string) {
    clearTimeout(sayTimer)
    liveMessage.value = ''
    sayTimer = setTimeout(() => { liveMessage.value = text }, 30)
  }

  function quiet() {
    clearTimeout(sayTimer)
    liveMessage.value = ''
  }

  function requestFocus(target: FocusTarget) {
    focusTarget.value = target
    focusSeq.value++
  }

  function keysText(q: FormField): string {
    const keyable = Math.min(q.options.length + (q.allow_other ? 1 : 0), MAX_KEYED_ROWS)
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
    // A several-answer question that was ticked or typed into but never sent
    // still counts as answered once the user leaves it, instead of showing as
    // skipped in the review and the submission.
    const leaving = currentQuestion.value
    if (leaving && leaving.multiple && !ans(leaving).done && hasContent(leaving))
      ans(leaving).done = true

    const last = multi ? n : n - 1
    index.value = Math.max(0, Math.min(i, last))
    error.value = ''
    if (!inReview.value)
      seen.add(index.value)
    if (inReview.value) {
      // "Send answers" is disabled while a required answer is missing and a
      // disabled button cannot take focus, so focus goes to the first missing
      // row instead of falling to <body>.
      const firstMissing = missingRequired.value[0]
      requestFocus(firstMissing ? reviewItemKey(firstMissing.index) : 'send-all')
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
    // Forward to the next question not yet seen. Once all have been seen, the review follows.
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
    // With this row's note editor open on a single-answer question, a click or
    // number key moves focus into the note instead of answering, so the note is
    // not abandoned mid-edit. A tick on a several-answer question always applies.
    if (a.noteOpen === value && !q.multiple) {
      requestFocus(noteKey(value))
      return
    }
    if (q.multiple) {
      a.chosen = a.chosen.includes(value) ? a.chosen.filter(x => x !== value) : [...a.chosen, value]
      if (!hasContent(q))
        a.done = false
      error.value = ''
      requestFocus(optionKey(i))
      say(a.chosen.includes(value) ? 'Ticked' : 'Unticked')
      return
    }
    a.chosen = [value]
    a.useOther = false
    commit(q)
  }

  function toggleNote(q: FormField, value: string, openOnly = false) {
    const a = ans(q)
    if (a.noteOpen === value && !openOnly) {
      a.noteOpen = null
      requestFocus(optionKey(q.options.findIndex(o => o.value === value)))
    }
    else {
      a.noteOpen = value
      requestFocus(noteKey(value))
    }
  }

  /** Keeps the note text as the user types, for any option, chosen or not. */
  function setNote(q: FormField, value: string, text: string) {
    ans(q).notes[value] = text
  }

  function sendNote(q: FormField, value: string) {
    const a = ans(q)
    a.noteOpen = null
    const rowKey = optionKey(q.options.findIndex(o => o.value === value))
    if (q.multiple) {
      if (!a.chosen.includes(value))
        a.chosen = [...a.chosen, value]
      requestFocus(rowKey)
      say('Note saved')
      return
    }
    a.chosen = [value]
    a.useOther = false
    // A single-answer note sends the form, and its editor closes and takes focus
    // with it. Focus first returns to the row that owns the note, where a
    // rejected send or a 422 field error also lands. A card with several
    // questions makes its own focus request after this one, which wins.
    requestFocus(rowKey)
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
