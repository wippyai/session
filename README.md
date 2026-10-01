<p align="center">
    <a href="https://wippy.ai" target="_blank">
        <picture>
            <source media="(prefers-color-scheme: dark)" srcset="https://github.com/wippyai/.github/blob/main/logo/wippy-text-dark.svg?raw=true">
            <img width="30%" align="center" src="https://github.com/wippyai/.github/blob/main/logo/wippy-text-light.svg?raw=true" alt="Wippy logo">
        </picture>
    </a>
</p>
<h1 align="center">Module Session</h1>
<div align="center">

[![Latest Release](https://img.shields.io/github/v/release/wippyai/module-session?style=flat-square)][releases-page]
[![License](https://img.shields.io/github/license/wippyai/module-session?style=flat-square)](LICENSE)
[![Documentation](https://img.shields.io/badge/Wippy-Documentation-brightgreen.svg?style=flat-square)][wippy-documentation]

</div>

## Session steering

Sessions block new messages during an active turn by default. Add the
`wippy.session.traits:steering` agent trait to accept steering, or set the
persistent session override:

```yaml
config:
  input_policy:
    while_running: steer
```

The effective policy uses the temporary turn override, then the session
override, then the active agent's `agent_options.session_input.while_running`,
then `block`. Stop remains controlled by session status.

The optional `wippy.session.traits:input_control` trait supplies the
`set_session_input_policy` tool. The tool accepts `block`, `steer`, or
`inherit`. Turn scope is the default, and session scope persists the change.
The tool is bound to its calling session. The session validates and persists a
change before reporting tool success. Temporary overrides clear on completion,
Stop, failure, recovery, and agent handoff.

The server generates the canonical message ID. A request ID correlates the
command response. The session saves a message before acknowledging it. There
is no automatic retry or client message deduplication. If acknowledgement is
lost, a manual resend can create a duplicate.

Accepted steering is pending until the current response and its tool batch
finish. The next model request includes it after those results in persisted
message order, within the same turn. Stop prevents the next continuation at
the operation boundary. Unused steering remains pending after Stop or recovery
and is included when the user starts another turn, ahead of the message that
starts it. Steering sent after that message follows it.

REST session responses and WebSocket session updates expose
`interaction.can_send` and `interaction.revision`. Clients use session status
for Stop, keep explicit false values, and ignore older revisions. Servers
without `interaction` retain legacy status behavior. Steering metadata uses
`input.state` with `pending` or `applied`, plus `input.after_message_id` after
application. The messages endpoint returns `pending_inputs` independently of
history pagination.

A page reload does not end a turn. The user hub tells the session plugin when
the user's last client disconnects, and a reload closes the old connection a
fraction of a second before the new one opens. The plugin therefore waits 10
seconds after the last client leaves before it finishes the user's sessions,
and a client that connects again within that time cancels the wait. A running
turn then ends the way it does without a reload, so it applies the steering
sent during it and admits the form answers accepted during it. When no client
returns within 10 seconds, the plugin finishes the sessions, which works like
a Stop for a running turn. Unused steering then remains pending, and so do the
form answers accepted during the turn. The next session start admits those
answers and starts a turn for them. If a client connected again while the
session was finishing, the plugin starts the session for those answers as soon
as it exits, and steering alone starts nothing.

A turn cut off by a runtime stop is settled when the user's session plugin
starts again: pending tool calls are repaired and the session is stored idle,
with `can_send` true, because a new message is how the user continues it.
Until then, REST responses report such a session the same way.

When a turn does not stop within 10 seconds of a Stop (for example, during a
model call that Stop cannot interrupt), the session plugin cancels the session
process, and terminates it if it still runs 10 seconds later. That exit is the
Stop the user asked for, not a failure. Pending tool calls are repaired, form
answers sent during the stopped turn are delivered without a new turn, and the
session is stored idle with `can_send` true. Clients get no error.

On Windows, run `make.bat test` and `make.bat lint`, with `WIPPY_BIN` set
when Wippy is not on PATH. The test target clears only its own test database.

## Artifacts

An artifact is generated content that outlives the message that produced it. A
tool returns `_control.artifacts`, this module persists it, writes the messages
that reference it, and serves it over HTTP.

### Render mode and placement

An artifact carries two independent settings.

| Setting | Field on `_control.artifacts[]` | Stored as |
|---|---|---|
| Render mode | `type` | the `kind` column |
| Placement | `display_type` | `meta.display_type` |

**Render mode** determines how a client draws the artifact. It is returned as
`type` by `GET /artifact/{id}`.

| `type` | Drawn as |
|---|---|
| `inline` (default) | the content itself, in the message |
| `standalone` | a chip the reader clicks to open the artifact |
| `inline-interactive` | the artifact in a sandboxed, proxy-enabled frame |
| `view_ref` | a server-rendered page reference; requires `page_id` |

Values are stored verbatim and are not validated. A value outside this set
matches no renderer branch, and the artifact renders as nothing.

**Placement** determines which messages this module writes, and therefore how
the artifact reaches the thread.

| `display_type` | Messages written | How it reaches the thread |
|---|---|---|
| `standalone` | `type="artifact"` with `metadata.artifact_id`, plus `system` `artifact_created` | the client renders the artifact message |
| `inline` | a `developer` message carrying an embed instruction, plus `system` | the agent pastes `<artifact id="…"/>` into its reply |

The reference tools derive placement from `instructions`: `true` → `inline`,
otherwise `standalone`. The standalone artifact message is written only when
`instructions` is exactly `false`; `nil` does not qualify.

The two settings are independent — any combination is valid. A `standalone`
placement with an `inline` render mode puts the content in its own message; a
`standalone` render mode with an `inline` placement gives a chip embedded in the
agent's reply.

Placement must not be mapped onto `type`. Returning `meta.display_type` as
`type` for every kind was tried and reverted: it collapses the two settings into
one, so a `standalone` placement can no longer carry inline content — the
combination the reference tools produce by default. An author who wants a chip
asks for the render mode directly (`type = "standalone"`) rather than getting it
as a side effect of where the artifact is delivered.

### Content modes

Exactly one applies. `title` is always required.

| Mode | Fields | Stored `content` | Default `content_type` |
|---|---|---|---|
| Text | `content`, optional `content_type` | the string verbatim | `text/markdown` |
| Component tag | `content` = a `wippy-component-tag-1.0` package | JSON | `application/json` |
| Component / page package | `content` = a `wippy-component-1.0` package | JSON | `application/json` |
| Page reference | `page_id`, optional `params` | `params` as JSON | `text/html` |

A page reference also requires `type: "view_ref"`. Its content endpoint renders
the page server-side rather than returning stored bytes.

### Control payload

```lua
return {
  success = true,
  _control = {
    artifacts = {
      {
        title        = "Q3 summary",   -- required
        content      = "# Q3 …",       -- one content mode
        content_type = "text/markdown",
        type         = "standalone",   -- render mode; omitted ⇒ "inline"
        display_type = "standalone",   -- placement
        instructions = false,
        preview      = "",             -- shown before the artifact loads
        description  = nil,
        icon         = nil,
        status       = nil,            -- omitted ⇒ "idle"
      },
    },
  },
}
```

`_control.artifacts` is a list; one tool call may produce several artifacts. A
failing tool returns no `_control`.

### HTTP API

`GET /artifact/{id}` returns metadata for one artifact.

| Field | Source |
|---|---|
| `uuid` | `artifact_id` |
| `type` | the `kind` column; for `view_ref`, `meta.display_type` |
| `kind` | the `kind` column |
| `display_type` | `meta.display_type` |
| `title`, `created_at`, `updated_at` | columns |
| `content_type`, `description`, `icon`, `status` | from `meta` |
| `page_id`, `is_view_reference`, `params` | `view_ref` only |
| `content_version` | constant `1`; see limitations |

`GET /artifact/{id}/content` returns raw bytes with `Content-Type` from
`meta.content_type`, or `text/plain` when absent. A `view_ref` is rendered
server-side.

Both endpoints answer another user's artifact exactly like a missing one: 404
with the body `{"success": false, "error": "Artifact not found"}`.

`GET /artifacts?session_id=&limit=&cursor=` returns an actor-scoped catalog,
metadata only. Pagination is keyset over `(created_at DESC, artifact_id DESC)`.
Cursors are opaque (`v1:<uuid>`) and resolved within the caller's own scope, so a
cursor naming an inaccessible row is rejected. Rows carry `kind` and
`display_type`; they do not carry `type`, so that one field name does not mean
different things on two endpoints.

### Realtime

| Event | Topic | Payload |
|---|---|---|
| standalone artifact message stored | `session:<id>:message:<message_id>` | `{ type: "artifact", message_id, artifact_id }` |
| any artifact created | `session:<id>` | `{ type: "update", artifact_added, session_id }` |

Only `session:`-prefixed topics are relayed to clients.

### Limitations

- `kind` is stored verbatim from `type` with no enum check.
- Updating an artifact replaces `meta` wholesale. The update path supplies only
  `content_type`, `description`, `icon` and `status`, so `display_type`,
  `page_id` and `preview` do not survive an update.
- Supplying both `title` and `content` matches the create path first, so an
  update shaped that way produces a second artifact with a new id.
- `content_version` is constant, so a client caching on it will not refetch
  updated content. Use `updated_at`.
- A delegated tool call produces no artifact; the control payload is ignored.
- SQLite does not cascade artifact deletion with its session. Orphaned rows
  remain listable, and fetching one returns HTTP 404.

## Session Forms

Session forms let an agent ask the user structured choice questions with the
`ask_user` tool and get the answer back as an ordinary user message. A form
is stored as a `wippy-component-tag-1.0` artifact (see Artifacts above) with
one extra metadata key, `meta.session_form`; no new SQL table is used.

### Enable

Add the trait to an agent:

```yaml
traits:
  - id: wippy.session.forms:ask_user
```

The agent gets `ask_user` (create a form; ends the turn) and `read_form`
(read an earlier form's questions, or its answer record, by `form_id`). Every
agent, with or without the trait, gets a bounded index of the session's forms
injected into its prompt so it can find a form id without the trait.

### API

`GET` / `POST /api/v1/artifact/{id}/state` reads a form's canonical state and
accepts its answer. Both are served by `wippy.session.forms:state_service`
behind the thin HTTP adapter in `src/api/artifact_state.lua`. A submission
commits the accepted answer and its user message in one transaction, then
wakes the owning session process; a missed wake-up is recovered from the
stored row on the next session start.

V1 supports choice fields only: single selection, multiple selection,
optional/required, notes on a chosen option, and a free-text "Other" answer.

### Answers and steering

A form answer is not typed input, so the session input policy never steers
it into a running turn. An answer accepted during a turn stays pending, and
the running turn cannot read it: the form index and `read_form` report it as
pending. When the turn ends, the session admits the answer and starts a new
turn for it. Answers and steered messages keep the order in which the user
sent them. A step applies steered messages only up to the first pending
answer, and a message sent before an answer stays ahead of it in the prompt.
When the user stops a turn, its answers are delivered without starting a new
turn, and steering sent after them stays pending as after any Stop. This also
holds when the session plugin has to enforce the Stop. A turn
that asks a form still ends there; steering sent during that turn starts the
next turn.

See [Session Forms (framework)](https://docs.wippy.ai/en/framework/session-forms)
for the full `ask_user` / `read_form` contract, the answer record shape, late
answers, and how an answer is admitted into the conversation, and
[Session Forms (frontend)](https://docs.wippy.ai/en/frontend/micro-frontends/session-forms)
for the `wippy-form` / `wippy-form-answers` components and the HTTP contract
from the browser side.

[wippy-documentation]: https://docs.wippy.ai
[releases-page]: https://github.com/wippyai/module-session/releases
