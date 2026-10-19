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

Stop cancels the turn's in-flight model and tool calls. The session hands the
running turn a cancel channel (`runtime_options.cancel` for the agent step, the
third argument of `tool_caller:execute`) and closes it on Stop. A cancelled model
call stores the text streamed so far as the assistant message with
`metadata.stopped = true`; a cancelled tool call is stored with status
`cancelled`. The turn then ends idle. A Framework agent without this channel
keeps the earlier behavior: Stop takes effect at the next operation boundary,
and the session plugin escalates a turn that does not finish.

Accepted steering is pending until the current response and its tool batch
finish. The next model request includes it after those results in persisted
message order, within the same turn. Stop prevents the next continuation at
the operation boundary. Unused steering remains pending after Stop or recovery
and is included when the user starts another turn.

Manual renames and generated titles persist before notifying the live session.
Title notifications publish through the existing session owner's inbox using the
stored title. A stopped session can still be renamed without starting a process;
its next open loads that name. Automatic generation only fills an empty title.

When a checkpoint falls inside a turn, the next agent prompt retains the
originating user-request text at user authority, followed by the checkpoint
resume note and subsequent model/tool messages. Restored requests are limited to
6000 UTF-8 bytes, including an omission marker when needed; excerpts retain both
ends. The original request and resume note precede retained steering even when
its original anchor is unavailable. Later corrections take precedence, and
completed work stays completed. The checkpoint summary covers
earlier progress and attachments; restoring the request does not reload those
attachments. A later ordinary user message starts its own turn and prevents
restoring the previous request. Pending steering cannot replace the active task.

Stop commits a developer message in conversation history together with its
interaction state and any pending-input rollback. The message tells the model
that the preceding turn is cancelled and subsequent user messages are new
requests. Recovery persists an interruption message before accepting input
when the preceding turn does not finish, including when no assistant response
exists. Reopening preserves an existing boundary without duplicating it. Positional
message metadata requires the LLM companion in version 0.5.7 or later.

Shutdown, user close, inactivity and session-limit eviction finish at the active
turn boundary. They preserve the in-flight model step, tools and continuation;
only explicit Stop interrupts the turn. Reconnection cancels a pending disconnect
finish. Cancelled public calls persist their cancelled status before emitting a
`function_error` update with `outcome = cancelled` and the deprecated
`status = cancelled`; private and delegation calls remain private.

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

