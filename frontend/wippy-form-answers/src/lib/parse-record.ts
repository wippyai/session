/**
 * Parses `<wippy-form-answers>`'s `record` attribute value — the raw
 * JSON answer record the Session server writes into a user's chat
 * message — into an object. Kept as a standalone pure function (rather
 * than inlined in the element's `record` getter) so it is trivially
 * unit-testable without instantiating the custom element. Source-agnostic
 * by design: it only ever sees the already-parsed attribute string
 * (`Element.getAttribute` returns HTML entities already decoded), not the
 * DOM.
 *
 * Returns `null` for empty/whitespace-only input, invalid JSON, or JSON
 * that does not parse to a plain object (an array, string, number,
 * boolean, or `null`) — the Session server always writes a JSON object
 * here. Never throws.
 */
export function parseFormAnswersRecord(text: string | null | undefined): Record<string, unknown> | null {
  const trimmed = text?.trim()
  if (!trimmed)
    return null

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  }
  catch {
    return null
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
    return null

  return parsed as Record<string, unknown>
}
