# Call details protocol (wire contract)

This contract defines the target behavior for Session, wippy/llm and clients,
including the Wippy Web Host and headless clients. It is a build contract,
not a claim that the released Session 0.7.3 already implements these fields.
Check `call_details: 1` before using details. JSON fixtures are in
[`test/details/fixtures/`](../test/details/fixtures/).

Phase 1 (P1) adds tool parts, filtered history, metadata allow lists, stamps,
capabilities and revision invalidation. Phase 2 (P2) adds thinking and stream
settings. Phase 3 (P3) adds the viewer check and history-read audit.
Tables mark the phase that adds each field. "Existing" means the field
already exists; its filtering rules take effect in P1.

Fixture `_case` is a test-only string describing the case and its setup.
Remove it before comparing with a wire response. It is never sent by Session.
Each row fixture is one member of a history response's `messages` array.
Event fixtures are complete event payloads. Capabilities and session-read
fixtures include their REST envelope. Nulls required below must be explicit;
optional existing fields can be absent. Clients ignore unknown future fields.

## 1. Settings

Set these once on the Session dependency. The Host reads them from
`GET /api/v1/sessions/capabilities` (also called `/sessions/capabilities`).
There is no corresponding facade setting.

| Requirement name | Environment variable | Values | Default | Phase |
| --- | --- | --- | --- | --- |
| `session_show_tool_details` | `SESSION_SHOW_TOOL_DETAILS` | `none`, `summary`, `full` | `none` | P1 |
| `session_show_thinking` | `SESSION_SHOW_THINKING` | `none`, `summary`, `full` | `none` | P2 |
| `session_thinking_stream` | `SESSION_THINKING_STREAM` | `live`, `after_step` | `live` | P2 |
| `details_viewer_check` | `SESSION_DETAILS_VIEWER_CHECK` | `true`, `false` | `false` | P3 |

For either visibility switch, boolean `true` and the environment string
`"true"` read as `full`. Boolean `false` and `"false"` read as `none`.
An absent, empty or invalid visibility value reads as `none`; invalid
values log a warning. Values are case sensitive. Unset tool visibility
means `none` for arguments, result, error and timing, including decided
approval rows. Pending approval previews have the exception in section 6.

Follow the existing `tool_approval_enforcement` registration pattern.
For each row of the table, declare `wippy.session.env:<name>` as an
`env.variable`, set `variable` to the environment variable above, and
set `meta.private: true`. Declare `wippy.session:<name>` as an
`ns.requirement`, with its quoted default and a target
`{entry: wippy.session.env:<name>, path: ".default"}`.
Add `{entry: wippy.session.env:<name>, path: ".storage"}` to the existing
`env_storage` requirement's targets. For example, the P1 requirement is:

```yaml
- name: session_show_tool_details
  kind: ns.requirement
  meta:
    description: "Tool detail visibility: none, summary or full"
  targets:
    - entry: wippy.session.env:session_show_tool_details
      path: ".default"
  default: "none"
```

These are registration instructions, not changes to the registry in this task.
Invalid stream mode uses `after_step` with a warning. An invalid viewer-check
value enables the check with a warning, so it cannot silently disable it.

## 2. Parts, levels and availability

| Part | Row | Phase |
| --- | --- | --- |
| `arguments`, `result`, `error`, `timing` | `function` or `delegation` | P1 |
| `thinking` | `assistant` | P2 |

Levels are ordered `none < summary < full`. At `none` there is no content.
At `summary`, arguments and results have a server-built line from masked
values. Errors have the fixed text `The tool failed`. Thinking has only
a label and duration. Timing at `summary` or `full` allows duration.
At `full`, a part has its masked value and a bounded preview.

| Availability | Meaning |
| --- | --- |
| `available` | A value was captured and the level permits content. A captured JSON null or empty value counts as captured. |
| `restricted` | A value exists, but the effective level is `none`. |
| `provider_withheld` | The provider supplied redacted, encrypted or omitted reasoning instead of readable text. P2 only. |
| `not_captured` | No value was stored for the part. |
| `pending` | The call is running and the result, error or final duration is not yet known. |

