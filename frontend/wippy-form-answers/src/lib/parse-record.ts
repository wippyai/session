/** Parses the `record` attribute into an object. It returns `null` for empty input, invalid JSON, or JSON that is not a plain object, and never throws. */
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
