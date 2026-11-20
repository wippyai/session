# Tool approval protocol (wire contract)

This document is the wire contract between the Session module and a chat
client (the Wippy Web Host, `<wippy-chat>`, or a headless `chat.js` user) for
native tool-call approval. It lists every message a client sends or receives,
with every field.

A client checks the capability first (section 2). Without
`tool_approval: 1` in `GET /api/v1/sessions/capabilities`, a client must not
send any of the commands or declarations below, and it will receive none of
the events.

Null fields. A field that this document shows as `null` may be left out of a
message instead; a client reads a missing field as `null`. The exception is
`activity` in session objects and session updates (section 9): it is always
sent when its revision is, as `null` when nothing waits.

Machine-readable examples of every message are in
`test/approval/fixtures/*.json`; each section names its fixtures. The test
`app.approval:protocol_fixtures_test` checks that every fixture keeps the keys a
client reads, and `app.approval:contract_test` checks that every event, reply
and REST projection the Session sends has exactly the keys of its fixture.
Clients may copy the JSON files as test data.

## 1. Defaults

| Setting | Default | Range |
| --- | --- | --- |
| Request timeout (`timeout_seconds`) | 900 s | 30 to 3600 s |
| Agent `approve_all` mode | `off` | `off`, `batch`, `tool`, `session` |
| Requests per turn (`max_requests_per_turn`) | 10 | 1 to 50 |
| Grace period with no approval surface | 120 s | fixed |
| Decision and revocation body cap (fields of `data`, section 7) | 16 KB | fixed |
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
transcript that can render cards is mounted for the session. It declares with
the `tool_approval_surface` command right after it opens the session, or on a
message:

```json
{ "type": "session_command", "session_id": "...", "request_id": "...", "data": { "command": "tool_approval_surface", "enabled": true } }
{ "type": "session_message", "session_id": "...", "data": { "text": "...", "runtime_context": { "tool_approval_ui": 1 } } }
```

- `session_open` carries no declaration. The relay forwards only a fixed list
  of `session_open` fields, so a `tool_approval_ui` field there never reaches
  the Session, and the Session ignores it.
- The declaration belongs to the socket connection that sent it. It ends when
  that connection closes, or when the client withdraws it.
- Headless `chat.js` users declare through `setToolApprovalUi(sessionId, true)`.
- When the transcript unmounts while the socket stays open, the client
  withdraws its surface with the same command and `enabled: false`:

```json
{ "type": "session_command", "session_id": "...", "request_id": "...", "data": { "command": "tool_approval_surface", "enabled": false } }
```

The Session plugin handles `tool_approval_surface` itself and never forwards
it. `enabled` must be the boolean `true` or `false`. When the command has a
`request_id`, the reply is a `command_response` on the session topic with the
same `request_id` and `success: true`, or `success: false` with
`code: "invalid_surface_command"` and a `message` when `session_id` or
`enabled` is missing or wrong, or with `code: "surface_unavailable"` when the
Session could not record the declaration (the surface is not live; the client
may declare again). A command that does not come through the
user's authenticated relay is refused without a reply.

A reopen, a later message or a Session process restart does not restore a
withdrawn surface. Only a new declaration does.

Fixtures: `tool_approval_surface_declare.json`,
`session_message_runtime_context.json`, `tool_approval_surface_withdraw.json`.

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
| `offered` | object or null | What the card may offer (below). Present while the request is pending and kept afterwards; `null` for a record that a grant decided. |
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
| `approve_all_scope.tools` | array of object | Every tool in the grant scope: `{ "registry_id", "title", "fingerprint" }`, plus `target_agent_id` for delegation. `fingerprint` is the tool's deployment fingerprint when the card was built. For scope `session` the list holds every tool of the agent and every agent it can delegate to: a delegation target is listed with the delegation function as `registry_id`, the target agent as `target_agent_id` and title, and the fingerprint of the function and the target together. The list never changes, and a session grant covers exactly these tools and targets at these fingerprints. |
| `approve_all_scope.covered` | array of object | Every covered pending call: `{ "approval_id", "title" }`. |
| `approve_all_scope.covered_count` | integer | Number of covered calls. |

### Argument preview

`display.arguments` is built by the server from the decoded arguments. A
client shows it as data, escaped, and never as HTML.