Availability describes capture independently of permission. A missing part
stays `not_captured` at every level; it does not become `restricted`.
For thinking without text, `provider_withheld` takes precedence when that
provider fact is known. While a call runs, its result, error and timing are
`pending` even if their level is `none`.
For a completed success, error is `not_captured`. For a completed failure,
result is `not_captured`, because the stored failure value belongs to error.

## 3. Layers and the version 1 stamp

Apply layers in order. An omitted part in a layer places no limit.
The app default is always a limit.

| Layer | Input | Phase |
| --- | --- | --- |
| App | The visibility switches in section 1 | P1 tools, P2 thinking |
| Agent | `wippy.session.traits:call_details` trait context, part levels with optional per-tool overrides | P1 tools, P2 thinking |
| Tool | `meta.display.arguments/result/error/timing` and sensitive paths | P1 |
| Session | `config.call_details`, keyed by part | P1 tools, P2 thinking |
| Viewer | A denial lowers the part to `none` | P3 |
| Host | Browser preferences, and P2 `data-thinking-permission`, can hide more locally | P1 tools, P2 thinking |

The lowest level wins. Only trusted app code or the owner through an
authenticated command can change session configuration. Model output never
raises a level. An invalid agent trait hides every part for that agent and
logs a warning. An unknown tool display level reads as `none`.

When writing a row, store the lowest app, agent, tool and session level.
When reading, take the lowest of the saved level and all current layers,
including the current agent limit. Union saved masks with current masks.
Relaxing a setting or removing a sensitive mark never reveals old content.
Host preferences do not change the stored stamp.

The internal call-row stamp is `metadata.details` (P1):

```json
{
  "v": 1,
  "arguments": "full",
  "result": "summary",
  "error": "none",
  "timing": "summary",
  "masks": {
    "arguments": ["/customer/email"],
    "result": ["/token"]
  },
  "policy_revision": 1
}
```

The internal assistant-row stamp is `metadata.details` (P2):

```json
{"v": 1, "thinking": "full", "policy_revision": 1}
```

| Stamp field | Meaning | Phase |
| --- | --- | --- |
| `v` | Integer `1`, the stamp format version | P1, P2 on assistants |
| `arguments`, `result`, `error`, `timing` | Saved tool part levels | P1 |
| `masks.arguments`, `masks.result` | Arrays of concrete JSON Pointers captured at write time | P1 |
| `thinking` | Saved thinking level | P2 |
| `policy_revision` | Positive integer identifying the writer's visibility-policy snapshot; distinct from `details_revision` | P1 |

Stamps are storage-only. REST and events expose effective descriptors, never
the stamp or its `policy_revision`. Unknown stamp versions and malformed
stamps read as `none`. A row without a stamp reads as `none`.
An optional trusted app migration can compute legacy levels from stored
`agent_id` and `registry_id`; there is no browser opt-in and no new
public setting for that migration. Capture still determines availability.

## 4. Masks and safe values

Argument masks come from input-schema properties marked `writeOnly: true`
and from `meta.display.sensitive.arguments`. Result masks come from
`meta.display.sensitive.result`. Meta lists use JSON Pointers, with `~0`
for a tilde and `~1` for a slash. The empty pointer masks the entire value.
Array paths use zero-based indices. Schema array items are expanded to
concrete paths for the captured value. A missing target is ignored.
An invalid mask definition hides the affected part and logs a warning.

Replace a marked value, of any type, with `[hidden: sensitive]`.
Keep its key. Never return the original length, hash, prefix or suffix.
Mask before building summaries, previews, approval display or full values.
The union of saved and current paths applies to every copy of the value.
The result mask list also applies to a structured failure stored in
`metadata.result`, but error visibility still controls that failure.
There is no secret-name or pattern detector in version 1. A scalar error
containing a secret must be hidden or masked at the root.

