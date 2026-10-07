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

A tool that returns `_control.config.agent` while a turn is running hands that
turn to the new agent. The session commits the switch, and the next agent step
in the same turn is taken by the new agent with the conversation so far, so a
router agent whose only action is a handoff still produces the answer. The
session re-publishes `interaction` for the new agent at that step, and pending
steering is applied there. Stop still ends the turn at the operation boundary,
and the committed switch stays in place.

The server generates the canonical message ID. A request ID correlates the
command response. The session saves a message before acknowledging it. There
is no automatic retry or client message deduplication. If acknowledgement is
lost, a manual resend can create a duplicate.

Accepted steering is pending until the current response and its tool batch
finish. The next model request includes it after those results in persisted
message order, within the same turn. Stop prevents the next continuation at
the operation boundary. Unused steering remains pending after Stop or recovery
and is included when the user starts another turn.

REST session responses and WebSocket session updates expose
`interaction.can_send` and `interaction.revision`. Clients use session status
for Stop, keep explicit false values, and ignore older revisions. Servers
without `interaction` retain legacy status behavior. Steering metadata uses
`input.state` with `pending` or `applied`, plus `input.after_message_id` after
application. The messages endpoint returns `pending_inputs` independently of
history pagination.

On Windows, run `make.bat test` and `make.bat lint`, with `WIPPY_BIN` set
when Wippy is not on PATH. The test target clears only its own test database.

## Runtime tests and benchmarks

On Unix, `make install test` runs the suite against the locked dependencies.
`make test-runtime FRAMEWORK_DIR=/absolute/path/to/framework` exercises
registered tools, agent compilation, the Session
process, and SQLite persistence with deterministic model responses. It covers
handoff history, persisted control operations, mixed tool results, and Stop.
The Framework checkout supplies local agent, LLM, and test sources. Required
runtime checks need the candidate runner so missing or empty suites fail.
CI runs both locked compatibility and candidate tests.

`make bench FRAMEWORK_DIR=/absolute/path/to/framework` writes JSON reports with
median, p95, throughput, samples, and
revision metadata. Defaults are five warmups and thirty measured batches at
sizes 1, 8, and 32; override `BENCH_WARMUP`, `BENCH_SAMPLES`, and `BENCH_SIZES`
(comma-separated). Each operation checks the complete persisted handoff.
Reports measure local runtime work and have no timing threshold.
Set `BENCH_REVISION` and `BENCH_FRAMEWORK_REVISION` when comparing external
source snapshots without Git metadata.

Dependencies, the database, environment file, backups, and benchmark reports
stay under `TEST_ARTIFACTS` (default `/tmp/wippy-session-tests`). The database is
backed up before each reset. Override `TEST_BACKUP_DIR` for another backup
location or `TEST_CONFIG` for an external runtime configuration. These targets
require Wippy, Bash, jq, and SQLite; set `WIPPY` when it is not on PATH.

## Tool feedback and loop limits

Settled tool failures are marked as errors in the next model prompt. Public
function-error events carry the same error text saved in history; private and
delegation details remain hidden from public tool events. Text-only answers end
the turn. An explicit empty-output exhaustion is reported rather than sampled
again; incomplete-tool and older truncation responses retain their retry behavior.

Existing loop settings and defaults remain: `max_iterations` defaults to 1,000
and `max_repeated_calls` to 50 under `agent_options.loop`. Session overrides use
`max_turn_iterations` and `max_repeated_tool_calls`. A value of `0` disables that
limit. There is no separate three-failure default.

The repeat limit covers identical tool rounds and repeated failures of the same
action across changing batches. Parallel duplicates count once per round.
Changed arguments identify a different action; successful recovery clears that
action's failure history, but unrelated successes do not. New user-started turns
reset the counters. Stop still takes precedence, and unused steering remains
pending for the next user-started turn.

History and applied steering compare timestamps chronologically, with message
IDs only breaking ties. Stored timestamps, IDs and pagination cursors are not
rewritten.

## Checkpoints and prompt caching

When a checkpoint function or binding is configured, the session compares each
model response's normalized `tokens.context_tokens` with
`token_checkpoint_threshold`. It checks tool continuations too, and schedules
the checkpoint before the next tool round and model step. The existing strict
`>` threshold is unchanged; reaching the threshold exactly does not trigger it.

This is the current prompt size, not cumulative usage across the turn. Cached
input still occupies context even when `prompt_tokens` reports only a small
uncached suffix. The LLM module normalizes provider accounting; the session does
not add cache counters again.

The conversation carries rolling cache markers so a provider can reuse the
stable history prefix on later requests. Caching is provider-dependent, can
expire or miss, and cached reads still have a cost. Checkpointing shortens the
active prompt after a successful summary; neither mechanism is a hard spending
limit or a preflight guarantee against one oversized tool result.

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

[wippy-documentation]: https://docs.wippy.ai
[releases-page]: https://github.com/wippyai/module-session/releases
