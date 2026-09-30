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
  remain listable, and fetching one returns HTTP 500.

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

See [Session Forms (framework)](https://docs.wippy.ai/en/framework/session-forms)
for the full `ask_user` / `read_form` contract, the answer record shape, late
answers, and how an answer is admitted into the conversation, and
[Session Forms (frontend)](https://docs.wippy.ai/en/frontend/micro-frontends/session-forms)
for the `wippy-form` / `wippy-form-answers` components and the HTTP contract
from the browser side.

[wippy-documentation]: https://docs.wippy.ai
[releases-page]: https://github.com/wippyai/module-session/releases
