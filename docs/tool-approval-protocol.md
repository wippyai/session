# Tool approval protocol (wire contract)

This document is the wire contract between the Session module and a chat
client (the Wippy Web Host, `<wippy-chat>`, or a headless `chat.js` user) for
native tool-call approval. It lists every message a client sends or receives,
with every field. The design behind it is in the tool approval architecture
(Jira EE2-2710).

**Status: off until the gate ships.** No released Session module advertises
the capability yet. Until `GET /api/v1/sessions/capabilities` returns
`tool_approval: 1`, a client must not send any of the commands or declarations
below, and it will receive none of the events.

Machine-readable examples of every message are in
`test/approval/fixtures/*.json`. The test `app.approval:protocol_fixtures_test`
checks each fixture against the "Fixture index" table at the end of this
document, so the two cannot drift apart silently. Clients may copy the JSON
files as test data.

## 1. Defaults

| Setting | Default | Range |
| --- | --- | --- |
| Request timeout (`timeout_seconds`) | 900 s | 30 to 3600 s |
| Agent `approve_all` mode | `off` | `off`, `batch`, `tool`, `session` |
| Requests per turn (`max_requests_per_turn`) | 10 | 1 to 50 |
| Grace period with no approval surface | 120 s | fixed |
| Decision and revocation body cap | 4 KB | fixed |
| Deny reason length (`then = "continue"`) | 1 to 2,000 characters | fixed |

With `approve_all: off`, Approve all is offered only for a tool whose author
set `approval.approve_all: true` (scope `tool`).

## 2. Capability

`GET /api/v1/sessions/capabilities` keeps its existing envelope and adds one
key:

```json
{ "success": true, "capabilities": { "schema": "wippy.session.capabilities.v1", "tool_approval": 1 } }
```

The other capability keys (`message_receipt`, `steering`, `attention`) stay as
they are. A client treats a missing key, or a value below 1, as "no tool
approval". Without it, the client sends byte for byte the same messages as
before this feature.

Fixture: `capabilities.json`.

## 3. Approval UI surface

A surface is a live client connection that renders approval cards for one
session. The Session asks for a decision only while at least one surface is
live, or during the 120 s grace period after the last one went away.

A client declares a surface only when the capability is present and a
transcript that can render cards is mounted for the session. It declares in
either of two ways:

```json
{ "type": "session_open", "session_id": "...", "tool_approval_ui": 1 }
{ "type": "session_message", "session_id": "...", "data": { "text": "...", "runtime_context": { "tool_approval_ui": 1 } } }
```

- The declaration belongs to the socket connection that sent it. It ends when
  that connection closes, or when the client withdraws it.
- Headless `chat.js` users declare through `setToolApprovalUi(sessionId, true)`.
- When the transcript unmounts while the socket stays open, the client
  withdraws its surface:

```json
{ "type": "session_command", "session_id": "...", "data": { "command": "tool_approval_surface", "enabled": false } }
```

A reopen, a later message or a Session process restart does not restore a
withdrawn surface. Only a new declaration does.

Fixtures: `session_open.json`, `session_message_runtime_context.json`,
`tool_approval_surface.json`.

## 4. The `tool_approval` event

Topic: the existing per-call topic `session:<session_id>:message:<call_id>`.
The Session publishes one event per approval request when the request is
created, and one more each time its committed state changes. Calls of every
row type get it: `function`, `private_function` and `delegation`.

```json
{
  "type": "tool_approval",
  "session_id": "0199...",
  "message_id": "<call row id>",
  "call_id": "call_abc",
  "function_name": "delete_customer",
  "row_type": "function",
  "server_now": "2026-10-21T12:15:00Z",
  "approval": { "approval_id": "0199...", "batch_id": "0199...", "state": "pending", "revision": 1, "...": "see below" }
}
```

Top-level fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | string | Always `tool_approval`. |
| `session_id` | string | The session. |
| `message_id` | string | The stored call row ID. Key the card by this ID, not by `call_id`. |
| `call_id` | string | The provider call ID (also the topic segment). |
| `function_name` | string | The tool name the model used. |
| `row_type` | string | `function`, `private_function` or `delegation`. |
| `server_now` | string | Server time (RFC 3339, UTC) when the event was built. |
| `approval` | object | The committed approval record (below). |