`make test-postgres FRAMEWORK_DIR=/absolute/path/to/framework` checks the
affected persistence paths and real handoffs against PostgreSQL. Supply a fresh
disposable database with `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and
`PGPASSWORD`; the target never drops it. CI provides PostgreSQL 17. The harness
supplies the application's user-table contract and runs these checks in UTC.

On Unix, `make install test` runs the suite against the locked dependencies.
`make test-runtime FRAMEWORK_DIR=/absolute/path/to/framework` exercises
registered tools, agent compilation, the Session
process, and SQLite persistence with deterministic model responses. It covers
handoff history, persisted control operations, mixed tool results, and Stop.
The Framework checkout supplies local agent, LLM, and test sources. Required
runtime checks need the candidate runner so missing or empty suites fail.
CI runs both locked compatibility and candidate tests.

`make bench FRAMEWORK_DIR=/absolute/path/to/framework` writes local JSON reports
with median, p95, throughput, samples, allocation counters, and revision
metadata. Defaults are 100 warmups and 100 measured batches at
sizes 1, 8, and 32; override `BENCH_WARMUP`, `BENCH_SAMPLES`, and `BENCH_SIZES`
(comma-separated). Each operation checks the complete persisted handoff.
Normal garbage collection remains enabled for latency samples. A separate
256-operation pass measures allocated bytes, exact allocation counts, heap
growth, and retained heap. Override `BENCH_MEMORY_OPERATIONS` for its size.
The metadata-write workload checks real persisted patches while retaining
128-byte and 4096-byte payloads. It uses 32 writes per sample and 2048 writes
for memory measurement; override `BENCH_METADATA_SIZES` and
`BENCH_METADATA_MEMORY_OPERATIONS` as needed. Session creation and deletion
are outside that workload's measured loops.
Exact counters use the local runtime profiler; `BENCH_EXACT_ALLOCATIONS=0`
records tracked heap objects instead. Reports include measurement overhead.
Run one benchmark process at a time with port 6060 free for its profiler.
CI runs correctness checks; performance comparisons run locally.
Set `BENCH_REVISION` and `BENCH_FRAMEWORK_REVISION` when comparing external
source snapshots without Git metadata.

Dependencies, the database, environment file, backups, and benchmark reports
stay under `TEST_ARTIFACTS` (default `/tmp/wippy-session-tests`). The database is
backed up before each reset. Override `TEST_BACKUP_DIR` for another backup
location or `TEST_CONFIG` for an external runtime configuration. These targets
require Wippy, Bash, jq, and SQLite; set `WIPPY` when it is not on PATH.

## Session retirement

Disconnect, chat close, inactivity cleanup, and session-capacity retirement let
accepted turns and queued writes finish before the process exits. Reconnect or
reopen cancels pending retirement. Explicit Stop still cancels the turn; normal
provider and turn limits continue to apply. Relay inactivity collection must
also wait for the session plugin to exit instead of cancelling its parent hub.

Retiring children occupy their live session slots until EXIT. A new session at
capacity receives `session_limit_reached` and can be retried after a child exits;
reopening an existing child needs no additional slot.

Cancelled public tools emit a terminal `function_error` event after their
outcome is stored. The event carries `outcome: cancelled`, the same field that
history uses, so clients read one field in both places. It also keeps the
0.6.8 field `status: cancelled` for clients that already read it; that field is
deprecated. History keeps `cancelled` in storage and exposes `status: error`
with `outcome: cancelled`, so old and new clients show a settled result after a
reload. Stop, a failed turn, an agent handoff and a command-bus failure cancel
calls this way. Private and delegation calls send no event.

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

The complete checkpoint continuation fix requires Agent 0.5.5 or later. Publish
Agent 0.5.5 before publishing the Session release that carries this requirement:
the session keeps the user's task across mid-turn checkpoints, while Agent labels
per-step memory recall as background context. PostgreSQL installations also need
Runtime v0.3.50a or later to preserve message timestamp precision when choosing
checkpoint boundaries.

Agent 0.5.5 requires LLM 0.5.8 or later, so publish LLM before Agent and refresh
Session's dependency lock from those published packages before release.

When a checkpoint function or binding is configured, the session compares each
model response's normalized `tokens.context_tokens` with
`token_checkpoint_threshold`. It checks tool continuations too, and schedules
the checkpoint before the next tool round and model step. The existing strict
`>` threshold is unchanged; reaching the threshold exactly does not trigger it.

Checkpoint options resolve in this order: trait defaults, explicit agent
`agent_options.checkpoint`, then persisted session config. The existing
`token_checkpoint_threshold` and `checkpoint_function_id` session fields override
agent values; an optional `config.checkpoint` map overlays those fields last.
That map is read from persisted host configuration, not accepted implicitly by
the start token or `_control.config`. `enabled = false` disables scheduling;
the existing zero/nonpositive session threshold remains disabled. Maps merge
recursively and lists replace, including an explicit empty list.

The scheduler captures detached effective options for each queued checkpoint,
so later config changes cannot alter that operation. A trait checkpoint binding
is attempted before the configured function fallback; both receive effective
`options`. A strict binding failure prevents fallback and checkpoint-state
writes. Without behaviors, the existing function path remains available.

This is the current prompt size, not cumulative usage across the turn. Cached
input still occupies context even when `prompt_tokens` reports only a small
uncached suffix. The LLM module normalizes provider accounting; the session does
not add cache counters again.

The conversation carries rolling cache markers so a provider can reuse the
stable history prefix on later requests. Caching is provider-dependent, can
expire or miss, and cached reads still have a cost. Checkpointing shortens the
active prompt after a successful summary; neither mechanism is a hard spending
limit or a preflight guarantee against one oversized tool result.

## Durable behavior controls

Opt-in trait behaviors can propose the shared declarative `_control` subset:
agent/model/trait/tool targets, session/public metadata, and `memory.compact`.
The response and its pending proposal marker are saved atomically. Tool and
delegation outcomes settle before a proposal takes effect. Recovery replays
persisted proposals without rerunning tools or taking another model step;
explicitly cancelled tool rounds do not apply their proposals.

Replay is at-least-once: a crash between a declarative effect and its completion
marker can repeat it. External providers and lifecycle hooks must use stable
refs and idempotent writes, not rely on a final `deactivate` callback.

`memory.compact = true` persists a request that bypasses the token threshold,
not an explicit disable or a missing provider. False is not cancellation.
When a proposal also changes configuration, requested compaction captures the
committed agent/provider, not the old response's settings. An agent handoff continues the current turn through the canonical replacement-agent
continuation after the preceding tool results settle. Accepted steering reaches
the new agent once; compaction uses the committed target's provider and options.
An explicit Stop suppresses that continuation and keeps unapplied steering for
the next user-started turn.
Summary replacement, history anchor, audit metadata and request consumption
commit in one transaction; failed writes retain the previous usable history.
This does not install a long-term memory provider or a loop policy. Sessions
without opted-in behaviors do not scan history for proposals or start new
automatic model continuations.

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