Storage and provider replay retain full original values. Signatures,
encrypted or redacted reasoning payloads, provider metadata and internal
checkpoints never reach clients. A model can still repeat a hidden value
in its visible answer. Titles retain their existing checkpoint input (D12).
The pending approval `intent_digest` remains a plain SHA-256 of the frozen
call including arguments (D7); it is an explicit exception to the rule
against exposing a sensitive value's hash and can disclose short values
through guessing. No new digest of a masked field is added.

## 5. REST history projection

Use the existing history endpoint. No separate details endpoint is added.
Every history response carries a P1 `details_revision` integer, and every
projected row carries the same revision. Apply the projection to every row
read path, including `latest_message` in a session read.
All detail responses, including session reads and capabilities, have
`Cache-Control: no-store`.

### 5.1 Row fields and descriptor

| Field | Type and meaning | Phase |
| --- | --- | --- |
| `message_id`, `session_id` | Existing row and session identifiers | Existing |
| `type` | Existing `function`, `delegation` or `assistant` | Existing |
| `date` | Existing stored RFC 3339 timestamp | Existing |
| `data` | Call arguments as masked JSON text at full, otherwise JSON null. Assistant visible answer text is unchanged. | Existing, filtered P1 |
| `metadata` | Only the allow-listed public fields below | Existing, filtered P1 |
| `details` | Part names mapped to descriptors | P1, P2 thinking |
| `details_revision` | Nonnegative integer for the response's visibility configuration | P1 |

Call rows always have all four tool descriptors. Assistant rows have
`details.thinking` from P2. A part descriptor always includes:

| Field | Type and meaning | Phase |
| --- | --- | --- |
| `level` | `none`, `summary` or `full` | P1, P2 thinking |
| `availability` | One value from section 2 | P1, P2 thinking |
| `summary` | Server-built string, or null when content is unavailable or hidden | P1, P2 thinking |
| `preview` | Object `{value, cut, numbers}`, or null below full or when unavailable | P1, P2 thinking |
| `preview.value` | Masked JSON value, thinking text, or duration number, bounded as below; may itself be JSON null | P1, P2 thinking |
| `preview.cut` | JSON Pointer array identifying shortened or replaced values in `preview.value` | P1, P2 thinking |
| `preview.numbers` | JSON Pointer array identifying exact numbers represented as strings in the preview | P1, P2 thinking |
| `has_full` | True only when full content is captured and allowed; true even for a complete uncut preview or a captured JSON null | P1, P2 thinking |
| `masked_paths` | Sorted, unique concrete paths masked in this part; empty when hidden, unavailable or no paths matched | P1, P2 thinking |
| `text` | Full masked thinking text, only at full with readable text. No size truncation. Absent otherwise. | P2, thinking only |

At summary, only `summary` and permitted mask paths carry content.
At none, `summary` and `preview` are null, `has_full` is false and
`masked_paths` is empty. Non-available parts have the same empty content
fields at every level. Captured JSON null is different: at full it has
`availability: available`, `preview: {value: null, cut: [], numbers: []}`
and `has_full: true`.

### 5.2 Preview limits and summaries