The `approval` object:

| Field | Type | Meaning |
| --- | --- | --- |
| `approval_id` | string | Request ID (UUID v7). Send it back in the decision. |
| `batch_id` | string | The assistant row ID of the batch. Calls of one model response share it. |
| `state` | string | Decision state: `pending`, `approved`, `denied`, `expired`, `cancelled`, `superseded`, `interrupted`, `unavailable`, `limited`. |
| `revision` | integer | Starts at 1 and grows on every change. Apply only a higher revision. |
| `intent_digest` | string | `sha256:` digest of the frozen call. Send it back in the decision. |
| `requested_at` | string | When the request was created. |
| `expires_at` | string | Deadline. Time left is `max(0, expires_at - server_now)`, computed when the event arrives, so the client clock does not matter. |
| `decided_at` | string or null | When the decision was committed. |
| `decided_via` | string or null | `user`, `approve_all`, `grant` or `system`. |
| `then` | string or null | For a denial: `stop` or `continue`. |
| `reason` | string or null | For a `continue` denial: the user's text. |
| `grant_id` | string or null | The grant that allowed the call, or the grant this decision created. |
| `disposition` | string or null | `dispatched` or `not_run`, once known. An approved call can still end `not_run`. |
| `offered` | object | What the card may offer (below). Present while the request is pending and kept afterwards. |
| `display` | object | Server-built card content (below). |

`offered`:

| Field | Type | Meaning |
| --- | --- | --- |
| `decisions` | array of string | A subset of `approve`, `approve_all`, `deny`. |
| `approve_all` | object or null | Present only when `approve_all` is offered. |
| `approve_all.scope` | string | `batch`, `tool` or `session`. The client shows this scope and sends it back unchanged. |
| `approve_all.covers` | array of string | The approval IDs this Approve all decides. It never changes. |

`display` (every value is built by the server; arguments are model-provided
data and must be shown escaped, never as HTML):

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string | Tool title from the registry. |
| `description` | string | Tool description from the registry. |
| `agent` | string | Title of the agent that asked. |
| `summary` | string | One-line argument summary for the compact card (about 80 characters). |
| `arguments` | object | Argument preview: at most 8 KB and depth 6. Cut values state their full size. See "Argument preview" below. |
| `cut` | array of string | JSON Pointer paths (into `arguments`) of values that were cut or replaced. |
| `numbers` | array of string | JSON Pointer paths of numbers sent as strings to keep their exact value. |
| `batch_peers` | array of string | Tool names of the other calls in the batch. |
| `target_agent` | string | Delegation calls only: the target agent title. |
| `approve_all_scope` | object | Present when `approve_all` is offered: the disclosure for the Details view. |
| `approve_all_scope.scope` | string | Same as `offered.approve_all.scope`. |
| `approve_all_scope.tools` | array of object | Every tool in the grant scope: `{ "registry_id", "title" }`, plus `target_agent_id` for delegation. |
| `approve_all_scope.covered` | array of object | Every covered pending call: `{ "approval_id", "title" }`. |
| `approve_all_scope.covered_count` | integer | Number of covered calls. |

### Argument preview

`display.arguments` is built by the server from the decoded arguments. A
client shows it as data, escaped, and never as HTML.

- Strings and object keys use JSON string escaping for every control,
  bidirectional, zero-width or other invisible format character (`‮`,
  `​`, `\n`, ...). A literal backslash is shown as `\\` and a quote as
  `\"`. So the character U+202E shows as the six characters `‮`, and the
  literal text `‮` in an argument shows as `\\u202e`. An invalid UTF-8
  byte shows as `\xNN`.
- Base64 and hex runs of at least 128 characters, and data URLs, are replaced
  by `[binary, <size>]` inside the string. The path of the string is in `cut`.
- A string longer than 1 KB of escaped text ends with `… [cut, <size>]`. An
  object or array deeper than 6 levels is replaced by `[cut, <size>]`. When
  the 8 KB budget runs out, the remaining members of an array are replaced by
  one last item `[cut, <n> more, <size>]`, and those of an object by one
  member with the key `…` (or `……` if that key is taken). Every such path is
  in `cut`. Object keys longer than 128 characters end with `…`.