- Strings and object keys use JSON string escaping for every control,
  bidirectional, zero-width or other invisible format character (`\u202e`,
  `\u200b`, `\n`, ...). A literal backslash is shown as `\\` and a quote as
  `\"`. So the character U+202E shows as the six characters `\u202e`, and the
  literal text `\u202e` in an argument shows as `\\u202e`. An invalid UTF-8
  byte shows as `\xNN`. The escaped set is every code point in the Unicode
  15.1 general categories Cc, Cf, Zl and Zp and with the
  Default_Ignorable_Code_Point property.
- Base64 and hex runs of at least 128 characters, and data URLs, are replaced
  by `[binary, <size>]` inside the string. The path of the string is in `cut`.
  A base64 run must use one alphabet (standard or URL-safe) and must not look
  like a path (start with `/`, or split on `/` into three or more segments of
  at most 40 characters). A data URL payload ends at the first character
  outside `[A-Za-z0-9+/=_-]` (base64) or `[A-Za-z0-9%._~-]` (other data
  URLs), so text after it, such as `;curl ...|sh`, stays visible.
- A string longer than 1 KB of escaped text ends with `… [cut, <size>]`. An
  object or array deeper than 6 levels is replaced by `[cut, <size>]`. When
  the 8 KB budget runs out, the remaining members of an array are replaced by
  one last item `[cut, <n> more, <size>]`, and those of an object by one
  member with the key `…` (or `……` if that key is taken). Every such path is
  in `cut`. Object keys longer than 128 characters end with `…`.
- Sizes are the exact JSON bytes of a string, an object or an array as the
  server encodes them, and the decoded bytes of binary data: `512 B`,
  `1.4 KB`, `2.0 MB`.
- No key is redacted. The full arguments are in the REST row `data`.
- `summary` is one line: the first keys in sorted order with their values, as
  many as fit in about 80 characters, then ` +<n> more` for the rest,
  including keys the 8 KB budget left out. Keys and strings are quoted and
  escaped as above (`"customer_id": "c_1042", "hard": true`); objects show as
  `{<n> keys}` and arrays as `[<n> items]`. A call without arguments shows
  `no arguments`.

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
Session publishes exactly one `tool_approval` event with state `approved` and
`decided_via: "grant"` as the audit record, once the call's disposition is
known (`dispatched`, or `not_run` when the batch closed or the grant was
revoked first).

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

`approve` and `approve_all` take no `then` or `reason`, and a `stop` denial
takes no `reason`. `request_id` is required (at most 160 characters); a retry
reuses it.

An `approve_all` decision approves, in one commit, every request in
`offered.approve_all.covers` that is still pending, and no other request. With
scope `tool` or `session` it also creates a grant: later calls in the scope run
without a card for the rest of the session. A tool grant covers the tool of the
request at its deployment fingerprint (for a delegation call, also the target
agent). A session grant covers exactly the tools in
`display.approve_all_scope.tools`. With scope `batch` no grant is created. A
deny with `then = "stop"` closes the batch in the same commit: no call of the
batch runs.

The Session checks, in this order: body size, that the sender owns the
session, the stored receipt for `request_id`, that the request exists, that it
is still pending, the deadline, the decision fields, the digest and the
revision, and finally, in the commit, that the batch is still open and that the
current agent policy still allows a grant of the offered scope. A batch that a
message sent meanwhile has superseded is closed by that check: the decision
gets `approval_not_pending` with the request in state `superseded`, and no
grant is created.

Authority comes only from the connection. The session plugin forwards these
commands only when they arrive through the user's authenticated relay, and it
sets `sender_user_id` to that user itself, replacing any value the client
sent. The Session accepts them only from its plugin and only when that user
owns the session. Nothing in `data` counts as identity.

After the commit, the Session publishes a `tool_approval` event for every
request the decision changed, the session `activity` (section 9), and then
the `command_response`.

Fixtures: `decision_approve.json`, `decision_approve_all.json`,
`decision_deny_stop.json`, `decision_deny_continue.json`.

## 6. Grant revocation

```json
{ "type": "session_command", "session_id": "...", "request_id": "req_43",
  "data": { "command": "tool_approval_grant_revoke", "grant_id": "0199...", "expected_revision": 1 } }
```

`expected_revision` is the grant revision the client shows (section 9). The
Session checks, in this order: body size, that the sender owns the session
(as for a decision), the stored receipt for `request_id`, that the grant
belongs to this session and is not already revoked, and the revision.

