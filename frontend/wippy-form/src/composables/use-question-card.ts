import type { ComputedRef, Ref } from 'vue'
import type { AnswerDisplayItem, AnswerDraft } from '../lib/answers'
import type { ChoiceAnswer, ChoiceFormDefinition, ChoiceFormField, FieldAnswer, FormAnswers, NotedAnswer } from '../lib/definition'
import type { FocusTarget } from '../lib/focus-key'
import { computed, reactive, ref } from 'vue'
import { answerDisplayItems, draftFromAnswers, serializeAnswers, serializeFieldAnswer } from '../lib/answers'
import { trimAnswerText } from '../lib/text'
import { answerHasOption, answerHasOther, answerNoteFor, answerOtherText } from '../lib/definition'
import { noteKey, optionKey, reviewItemKey } from '../lib/focus-key'
import { TICK_ANSWER_MESSAGE } from '../lib/messages'

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
  currentQuestion: ComputedRef<ChoiceFormField | null>
  missingRequired: ComputedRef<Array<{ field: ChoiceFormField, index: number }>>
  ans: (q: ChoiceFormField) => QuestionAnswerState
  answerItemsFor: (q: ChoiceFormField) => AnswerDisplayItem[] | null
  keysText: (q: ChoiceFormField) => string
  activate: (q: ChoiceFormField, i: number) => void
  toggleNote: (q: ChoiceFormField, value: string, openOnly?: boolean) => void
  setNote: (q: ChoiceFormField, value: string, text: string) => void
  sendNote: (q: ChoiceFormField, value: string) => void
  /** Keeps the Other text as the user types. It also clears the "nothing to send" error that Enter on an empty box raised. */
  setOther: (q: ChoiceFormField, text: string) => void
  sendOther: (q: ChoiceFormField) => void
  commit: (q: ChoiceFormField) => void
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
 *
 * `lib/answers.ts` owns the draft and the wire answer. `QuestionAnswerState`
 * only adds what the card's interaction needs (open notes, notes on unticked
 * options, which questions are done): it starts from `draftFromAnswers`, and
 * `draftOf` gives it back as a draft for `serializeAnswers`.
 */
export function useQuestionCard(
  definition: ChoiceFormDefinition,
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

  const initialDraft = draftFromAnswers(definition, initialData)
  const answers = reactive<Record<string, QuestionAnswerState>>(
    Object.fromEntries(definition.fields.map((field) => {
      // A choice field's stored answer is always a choice answer.
      const existing = initialDraft[field.id] as ChoiceAnswer | undefined
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

  function ans(q: ChoiceFormField): QuestionAnswerState {
    return answers[q.id]
  }

  function hasContent(q: ChoiceFormField): boolean {
    const a = ans(q)
    return q.multiple
      ? (a.chosen.length > 0 || trimAnswerText(a.other) !== '')
      : (a.chosen.length > 0 || (a.useOther && trimAnswerText(a.other) !== ''))
  }

  function answered(q: ChoiceFormField): boolean {
    return ans(q).done && hasContent(q)
  }

  const inReview = computed(() => multi && index.value === n)
  const currentQuestion = computed<ChoiceFormField | null>(() => inReview.value ? null : (definition.fields[index.value] ?? null))
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

  function keysText(q: ChoiceFormField): string {
    const keyable = Math.min(q.options.length + (q.allow_other ? 1 : 0), MAX_KEYED_ROWS)
    const range = keyable > 1 ? `1–${keyable}` : '1'
    const noteKeyable = Math.min(q.options.length, MAX_KEYED_ROWS)
    const noteRange = noteKeyable > 1 ? `Shift+1–${noteKeyable}` : 'Shift+1'
    const move = multi ? ' ← and → change questions.' : ''
    return q.multiple
      ? `${range} ticks, ${noteRange} adds a note, Enter sends.${move}`
      : `${range} answers, ${noteRange} adds a note first.${move}`
  }

  /** The question's answer in progress as a draft. */
  function draftOf(q: ChoiceFormField): FieldAnswer | undefined {
    const a = ans(q)
    const noted = (value: string): NotedAnswer => ({ value, note: a.notes[value] ?? '' })
    if (q.multiple)
      return [...a.chosen.map(noted), { other: a.other }]
    if (a.useOther)
      return { other: a.other }
    return a.chosen[0] ? noted(a.chosen[0]) : undefined
  }

  function answerItemsFor(q: ChoiceFormField): AnswerDisplayItem[] | null {
    if (!answered(q))
      return null
    return answerDisplayItems(q, serializeFieldAnswer(q, draftOf(q)))
  }

  function buildAnswers(): FormAnswers {
    const draft: AnswerDraft = {}
    for (const q of definition.fields) {
      if (answered(q))
        draft[q.id] = draftOf(q)
    }
    return serializeAnswers(definition, draft)
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

  function commit(q: ChoiceFormField) {
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

  function activate(q: ChoiceFormField, i: number) {
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

  function toggleNote(q: ChoiceFormField, value: string, openOnly = false) {
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
  function setNote(q: ChoiceFormField, value: string, text: string) {
    ans(q).notes[value] = text
  }

  function sendNote(q: ChoiceFormField, value: string) {
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

  function setOther(q: ChoiceFormField, text: string) {
    ans(q).other = text
    error.value = ''
  }

  function sendOther(q: ChoiceFormField) {
    const a = ans(q)
    const text = trimAnswerText(a.other)
    // Nothing to send: say why, since the box and its send button give no other sign.
    if (q.multiple) {
      if (!text && a.chosen.length === 0) {
        error.value = TICK_ANSWER_MESSAGE
        return
      }
    }
    else {
      if (!text) {
        error.value = 'Type your answer, or choose another option.'
        return
      }
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
    setOther,
    sendOther,
    commit,
    go,
    submitAll,
    requestFocus,
    quiet,
    buildAnswers,
  }
}