- Sizes are the UTF-8 bytes of a string, the JSON bytes of an object or array,
  and the decoded bytes of binary data: `512 B`, `1.4 KB`, `2.0 MB`.
- No key is redacted. The full arguments are in the REST row `data`.
- `summary` is one line: the first keys in sorted order with their values, as
  many as fit in about 80 characters, then ` +<n> more` for the rest. Strings
  are quoted and escaped as above; objects show as `{<n> keys}` and arrays as
  `[<n> items]`. A call without arguments shows `no arguments`.

Exact numbers. Integers outside the JSON safe range (above `2^53 - 1` or
below `-(2^53 - 1)`) are sent as strings with their exact decimal digits,
and their paths are listed in `numbers`. This holds for every 64-bit integer
(`-9223372036854775808` to `9223372036854775807`). **Limit:** the runtime JSON
decoder turns an integer outside the 64-bit range (for example
`12345678901234567890`) into a floating-point number before the Session sees
the call, so its exact digits are already gone. The preview then shows that
number as `%.17g` text (`"1.2345678901234567e+19"`), also listed in `numbers`,
and never shows digits that the runtime no longer has. The intent digest
covers the same decoded value.

State events never carry a client `request_id`. Event order for an approved
public call: `tool_approval` (pending), `tool_approval` (approved),
`function_call`, then `function_success` or `function_error`. A public call that
a grant allows has no pending event; its `function_call` carries
`decided_via: "grant"`. Approved private and delegation calls get no
`function_call` or `function_success`. When a grant allows one of them, the
Session publishes one `tool_approval` event with state `approved` and
`decided_via: "grant"` as the audit record.

Old clients ignore the unknown `tool_approval` type.

Fixtures: `tool_approval_event_pending.json`, `tool_approval_event_decided.json`,
`tool_approval_event_grant.json`.

## 5. Decision command

Sent on the socket. The reply comes on the session topic.

```json
{
  "type": "session_command",
  "session_id": "...",
  "request_id": "req_42",
  "data": {
    "command": "tool_approval",
    "approval_id": "0199...",
    "decision": "approve",
    "intent_digest": "sha256:...",
    "expected_revision": 1
  }
}
```

| `data` field | Type | Rule |
| --- | --- | --- |
| `command` | string | `tool_approval`. |
| `approval_id` | string | From the event. |
| `decision` | string | `approve`, `approve_all` or `deny`. Must be in `offered.decisions`. |
| `approve_all_scope` | string | Only with `approve_all`. Must equal `offered.approve_all.scope`. |
| `then` | string | Only with `deny`: `stop` (deny and stop the assistant) or `continue` (deny and tell the assistant what to do instead). |
| `reason` | string | Only with `then = "continue"`: 1 to 2,000 characters. |
| `intent_digest` | string | From the event. |
| `expected_revision` | integer | The revision the card shows. |

`approve` and `approve_all` take no `then` or `reason`. `request_id` is
required; a retry reuses it.

An `approve_all` decision approves, in one commit, every request in
`offered.approve_all.covers` that is still pending. With scope `tool` or
`session` it also creates a grant: later calls in the scope run without a card
for the rest of the session. With scope `batch` no grant is created.

The Session checks, in this order: body size, that the sender owns the
session, the stored receipt for `request_id`, that the request exists, that it
is still pending, the deadline, the decision fields, the digest and the
revision, and finally that the batch is still open.

Fixtures: `decision_approve.json`, `decision_approve_all.json`,
`decision_deny_stop.json`, `decision_deny_continue.json`.

## 6. Grant revocation

```json
{ "type": "session_command", "session_id": "...", "request_id": "req_43",
  "data": { "command": "tool_approval_grant_revoke", "grant_id": "0199...", "expected_revision": 1 } }
```

A revocation committed before a batch is released stops the calls that the
grant allowed in that batch; they settle as not run. A revocation never
reverses calls already released. Later calls ask again.

Fixture: `grant_revoke.json`.

## 7. Replies