A revocation committed before a batch is released stops the calls that the
grant allowed in that batch; they settle as not run with the model reason
`revoked`, and their approval records keep their decision. A revocation never
reverses calls already released, also calls that have not started yet. Later
calls ask again.

Grant lifetime. A grant lasts for the rest of the session: it survives new
turns and Session process restarts. It ends when it is revoked, when the
session is deleted, or when the session gets another owner. A new, copied or
forked session starts with no grants. A grant that an agent switch suspends
(`suspension_reason` `agent_without_trait` or `mode_not_permitted`) becomes
active again only when the user switches to an agent that permits it, or a new
Approve all creates a new grant. Nothing the model does restores it. A grant
suspended because its tool changed (`deployment_changed`) or because the tool
no longer offers Approve all (`tool_approve_all_false`) stays suspended; only
a new Approve all, once offered again, gives the authority back.

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
response again and changes nothing; the same `request_id` with another body
gets `request_conflict`. "Body" means the fields of `data` listed in sections 5
and 6. Only a committed command is stored. A refused one is not, so its retry
is checked again. Receipts belong to the session owner and the session. A card
shows a decided state only from committed data: a `command_response`, a
`tool_approval` event, or REST. Sending a command alone never marks it decided.

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
| `approval_not_pending` | The request is already decided or closed, or its batch was closed (by Stop, finish, a stop denial or a message sent meanwhile). Carries `approval` with the committed state. Checked before the revision, so a competing decision always gets the committed state. |
| `approval_stale` | Digest or revision mismatch (or a missing one) on a pending request, or an expected grant revision that does not match on a revocation (carries `grant`). Nothing changed. |
| `approval_expired` | The deadline passed. Carries `approval`. |
| `invalid_decision` | The decision is not offered, the scope differs from the offered scope, `then` or `reason` is missing or not allowed, the reason length is out of range, the current agent policy no longer allows a grant of the offered scope, `request_id` is missing or longer than 160 characters, or the body is over 16 KB. A revocation uses this code for the last two cases too. |
| `grant_not_found` | No such grant in this session, or the grant is already revoked (carries `grant`). |
| `request_conflict` | The same `request_id` was used with a different body. |
| `forbidden` | The command did not come through the session owner's authenticated connection. Checked before the receipt, so another user never gets the owner's stored response. Carries no records. |
| `storage_error` | The command could not be stored. Nothing changed; retry with the same `request_id`. |
| `SESSION_FINISHING` | The session is finishing; every command gets this. |

The body cap counts only the body as defined above (the fields of `data`
listed in sections 5 and 6, encoded as JSON). Transport fields such as
`request_id` and `conn_pid` do not count. 16 KB holds a reason of 2,000
characters with the other fields, even when the JSON encoder escapes each
character to six bytes (for example `\u0001`).

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

When a call with an approval record does not run, the Session publishes its
`tool_approval` state event before the `function_error`. `function_error`
carries no `row_type`, so a client learns from the earlier event that a
private or delegation row is not a public tool call. A private or delegation
call without an approval record (one that needed no approval in a batch that
did not run) gets no `function_error`: without approval, private and
delegation calls get no function events.

`function_call` keeps its meaning "execution starts" and gains an `approval`
object that old clients ignore:

```json
{ "type": "function_call", "session_id": "...", "message_id": "...", "function_name": "delete_customer",
  "approval": { "state": "approved", "decided_via": "user", "grant_id": null } }
```

Fixtures: `function_error_not_approved.json`, `function_call_approved.json`.

## 9. Session fields: `activity` and `tool_approval`

Two new session fields, in REST session reads, the session list, the open
announcement (the first session `update` a Session process sends when it
starts, with `status`) and live session `update` events:

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
  pending requests. Each committed decision updates it.
- `tool_approval` is always present. `tool_approval.active` is `true` once
  the session is protected; an unprotected session has
  `{ "active": false, "revision": 0, "grants": [] }`. `tool_approval.revision`
  is the revision of the stored activation; it moves when the activation
  changes, not when a grant does.
- A live `update` carries `tool_approval` when the session becomes protected
  or its activation changes, and when a grant is created, revoked, suspended
  or restored. It always holds the complete list of grants; a grant missing
  from it was revoked. Order one grant's changes by its `revision`.
- The open announcement carries `activity`, `activity_revision` and
  `tool_approval`, read after recovery, so a client knows whether the session
  is protected before it renders the transcript.
