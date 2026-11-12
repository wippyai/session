import type { FormDefinition, FormField, FormState, SubmitAccepted } from '../lib/definition'

/** A single-answer choice question with two options, unrequired and without Other. */
export function choiceField(overrides: Partial<FormField> = {}): FormField {
  return {
    id: 'f1',
    type: 'choice',
    label: 'Pick one',
    required: false,
    options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }],
    multiple: false,
    allow_other: false,
    ...overrides,
  }
}

export function definitionOf(...fields: FormField[]): FormDefinition {
  return { title: 'Question', fields }
}

/** An open form with one question. Pass `status: 'idle'` and `data` for an answered one. */
export function formState(overrides: Partial<FormState> = {}): FormState {
  return {
    form_version: 1,
    artifact_id: 'artifact-1',
    session_id: 'session-1',
    status: 'active',
    stale: false,
    late: false,
    content_version: 1,
    definition: definitionOf(choiceField()),
    data: null,
    submitted_at: null,
    answer_message_id: null,
    delivery: null,
    ...overrides,
  }
}

/** The 200 response of an accepted submit. */
export function acceptedResponse(overrides: Partial<SubmitAccepted> = {}): SubmitAccepted {
  return {
    success: true,
    artifact_id: 'artifact-1',
    request_id: 'req-1',
    answer_message_id: 'msg-1',
    content_version: 2,
    status: 'idle',
    late: false,
    delivery: 'pending',
    replayed: false,
    ...overrides,
  }
}