Success is a `command_response` on the session topic `session:<session_id>`
with the same `request_id` and the committed records:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | string | `command_response`. |
| `session_id` | string | The session. |
| `request_id` | string | Echo of the command's `request_id`. |
| `success` | boolean | `true`. |
| `approval` | object | The decided approval record. |
| `approvals` | array of object | Every approval record this decision changed (Approve all can change several). |
| `grant` | object or null | The grant created or revoked, as in section 9. |

A retry with the same `request_id` and the same body returns the stored
response again. A card shows a decided state only from committed data: a
`command_response`, a `tool_approval` event, or REST. Sending a command alone
never marks it decided.

Errors use the existing `error` frame on the session topic:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | string | `error`. |
| `session_id` | string | The session. |
| `request_id` | string | Echo of the command's `request_id`. |
| `code` | string | One of the codes below. |
| `message` | string | Human-readable text. |
| `approval` | object | Optional: the committed approval record. |
| `approvals` | array of object | Optional: committed approval records. |
| `grant` | object | Optional: the committed grant. |

`approval`, `approvals` and `grant` are the only extra keys an error carries.

| Code | When |
| --- | --- |
| `approval_not_found` | No such request in this session. |
| `approval_not_pending` | The request is already decided or closed. Carries `approval` with the committed state. Checked before the revision, so a competing decision always gets the committed state. |
| `approval_stale` | Digest or revision mismatch on a pending request, or an expected grant revision that does not match on a revocation. Nothing changed. |
| `approval_expired` | The deadline passed. |
| `invalid_decision` | The decision is not offered, the scope differs from the offered scope, `then` or `reason` is missing or not allowed, the reason length is out of range, or the body is over 4 KB. |
| `grant_not_found` | No such grant in this session, or the grant is already revoked (carries `grant`). |
| `request_conflict` | The same `request_id` was used with a different body. |
| `forbidden` | The sender does not own the session. |
| `SESSION_FINISHING` | The session is finishing; every command gets this. |

Fixtures: `command_response_decision.json`, `command_response_revoke.json`,
`command_error_not_pending.json`, `command_error_stale.json`.

## 8. Tool events

A call that did not run gets the existing `function_error` event on its
per-call topic, also for private and delegation calls. Old clients show it as
an error chip.

```json
{
  "type": "function_error",
  "session_id": "...",
  "message_id": "...",
  "call_id": "call_abc",
  "function_name": "delete_customer",
  "error": "Not run: you denied this call.",
  "outcome": "not_approved",
  "approval": { "approval_id": "0199...", "state": "denied", "then": "continue", "reason": "Use the staging customer instead.", "disposition": "not_run" }
}
```

`outcome` is `not_approved` for every not-run approval outcome, and `cancelled`
when Stop ended the call.

`function_call` keeps its meaning "execution starts" and gains an `approval`
object that old clients ignore:

```json
{ "type": "function_call", "session_id": "...", "message_id": "...", "function_name": "delete_customer",
  "approval": { "state": "approved", "decided_via": "user", "grant_id": null } }
```

Fixtures: `function_error_not_approved.json`, `function_call_approved.json`.

## 9. Session fields: `activity` and `tool_approval`

Two new session fields, in REST session reads, the session list and live
session `update` events:

```json
{
  "activity": { "kind": "awaiting_tool_approval", "approval_ids": ["0199..."] },
  "activity_revision": 7,
  "tool_approval": {
    "active": true,
    "revision": 3,
    "grants": [ { "grant_id": "0199...", "revision": 1, "scope": "tool", "status": "active", "suspension_reason": null,
                  "registry_id": "app.tools:delete_customer", "title": "Delete customer", "created_at": "..." } ]
  }
}
```

- `activity` is `null` when nothing waits. `activity_revision` is an integer
  that grows on every change. A live `update` that clears the activity sends
  `activity: null` with a higher `activity_revision`. Apply only a higher
  revision.
- `activity.kind` is `awaiting_tool_approval`; `activity.approval_ids` lists the
  pending requests.
- `tool_approval.active` is `true` once the session is protected. The Host also
  uses it to isolate model-authored content.