`preview.value` uses the shared approval preview rules from
[tool approval protocol, section 4](tool-approval-protocol.md#4-the-tool_approval-event).
Its JSON encoding is at most 8192 UTF-8 bytes, with maximum container depth 6.
The `cut` and `numbers` arrays are descriptors outside that value budget.
Strings above 1024 escaped bytes end with `… [cut, <size>]`.
A container beyond depth 6 becomes `[cut, <size>]`. Remaining members that
cannot fit become one final `[cut, <n> more, <size>]` array item or object
member with key `…` (repeat the ellipsis if the key exists).
Keys longer than 128 characters end with `…`. These cuts are in `cut`.
A size is the original JSON byte count formatted as `512 B`, `1.4 KB`
or `2.0 MB`; binary markers use decoded byte counts.

Base64 and hex runs of at least 128 characters and data URLs use
`[binary, <size>]`, with the same path recorded in `cut`.
Use the existing approval path exclusions and data URL boundaries.
Integers outside the JavaScript safe range become exact decimal strings
in the preview, with their paths in `numbers`. Already rounded runtime
floats use the existing 17-digit representation. Full REST values preserve
their existing JSON types; clients needing exact digits must parse JSON
numbers without rounding.

Escape control, invisible and bidirectional characters as visible text using
the approval preview's Unicode 15.1 set. Render every value, including
`<img>`, `<script>` and `<artifact>`, as text, never HTML.
Masking happens before binary detection, size calculation and cutting, so
markers cannot disclose a masked value's size.

Argument and object-result summaries use sorted keys, quoted keys and string
values, about 80 characters, and ` +<n> more` for omitted keys.
Objects inside a summary use `{<n> keys}`; arrays use `[<n> items]`.
Scalar results use their escaped JSON representation.
The fixtures fix representative summary strings. A complete preview may
still have `has_full: true`; "View all" is needed when `cut` is nonempty.
Full call values stay in `data` and `metadata.result` without preview
truncation. Full thinking stays in `details.thinking.text`.

### 5.3 Status, outcome, timing and value locations

| Field | Rule | Phase |
| --- | --- | --- |
| `metadata.status` | `pending`, `success`, `error`; stored `cancelled` projects as `error` for compatibility | Existing |
| `metadata.outcome` | Null for ordinary success/error/pending, otherwise one of the four values below | Existing, expanded P1 |
| `metadata.duration_ms` | Nonnegative integer at timing summary/full when execution duration is captured, otherwise null | P1 |
| `metadata.result` | Native masked JSON success value at result full; masked failure value at error full; null in every other case | Existing, filtered P1 |

`cancelled` means stopped. `not_approved` means the call was not run due to
approval. `invalid_arguments` means arguments failed validation or decoding
before dispatch. `unknown` means recovery could not establish an outcome.
A disconnection alone never creates `unknown`. These outcomes use projected
status `error`; clients choose labels from status and outcome, without
reading failure text.

A successful empty string is stored and returned as `""`; a successful
JSON null is returned as null but has an available descriptor. A missing
result also returns null but has `availability: not_captured`.
A running row returns null with `availability: pending`. Empty arrays and
objects remain available values. Invalid argument text that cannot be
decoded is not echoed as arguments; its arguments part is `not_captured`.
Its failure explanation still follows the error level.

When status is success, `metadata.result` belongs only to the result part.
For a terminal failure it belongs only to error. At error summary, the error
descriptor has `The tool failed`, but `metadata.result` stays null.
In particular, `result: full` with `error: none` returns no error text
through result, error, metadata or an approval display.

Duration measures dispatch to result/error receipt. Approval waiting time
is excluded. No dispatch means no execution duration, not a fabricated zero.
Timing summary/full exposes `Ran for <seconds> s` and the numeric
`duration_ms`; full also exposes that number in `preview.value`.
Format seconds to one decimal, remove a trailing `.0`, and use a period
as decimal separator.

### 5.4 Metadata allow list and private rows

Build a fresh metadata object. Do not spread stored metadata. The allow list
applies to call rows (`function`, `delegation`) and assistant rows only.
Every other row type (user, system, artifact, form and the rest) keeps its
metadata unchanged in P1, because clients read fields there today (for
example `context_attachments`, `input`, `session_form`, `file_uuids`,
`system_action`, `to_model`, `to_agent`, `from_agent`). The complete
allow list for call and assistant rows is:

| Row | Kept fields | Phase |
| --- | --- | --- |
| Call | `call_id`, `function_name`, `registry_id`, `agent_id`, `batch_id`, `artifact_id`, `status`, `outcome`, filtered `result`, filtered `approval` | Existing, allow list P1 |
| Delegation call | The call fields above, plus `to_agent`, `from_agent`, `model` (old sessions show the agent change from them) | Existing, allow list P1 |
| Call | Filtered `duration_ms` | P1 |
| Assistant | `agent_id`, `model`, `finish_reason`, `usage` | Existing, allow list P1 |
| Assistant | Content-free `reasoning` | P2 |

Before Block 1 ships, the implementer lists every `metadata.*` read in the
Web Host (`src/features/chat/model/session-manager.ts`) and in the
Session's own UI bundles, and adds any call or assistant field that a
client reads. The list above holds the reads found on 2026-11-25.

Keep only `prompt_tokens`, `completion_tokens` and `total_tokens`
as nonnegative integers in an assistant's optional `usage` object.
Keep only `duration_ms` and `kind` in `reasoning` (section 9).
Approval is recursively projected by section 6 and the existing approval
contract, rather than passed through. Unknown nested fields are dropped.
Omit optional identifiers that were not stored. Assistant `metadata.thinking`
is never returned; P2 text goes through `details.thinking`.

Everything else is dropped, including `metadata.details` (the stamp),
`thinking_blocks`, signatures, redacted payloads, `reasoning_details`,
`provider_metadata`, `control_operations`, `prefix_fingerprint`,
behavior internals and checkpoint summaries. Do not retain `metadata_json`
or any raw metadata alias as a second disclosure path. Future public
metadata requires an explicit allow-list addition.

A tool with `meta.private: true` has no transcript row and no
`function_*` event, name, status, timing or reference in another row.
Remove private calls from approval `display.batch_peers` too.
Only its required approval card remains visible. Private approval records
are projected under the same approval exception while pending and the
normal thresholds after a decision. A delegation is not private merely
because it delegates; retain its existing descriptive text, such as
`Hands the task to {agent}`, and apply normal detail levels.

## 6. Approval after a decision

The existing [approval contract](tool-approval-protocol.md) defines identifiers,
states, offers, digest, timestamps and decision fields. Its fields remain
P1-compatible existing fields. A pending approval always carries the masked
server-built argument preview, even at arguments none. The exception does
not expose full `data` and does not apply to a decided record.

| Display field after any decision | Required arguments level | Phase |
| --- | --- | --- |
| `arguments`, `cut`, `numbers` | `full` | P1 filtering |
| `summary` | `summary` or `full` | P1 filtering |
| Argument-derived summaries in `batch_peers` | `summary` or `full` | P1 filtering |
| `title`, `description`, `agent`, static scope disclosures | Registry content, independent of arguments level | Existing |

Below a threshold, omit the field, rather than leaving an unfiltered copy.
At or above it, rebuild from filtered arguments. At summary,
`display.summary` remains, but `display.arguments`, `cut` and `numbers`
are absent. At none, all argument-derived display fields are absent and
`data` is null. A pending or decided private card obeys these rules.

The current approval `batch_peers` field is an array of static tool names,
not an array of summary objects. Keep only public names, and do not add a
new peer summary format in v1. If an implementation has argument-derived
peer summaries, apply the threshold above.

Fixtures use the existing approval fields `approval_id`, `batch_id`,
`call_id`, `state`, `revision`, `intent_digest`, `requested_at`,
`expires_at`, `decided_at`, `decided_via`, `then`, `reason`,
`grant_id`, `disposition`, `offered` and `display`.
`offered.decisions` lists permitted decisions and `offered.approve_all`
is null when no bulk approval was offered. The fixtures show a denied
decision with `then: stop`, `disposition: not_run` and no user reason.
Their other field types and meanings are unchanged from that contract.

## 7. Live events and invalidation

Use the existing session topics and event envelopes. Do not stream
`tool_call` chunks to the browser from P1. `function_*` descriptors are
filtered independently; they never contain raw argument or result chunks.

| Field | Events | Phase |
| --- | --- | --- |
| `type`, `session_id`, `message_id`, `function_name` | Existing identity fields on all three events; message_id is the stored row ID | Existing |
| `call_id` | Provider call ID where already supplied, especially function_error | Existing |
| `approval` | Optional existing approval projection, filtered by section 6 | Existing, filtered P1 |
| `details` | Same part descriptors as history, including permitted masked previews | P1 |
| `outcome` | Null or section 5.3 outcome | P1 |
| `duration_ms` | Filtered timing value, null if pending, unavailable or timing none | P1 |
| `details_revision` | Revision used to build the event | P1 |
| `error` | Only function_error, as described below | Existing, filtered P1 |

`function_call` has pending result/error/timing descriptors.
`function_success` has a terminal result descriptor.
`function_error` has a terminal error descriptor. At error summary its
`error` is exactly `The tool failed`; at full it is the masked failure
text (or a safe serialized structured failure). At none, omit `error`
entirely. Do not send it as raw error text or copy it into another part.
Full values for "View all" still come from history; live descriptors carry
only the bounded preview, except for P2 final thinking delivery below.

A session configuration change sends `{type: "update", session_id,
details_revision}` (P1), with a larger revision. Existing update fields may
also be present under their own protocols. A `details_revision` is a
nonnegative session visibility-configuration counter, not an approval
revision or a stamp version.

The Host clears loaded details on a newer revision, logout, token change or
reconnect. Mark earlier requests as obsolete and discard both their responses
and any response built for an older revision. Include the revision in detail
query keys and keep content out of browser storage. Registry and app-setting
changes require app restart and client reconnect to clear loaded content.

## 8. Capabilities and session read

The capability means protocol support, not permission to read full values.
Keep the existing `{success: true, capabilities: {...}}` envelope and
`schema: "wippy.session.capabilities.v1"`.

| Capability field | Type and meaning | Phase |
| --- | --- | --- |
| `call_details` | Integer `1` | P1 |
| `session_show_tool_details` | Normalized app level | P1 |
| `details_limits` | Object of fixed preview limits below | P1 |
| `details_limits.preview_bytes` | `8192` | P1 |
| `details_limits.preview_depth` | `6` | P1 |
| `details_limits.string_bytes` | `1024` escaped bytes | P1 |
| `details_limits.key_chars` | `128` | P1 |
| `details_limits.summary_chars` | `80`, summary target rather than a full-value cap | P1 |
| `session_show_thinking` | Normalized app level | P2 |
| `session_thinking_stream` | Configured `live` or `after_step` | P2 |
| `thinking_stream` | Boolean, true only when live text streaming is enabled by the app and not disabled by viewer checking | P2 |
| `details_viewer_check` | Boolean | P3 |

Existing `message_receipt`, `steering` and `tool_approval` remain integer
version capabilities. Other existing keys, such as `attention`, keep their
own contract. Fixtures focus on the fields relevant here. A P1 server omits
P2 and P3 fields; clients treat missing thinking visibility as none and
missing `thinking_stream` as false. Even when `thinking_stream` is true,
the effective session thinking level must be full before text can stream.

The session-read response keeps `success`, `server_now` and `session`.
Existing `session_id`, `user_id`, `title`, `kind` and `status`
identify the session. Existing `activity`, `activity_revision` and
`tool_approval` retain their approval contract. `activity` is null when
nothing waits; `tool_approval` has `active`, `revision` and `grants`.

| Session field | Meaning | Phase |
| --- | --- | --- |
| `session.details.arguments/result/error/timing` | Effective default tool levels for this reader and current session agent | P1 |
| `session.details.thinking` | Effective thinking level for this reader | P2 |
| `session.details_revision` | Revision for this projection | P1 |
| Response `details_revision` | Same revision, including for optional projected latest_message | P1 |

Session levels are ceilings before a particular row's stamp or tool-specific
limits. Per-row descriptors are authoritative. Optional existing
`latest_message` uses the same projection and `message_count` remains
a count; private rows must not be disclosed through either.

## 9. Thinking (phase 2)

wippy/llm normalizes readable thinking as internal `metadata.thinking`
(text) and `metadata.thinking_kind` (one of `summary`, `text`,
`progress`, `withheld`, `none`). These fields are P2 provider-to-Session
fields, not REST metadata. `summary` means a provider summary, `text`
means reasoning text, and `progress` means progress notes. A display level
of full does not turn a provider summary into original reasoning.

Assistant metadata keeps P2 `reasoning: {duration_ms, kind}`, with no
content. Duration is a nonnegative integer or null if not measured; kind
uses the normalized values above. The label and timer may remain visible
when text is hidden. Unknown capture uses `kind: none`; provider omission
or redaction uses `kind: withheld`.
At thinking full, `details.thinking.text` contains full masked text and
`preview` contains the bounded view. At summary it contains only the
server-built `Thought for <seconds> s` summary. If duration is missing,
use `Reasoning summary`, `Model reasoning. It may be wrong.` or
`Progress notes` for readable
kinds. Withheld and not-captured availability have no text or preview.

The existing P2 stream chunk is `{type: "thinking", text: "..."}`.
Text chunks require effective full and `live` mode. Start and finish
markers are `{type: "thinking", state: "started"}` and
`{type: "thinking", state: "finished"}`. The fields `type`, `text`
and `state` in this chunk shape are P2; markers contain no `text`.
They use the existing stream reply target and topic for step association.
Each step has its own thinking box. Markers permit the timer when text is
hidden. A feature-off Host can omit the box.

Live chunks cannot safely mask a secret split across chunks.
`session_thinking_stream: after_step` enables `drop_thinking` at the
source, sends only markers while the step runs, and delivers the complete
masked text at the end through an assistant history projection.
Before delivery, replace every exact copy of a sensitive string value from
the session's tool arguments or results when that string has at least four
characters. Use `[hidden: sensitive]` in the thinking text. The string must
come from a field marked sensitive; there is no automatic secret detector.
Rewritten, split or paraphrased values are not covered. Thinking has no
schema, so its `masked_paths` is empty even when text replacements occurred.
Clients refresh history after the step; no new final-text event is required.
The viewer check forces this mode and keeps final text in checked REST.

P2 wippy/llm `thinking_display` is optional and unset by default, preserving
provider defaults. The spec proposes `summarized`, `omitted` and
`updates`; provider mappings and beta-header support must be verified
against official provider APIs before implementation. This contract does
not assert the unverified mappings. The non-streaming Google mapper must
exclude `thought: true` parts from visible answer text before enabling
thought capture. Signed provider blocks may remain in internal replay (D9).

Render thinking as text and exclude details and thinking from conversation
copy, UI-built prompts, edited messages, exports and Attention capture.
An explicit Copy action on one permitted detail box can copy that box.
Use `data-wippy-attention="exclude"`; child relays strip `details`,
thinking chunks and error text. Tool rows start collapsed and use one row
after an approval decision, with an inline panel and optional dialog (D10).

## 10. Viewer check and audit (phase 3)

With `details_viewer_check: true`, perform
`security.can("session.details.read", "session:<id>", meta)` for each part.
P3 meta fields are `part`, `agent_id`, `tool_id` (the registry ID,
null for thinking) and `viewer_is_owner` (boolean). Use the authenticated
history reader's identity, never a model-supplied identity. Denial or inability
to establish the viewer check lowers the part to none. The session's existing
owner-access check is not broadened by this contract. Confirm security-scope
support before implementing P3.

Live events then carry descriptors without content for every part, even
when a descriptor says full and available. Set `summary` and `preview`
to null, `masked_paths` to [], omit thinking `text` and `error`, and
set `has_full` false. Do not include `duration_ms` content; use null.
The level and availability describe the session ceiling and captured state;
they do not grant a particular viewer access. Strip argument-derived
decided approval display fields too. Pending masked consent previews retain
D7's authorized approval exception. The Host obtains detail content from
REST with that reader's check. `thinking_stream` is false.

P3 audit records each history read with reader identity, session ID, time
and revision, without content. No request identifies a single opened part,
so the audit cannot claim which detail the person expanded.

## 11. Compatibility

| Combination | Behavior |
| --- | --- |
| New Host, older Session | No call_details capability means existing badges only. Never interpret raw history fields as details. |
| Older Host, new Session | Approval View all gets masked JSON text in data at full and null below full. Unknown event fields are ignored. |
| Custom REST client | Same row structure, with masked full values or null. Server code requiring originals reads server storage. |
| Older Session, new thinking Host | Missing session_show_thinking means off. |
| Legacy unstamped row | All levels none unless a trusted app migration computes them. Stored content is restricted; absent content is not_captured. |
| Pending approval card | Masked preview remains available whatever the normal arguments level. |

## 12. Fixed server texts

These English strings are fixed for v1 fixtures. Clients may localize their
own labels from status, outcome and availability; those labels are not error
content. Do not copy a full failure into an error summary.

| Use | Exact text or template | Phase |
| --- | --- | --- |
| Error summary for every failure outcome | `The tool failed` | P1 |
| No argument members | `no arguments` | P1 |
| JSON null result summary | `null` | P1 |
| Empty string result summary | `""` | P1 |
| Masked field | `[hidden: sensitive]` | P1 |
| Timing summary | `Ran for <seconds> s` | P1 |
| Thinking duration summary | `Thought for <seconds> s` | P2 |
| Thinking kind labels without duration | `Reasoning summary`, `Model reasoning. It may be wrong.`, `Progress notes` | P2 |
| Preview cut and binary markers | Section 5.2, same bytes as approval previews | P1 |

Full failure text is diagnostic content, not fixed across tools. Fixtures
use safe representative values, such as `Invoice service timed out.`.
The Host derives `Stopped`, `Outcome unknown`,
`Not run. The arguments were not valid.`, `Done. No result.`,
`Checking…`, `Some fields are hidden`,
`The model provider did not share this reasoning.` and
`Details are not available for this step.` from state. They are not sent
as raw failures. A failed detail load shows `Could not load details.`
with Retry and does not change the tool's outcome.

## 13. Contract choices

The source spec leaves some exact encodings open. Version 1 makes the
following choices so independent implementations have concrete test data.
All of them were accepted at gate C0 on 2026-11-25. The allow list was
narrowed to call and assistant rows and gained `artifact_id` and the
delegation fields at the same gate (section 5.4).

| Point | Choice and reason |
| --- | --- |
| Read formula omits agent while prose says current layers | Reapply the current agent limit so tightening an agent cannot leave old rows visible. |
| Preview wrapper and capability limit names unspecified | Use the shared value/cut/numbers wrapper and details_limits keys in sections 5 and 8. |
| Full thinking location unspecified | Use details.thinking.text, because metadata.thinking is forbidden in REST and no new endpoint is allowed. |
| Full argument type versus "masked JSON" wording | Preserve the existing JSON string in data; preserve the native JSON value in metadata.result. |
| Stamp exposure and timing location unspecified | Keep the stamp internal, use metadata.duration_ms in history and duration_ms on events, matching existing metadata/event placement. |
| Peer summaries versus current string array | Keep the existing public-name string array and gate any argument-derived summaries without inventing a new peer format. |
| Other public assistant metadata unspecified | Use the explicit minimal allow list in section 5.4. Extend it only after checking a client requirement. |
| has_full and content-free live descriptors unspecified | has_full means an allowed full value is present in this delivery path; P3 live descriptors set it false. |
| Invalid mask, stream and check settings unspecified | Use the restrictive defaults in sections 1 and 4 rather than expose content after malformed configuration. |

## 14. Fixtures and verification

Each JSON filename names one case. The fixtures include full and reduced
visibility, masks, all outcomes, decided and pending approvals, missing and
legacy content, a result exceeding the preview budget, thinking capture
states, live events, invalidation, capabilities and session read.

Tool payload keys are examples, not additional protocol fields. In these
fixtures, arguments have an invoice identifier, `invoice_id`, and an
authentication value, `api_key`, marked `writeOnly` in the input schema.
The input schema requires `invoice_id` to be a string; the invalid-arguments
fixture sends the number 42. Results have `invoice_id`, payment `status`
and an `access_token` masked through tool meta. The large-result array
uses `invoice_id`, a text `description` and payment `status` on each item.
The two sample tools are `lookup_invoice` and `delete_invoice`.

For each file, run:

```text
node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <file>
```

Parsing validates JSON syntax. Contract review must also compare field
placement, content thresholds, preview size, masked copies and the phase
rules above. The fixtures describe expected projections and do not imply
that runtime implementation or integration tests have run.