- Each grant carries `grant_id`, `revision`, `scope` (`tool` or `session`),
  `status` (`active` or `suspended`), `suspension_reason`, `registry_id` and
  `title` (both `null` for scope `session`, which covers every tool in its
  manifest; for a delegation grant the title is the target agent's), and
  `created_at`. Revoked grants are not listed.
- Session `status` stays `running` while a card waits.

When no surface can show a card, the Session sends one session `error` event per
turn with code `tool_approval_unavailable` and fixed text, and the turn ends.
When one model step asks for more approvals than the agent's
`max_requests_per_turn` allows in the turn, no call of the step runs, every
call settles with the model reason `limit`, the Session sends one session
`error` event per turn with code `tool_approval_limit` and fixed text, and the
turn ends.

Fixtures: `session_update_activity.json`, `session_update_activity_cleared.json`,
`session_error_unavailable.json`, `session_error_limit.json`.

## 10. REST projections

- `GET /api/v1/sessions/get` and `GET /api/v1/sessions` include `activity`
  (`null` when nothing waits), `activity_revision` and `tool_approval` in each
  session object.
- `GET /api/v1/sessions/messages` returns each approval-bearing call row with
  `metadata.approval`: `{ approval_id, batch_id, call_id, state, decided_via,
  disposition, revision, then, reason, offered, intent_digest, display,
  requested_at, expires_at, decided_at, grant_id }`. The row keeps
  `metadata.status = "pending"` while it waits. A row that ended never keeps a
  `pending` projection: when a tool round fails, or recovery closes the batch,
  the projection is rewritten with the committed record, and a row that was
  already terminal keeps its status and result.
- All three responses carry a top-level `server_now` (RFC 3339, UTC), so a
  reloaded card computes time left the same way as a live one.

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
| `revoked` | the grant that allowed the call was revoked, or the session changed owner, before release | continues |
| `repeated_denied_call` | same call as one denied earlier in this turn | continues |
| `approval_check_failed` | the Session could not prepare a valid call for the approval check (for example a value that is not JSON-shaped) | continues |

After a crash or a process exit, recovery closes the unfinished batch
(close reason `exit`): a pending request becomes `interrupted`, and a call
that did not run gets the `interrupted` result above. An approved call of a
batch that was never released, and every call of a batch released before
the interruption, get the plain text `interrupted, outcome unknown` instead,
because the Session does not know whether it ran. No call runs again after a
restart, and the batch's behavior controls (model-phase and wrapper
controls) are not replayed. When the recovering process reaches the user's
clients (the Session process at its start or exit, the session plugin on its
failure paths and in its scan of sessions left running), it publishes the
`tool_approval` events of the records it closed and the cleared `activity`;
otherwise clients read them through REST.

`changed_before_run` is the model-facing name; the stored disposition reason is
`intent_changed`. The word `stale` is not used for it.

`approval_check_failed` comes with the instruction "The tool did not run. Do
not call it again with the same arguments. The call could not be prepared for
the approval check." No request is created for such a call, and it never runs.

A call that `validate` marks invalid, or whose arguments don't decode, gets no
approval request and no structured result: it keeps the caller's existing
error text (for example `Failed to parse arguments: ...`), as before this
feature.

Fixture: `model_result_not_run.json`.

## 12. Artifact read

`GET /api/v1/artifact/{id}` (the metadata a client loads before it mounts
artifact content) carries the artifact's `session_id` and a `tool_approval`
object copied from that session:

```json
{ "uuid": "0199...", "session_id": "0199...", "type": "inline", "content_type": "text/html",
  "tool_approval": { "active": true } }
```

- `tool_approval.active` is `true` when the artifact's session is protected,
  and `false` for an unprotected session or an artifact without a session.
- A client isolates the content of an artifact whose `tool_approval.active` is
  `true`, and mounts no content before this read. A missing `tool_approval`
  (an older Session) means not protected: older Sessions can't protect a
  session.
- When the Session can't read the session's protection, the read fails with
  status 500; it never reports `active: false` instead.
- The artifact update event does not carry `tool_approval`; a client reads it
  here.

In a protected session the Session refuses a new or updated
`_control.artifacts` item whose content type is `application/json` and whose
content is a Wippy package other than a `wippy-form` tag without `on*` props
(such a package runs with the user's token or in the Host realm, so it can't
be isolated), before it writes any item of the batch. The call becomes a tool
error that starts with `isolation_required:` and asks the model for HTML or
markdown instead; the turn goes on.

Fixture: `rest_artifact.json`.