- Each grant carries `grant_id`, `revision`, `scope` (`tool` or `session`),
  `status` (`active` or `suspended`), `suspension_reason`, `registry_id` and
  `title` (both `null` for scope `session`, which covers every tool in its
  manifest), and `created_at`. Revoked grants are not listed.
- Session `status` stays `running` while a card waits.

When no surface can show a card, the Session sends one session `error` event per
turn with code `tool_approval_unavailable` and fixed text, and the turn ends.

Fixtures: `session_update_activity.json`, `session_update_activity_cleared.json`,
`session_error_unavailable.json`.

## 10. REST projections

- `GET /api/v1/sessions/get` and `GET /api/v1/sessions` include `activity`
  (`null` when nothing waits), `activity_revision` and `tool_approval` in each
  session object.
- `GET /api/v1/sessions/messages` returns each approval-bearing call row with
  `metadata.approval`: `{ approval_id, call_id, state, decided_via, disposition,
  revision, then, reason, offered, intent_digest, display, requested_at,
  expires_at, decided_at, grant_id }`. The row keeps `metadata.status =
  "pending"` while it waits.
- Both responses carry a top-level `server_now` (RFC 3339, UTC), so a reloaded
  card computes time left the same way as a live one.

Fixtures: `rest_session.json`, `rest_message_row.json`.

## 11. What the model sees

A call that did not run gets a structured error result. It never contains
approval IDs, digests or grant IDs.

```json
{
  "executed": false,
  "reason": "denied_by_user",
  "user_feedback": "Use the staging customer instead.",
  "instruction": "The tool did not run. Do not call it again with the same arguments. Follow the user's feedback."
}
```

| Reason | When | Turn |
| --- | --- | --- |
| `denied_by_user` | `continue` denial | continues |
| `stopped_by_user` | `stop` denial | ends |
| `not_run_batch_stopped` | a peer was stopped, or the batch was otherwise closed | ends |
| `expired` | deadline | ends |
| `stopped` | Stop | ends |
| `superseded_by_user_message` | a steering message | continues with the message |
| `interrupted` | finish, crash, process exit, handoff, deletion | ends |
| `approval_ui_unavailable` | no live surface after the grace period, or never declared | ends, with a notice |
| `limit` | per-turn cap | ends, with a notice |
| `changed_before_run` | tool entry, browser binding, context or digest changed before release | continues |
| `revoked` | the grant that allowed the call was revoked before release | continues |
| `repeated_denied_call` | same call as one denied earlier in this turn | continues |

`changed_before_run` is the model-facing name; the stored disposition reason is
`intent_changed`. The word `stale` is not used for it.

Fixture: `model_result_not_run.json`.

## 12. Fixture index

Each row names a fixture file and the keys it must have. `path:type` checks a
type (`string`, `integer`, `number`, `boolean`, `object`, `array`, `null`;
alternatives joined with `/`). `path=value` checks an exact value. Paths are
dotted; a number selects an array item (1-based).

| Fixture | Message | Required keys |
| --- | --- | --- |
| `capabilities.json` | GET capabilities response | `success=true capabilities.schema=wippy.session.capabilities.v1 capabilities.tool_approval:integer` |
| `session_open.json` | Surface declaration on open | `type=session_open session_id:string tool_approval_ui:integer` |
| `session_message_runtime_context.json` | Surface declaration on a message | `type=session_message session_id:string data.text:string data.runtime_context.tool_approval_ui:integer` |
| `tool_approval_surface.json` | Surface withdrawal | `type=session_command session_id:string data.command=tool_approval_surface data.enabled=false` |
| `tool_approval_event_pending.json` | Pending request event | `type=tool_approval session_id:string message_id:string call_id:string function_name:string row_type:string server_now:string approval.approval_id:string approval.batch_id:string approval.state=pending approval.revision:integer approval.intent_digest:string approval.requested_at:string approval.expires_at:string approval.offered.decisions:array approval.offered.approve_all.scope:string approval.offered.approve_all.covers:array approval.display.title:string approval.display.description:string approval.display.agent:string approval.display.summary:string approval.display.arguments:object approval.display.cut:array approval.display.numbers:array approval.display.batch_peers:array approval.display.approve_all_scope.scope:string approval.display.approve_all_scope.tools:array approval.display.approve_all_scope.covered:array approval.display.approve_all_scope.covered_count:integer` |
| `tool_approval_event_decided.json` | State change event | `type=tool_approval session_id:string message_id:string call_id:string server_now:string approval.approval_id:string approval.state=approved approval.revision:integer approval.decided_via=user approval.decided_at:string` |
| `tool_approval_event_grant.json` | Grant audit event | `type=tool_approval row_type=private_function approval.state=approved approval.decided_via=grant approval.grant_id:string` |
| `decision_approve.json` | Approve | `type=session_command session_id:string request_id:string data.command=tool_approval data.approval_id:string data.decision=approve data.intent_digest:string data.expected_revision:integer` |
| `decision_approve_all.json` | Approve all | `type=session_command request_id:string data.command=tool_approval data.decision=approve_all data.approve_all_scope:string data.intent_digest:string data.expected_revision:integer` |
| `decision_deny_stop.json` | Deny and stop | `type=session_command request_id:string data.command=tool_approval data.decision=deny data.then=stop data.intent_digest:string data.expected_revision:integer` |
| `decision_deny_continue.json` | Deny and continue | `type=session_command request_id:string data.command=tool_approval data.decision=deny data.then=continue data.reason:string data.intent_digest:string data.expected_revision:integer` |
| `grant_revoke.json` | Grant revocation | `type=session_command session_id:string request_id:string data.command=tool_approval_grant_revoke data.grant_id:string data.expected_revision:integer` |
| `command_response_decision.json` | Decision reply | `type=command_response session_id:string request_id:string success=true approval.approval_id:string approval.state:string approvals:array approvals.1.approval_id:string grant.grant_id:string grant.scope:string grant.status=active grant.revision:integer` |
| `command_response_revoke.json` | Revocation reply | `type=command_response request_id:string success=true grant.grant_id:string grant.status=revoked grant.revision:integer` |
| `command_error_not_pending.json` | Decision refused | `type=error session_id:string request_id:string code=approval_not_pending message:string approval.approval_id:string approval.state:string approval.revision:integer` |
| `command_error_stale.json` | Digest or revision mismatch | `type=error request_id:string code=approval_stale message:string` |
| `function_error_not_approved.json` | Not-run settlement | `type=function_error session_id:string message_id:string call_id:string function_name:string error:string outcome=not_approved approval.approval_id:string approval.state:string approval.disposition=not_run` |
| `function_call_approved.json` | Execution starts | `type=function_call session_id:string message_id:string function_name:string approval.state=approved approval.decided_via:string approval.grant_id:string/null` |
| `session_update_activity.json` | Live session update | `type=update session_id:string activity.kind=awaiting_tool_approval activity.approval_ids:array activity_revision:integer tool_approval.active=true tool_approval.revision:integer tool_approval.grants:array tool_approval.grants.1.grant_id:string tool_approval.grants.1.revision:integer tool_approval.grants.1.scope:string tool_approval.grants.1.status:string tool_approval.grants.1.suspension_reason:string/null tool_approval.grants.1.registry_id:string/null tool_approval.grants.1.title:string/null tool_approval.grants.1.created_at:string` |
| `session_update_activity_cleared.json` | Activity cleared | `type=update session_id:string activity:null activity_revision:integer` |
| `session_error_unavailable.json` | No approval surface notice | `type=error session_id:string code=tool_approval_unavailable message:string` |
| `rest_session.json` | REST session read | `success=true server_now:string session.session_id:string session.status=running session.activity:object/null session.activity_revision:integer session.tool_approval.active:boolean session.tool_approval.grants:array` |
| `rest_message_row.json` | REST call row | `success=true server_now:string messages.1.message_id:string messages.1.type:string messages.1.metadata.status=pending messages.1.metadata.approval.approval_id:string messages.1.metadata.approval.call_id:string messages.1.metadata.approval.state:string messages.1.metadata.approval.revision:integer messages.1.metadata.approval.intent_digest:string messages.1.metadata.approval.offered:object messages.1.metadata.approval.display:object messages.1.metadata.approval.requested_at:string messages.1.metadata.approval.expires_at:string` |
| `model_result_not_run.json` | Model-visible result | `executed=false reason:string instruction:string` |
