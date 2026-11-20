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

## Timestamp storage

Session activity, messages, artifacts and session contexts store UTC timestamps.
PostgreSQL's timestamp columns carry UTC wall time without an offset, so writers
convert both the current time and explicit Unix timestamps to UTC before
formatting. SQLite retains the same instant in its timestamp text. Runtime time
zone settings do not change these stored instants.
SQLite list and cursor comparisons use the existing timestamp comparison key,
so stored offset timestamps and new UTC timestamps retain chronological order.

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
and is included when the user starts another turn, ahead of the message that
starts it. Steering sent after that message follows it.

Manual renames and generated titles persist before publishing a session update.
An active session publishes the stored title through its existing process. If
the session is inactive, a committed rename tells the owner's connected clients
to read the current session row. Automatic generation only fills an empty title.

When a checkpoint falls inside a turn, the next agent prompt retains the
originating user-request text at user authority, followed by the checkpoint
resume note and subsequent model/tool messages. Restored requests are limited to
6000 UTF-8 bytes, including an omission marker when needed; excerpts retain both
ends. A form answer is restored whole, because an excerpt would cut its JSON
record. The form size limits bound it, and a prompt that does not fit the
model's window fails. The original request and resume note precede retained
steering even when its original anchor is unavailable. Later corrections take precedence, and
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
`function_error` update with `outcome = cancelled`; private and delegation calls
remain private.

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
returns within 10 seconds, the plugin retires the sessions (see Session
retirement below): a running turn finishes, applies the steering sent during
it and admits the form answers accepted during it, and the session exits when
its accepted work is done. A Stop that arrives meanwhile still ends the turn;
unused steering then remains pending, and so do the form answers accepted
during the turn. The next session start admits those answers and starts a turn
for them. If a client connects again after the 10 seconds while the session
is still retiring, it takes the retirement back. If the session already exited,
the plugin starts it again for form answers that are still pending, and
steering alone starts nothing.

A turn cut off by a runtime stop is settled when the user's session plugin
starts again: pending tool calls are repaired, the interruption message is
persisted, and the session is stored idle, with `can_send` true, because a new
message is how the user continues it.
Until then, REST responses report such a session the same way.

When a turn does not stop within 10 seconds of a Stop (for example, a model or
tool call that ignores the cancellation), the session plugin cancels the session
process, and terminates it if it still runs 10 seconds later. That exit is the
Stop the user asked for, not a failure. Pending tool calls are repaired, form
answers sent during the stopped turn are delivered without a new turn, and the
session is stored idle with `can_send` true. Clients get no error.

On Windows, `make.bat <target>` runs the same target as `make <target>` for
every row below (`make.bat` starts the `make.ps1` adapter, which keeps the Makefile's
dependencies, arguments, environment variables and failure behavior). Set
`WIPPY_BIN` when Wippy is not on PATH. The adapter has no command-line
variables: pass settings as environment variables named like the Makefile
variables (`TEST_FILTER`, `TEST_ARTIFACTS`, `FRAMEWORK_DIR`, `PGHOST` and so on).
The adapter needs `sqlite3` on PATH to reset the test database.

| Unix | Windows |
| --- | --- |
| `make install` | `make.bat install` |
| `make test` | `make.bat test` |
| `make test TEST_FILTER="a b"` | `$env:TEST_FILTER = 'a b'; make.bat test` |
| `make test-runtime` | `make.bat test-runtime` |
| `make test-admission` | `make.bat test-admission` |
| `make test-postgres`, `make test-postgres-full` | `make.bat test-postgres`, `make.bat test-postgres-full` |
| `make bench` | `make.bat bench` |
| `make lint` | `make.bat lint` |
| `make test-ui`, `make lint-ui`, `make check-ui`, `make build-ui` | the same names with `make.bat` |
| `make verify` | `make.bat verify` |

The test target clears only its own test database. Where `sh` is not on PATH
(Windows), the six "External test bootstrap" cases are skipped, because they run
the shell scripts that the Makefile uses; CI runs them on Linux.

`TEST_FILTER` holds one or more space-separated filters, for example
`TEST_FILTER="app.runtime:handoff_runtime app.persist:checkpoint_repo_test"`;
each word selects its own suites and nothing else runs. The runtime version that
reads filters this way is noted in the Makefile above the `test` target.

## Runtime tests and benchmarks

`make test-postgres` checks the
affected persistence paths, the forms suites, real handoffs and the tool
approval runtime suites against PostgreSQL. Supply a fresh disposable database with `PGHOST`, `PGPORT`,
`PGDATABASE`, `PGUSER`, and `PGPASSWORD`; the target never drops it.
`make test-postgres-full` runs every normal suite and leaves opt-in benchmarks
to `make bench`. CI uses this full gate with PostgreSQL 17. The harness
supplies the application's user-table contract (a trigger registers the users
that test rows name; the foreign keys stay enforced) and runs these checks in
UTC. Dates are written in UTC, and message dates are read back at microsecond
precision, because the PostgreSQL driver returns a timestamp column cut to
whole seconds.

On Unix, `make install test` runs the suite against the locked dependencies.
`make test-runtime` exercises
registered tools, agent compilation, the Session
process, and SQLite persistence with deterministic model responses. It covers
handoff history, persisted control operations, mixed tool results, Stop, and
tool approval in real Session processes and the session plugin (the wait, the
recovery entry points, approval UI surfaces and failure injection).
Required runtime checks fail if a selected suite executes no cases. Set
`FRAMEWORK_DIR=/absolute/path/to/framework` to use local Agent, LLM, and test
sources instead of the locked published dependencies. CI checks both modes.

`make bench` writes local JSON reports
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
location or `TEST_CONFIG` for an external runtime configuration. An external
configuration must also carry the `app.forms:fixtures:directory` override that
`make prepare` writes, or the form fixture suites cannot find their files. These
targets require Wippy, Bash, jq, and SQLite; set `WIPPY` when it is not on PATH.

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
history uses, so clients read one field in both places. Session 0.6.8 sent
`status: cancelled` on this event instead; no released client read it, and the
event no longer carries it. History keeps `cancelled` in storage and exposes
`status: error` with `outcome: cancelled`, so old and new clients show a
settled result after a reload. Stop, a failed turn, an agent handoff and a command-bus failure cancel
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
model response's normalized `tokens.context_tokens` with the effective checkpoint
`token_threshold`. It checks tool continuations too, and schedules
the checkpoint before the next tool round and model step. The existing strict
`>` threshold is unchanged; reaching the threshold exactly does not trigger it.

Checkpoint options resolve in this order: session-wide defaults from
`token_checkpoint_threshold` (default 50000) and `checkpoint_function_id`, then
the agent's `agent_options.checkpoint` (trait behavior defaults followed by
explicit agent values), then the persisted `config.checkpoint` map. A nil
session-wide default sets nothing.
That map is read from persisted host configuration, not accepted implicitly by
the start token or `_control.config`. `enabled = false` disables scheduling;
an effective zero/nonpositive threshold disables automatic scheduling. Maps merge
recursively and lists replace, including an explicit empty list.

Upgrade note: an app that sets both an app-wide threshold and a per-agent
threshold now uses the per-agent threshold. Use `config.checkpoint` for an
explicit session override.

The scheduler captures detached effective options for each queued checkpoint,
so later config changes cannot alter that operation. A trait checkpoint binding
is attempted before the configured function fallback; both receive effective
`options`. A strict binding failure prevents fallback and checkpoint-state
writes. Without behaviors, the existing function path remains available.
When a checkpoint succeeds after a non-strict binding failure, the checkpoint
anchor's metadata retains the runtime diagnostics in `checkpoint_binding_errors`,
including when a later binding or the configured function supplies the summary.
Healthy checkpoints omit this field.

This is the current prompt size, not cumulative usage across the turn. Cached
input still occupies context even when `prompt_tokens` reports only a small
uncached suffix. The LLM module normalizes provider accounting; the session does
not add cache counters again.

The default summarizer checks its input against the context window of its resolved model,
caps `max_tokens` at that model's output limit, and asks for a summary below it. It
reads the arguments and result of every call row that replays to the model,
delegation and private calls included, within `max_tool_result_chars` per value.
These per-row clamps remain in place. With a resolved window, the conversation can
use all available input after the output reservation, safety margin, and fixed
prompt sections. An explicit `options.max_conversation_chars` still caps it; the
500,000-byte default applies only when no window resolves. If fitting the conversation
requires dropping bytes, the checkpoint fails without generating a summary.

Every tool result already appears in the conversation. The duplicate KEY TOOL RESULTS
section keeps only the newest `max_tool_results` (100 by default) and clamps them to
`max_tool_results_chars`. With a resolved window, it uses only the space left after
the conversation, and is omitted when none remains. Dropping these duplicate results
does not fail a checkpoint. A summary cut off at `max_tokens` is an error. On any
checkpoint failure, the previous summary and history anchor stay unchanged.

When a checkpoint fails on a prompt that still fits the agent model's window,
including its output reservation, the session sends the full prompt as it is and
tries again on the next step. If the prompt does not fit, the turn fails with a
visible error. A long session using a small-window summarizer can therefore keep
failing to compact while its history grows, eventually exhausting the agent's
window. It preserves that history instead of silently forgetting its beginning.
Use a summarizer with enough input capacity or checkpoint earlier to avoid this.

The conversation carries rolling cache markers so a provider can reuse the
stable history prefix on later requests. Caching is provider-dependent, can
expire or miss, and cached reads still have a cost. Checkpointing shortens the
active prompt after a successful summary; neither mechanism is a hard spending
limit or a preflight guarantee against one oversized tool result.

## Stable request prefix

Each request a session sends extends the previous one: everything sent before
the model's output is stored where it was sent and replayed unchanged, so the
provider cache and earlier thinking blocks stay valid. This requires Agent
0.5.10 and LLM 0.5.13 or later; publish them before the Session release and
refresh the dependency lock from the published packages.

- **Memory recall.** An agent with a memory contract recalls memory on each
  eligible step and returns the recall note in `context_notes`. The notes are
  stored, in order, as developer rows with `metadata.preserve_position` and
  `metadata.memory_ids`, after the step's lifecycle notes and before the step
  output. Notes and output commit in one batch, so a failed write leaves
  neither, and the failure is a storage error. Truncated and cancelled text
  keeps its notes; a step whose output is discarded discards them too. Assistant
  rows no longer carry `memory_ids` or `memory_count`.
- **Turn context.** When the agent declares `agent_options.turn_context` (the
  `time_aware` trait), the session renders the note once for a turn and stores it
  as a system row with `metadata.preserve_position` and
  `metadata.system_action = "turn_context"`. A user message that opens a turn
  renders it; so does a mid-turn handoff to a time-aware successor, when the turn
  has no note yet. The row follows that message, any rows written while recovered
  behavior controls settle at the start of the step, and any activation notes. It
  precedes the step's other notes. Tool continuation steps add none. A note that
  cannot render (an unknown timezone) fails the turn. The row is written once the
  turn has passed activation, lifecycle validation and the Stop gate, so a turn
  that ends at those gates leaves no note. It is written before the model call, so
  it stays when the provider fails or Stop arrives during the call. A retried turn
  or a reopened session finds the stored row and replays its minute. When a
  checkpoint removes the request and the request is restored, the
  note is restored with it. The prompt builder renders system rows that carry
  `preserve_position` in place; other system rows (turn and agent-change notices)
  stay out of the prompt.
- **Loaded traits.** A tool control that changes the trait list
  (`_control.config.traits`) still replaces the whole list. When the control adds
  traits, the session also stores `loaded_traits = { agent, keys }` on the tool
  call row, next to `control_operations`: the agent the call ran under and the
  keys of the traits that were not compiled before the control. The prompt
  builder passes it to the function result. An agent that sets
  `agent_options.trait_loading = "append"` uses it to render the trait where it
  was loaded (see Loaded traits in the Agent module), so the request after the
  load extends the previous one and keeps its thinking blocks. Nothing is
  recorded when the control adds no trait, when it also switches the agent, or
  with an Agent module that has no trait keys; such traits join the system
  prompt as before. Traits set by the session start function are never recorded:
  it leaves no call row.
- **Thinking blocks.** Assistant rows store the step's `prefix_fingerprint`
  and immutable `generation_checkpoint_id` next to their `thinking_blocks`.
  The generation field records the checkpoint at response persistence, after any
  in-step compaction; an empty string denotes no checkpoint yet. Checkpoints can
  update an anchor's `checkpoint_id`, but cannot overwrite its generation field.
  Every step passes `drop_stale_thinking = true` with a predicate that keeps blocks
  only when the row's fingerprint and generation checkpoint match the current ones.
  Rows without the generation field count as stale. An inclusive checkpoint keeps
  its anchor row in history, but that row's earlier generation remains stale.
  The current tool round always keeps its blocks.
- **Expired thinking.** Opt in with
  `agent_options.prompt_cache.drop_expired_thinking = true` on the agent or a
  trait. A model route cannot enable this feature. With the option unset or
  false, the session performs no extra model resolution and writes no cache
  tracking metadata. When a user
  message opens a turn after the session has been idle for longer than the
  prompt cache lifetime, the session stops replaying the thinking blocks of the
  completed turns before that message. Stored blocks remain unchanged; only
  their projection into later requests changes. The estimated lifetime is
  `agent_options.prompt_cache.ttl` of the agent that takes the turn, else
  `options.cache_ttl` of the first model-card route (`providers[1]`), else `5m`;
  `5m` and `1h` are known. The route is resolved only for an opted-in agent
  without an explicit TTL, once the shortest supported lifetime has passed.
  Cache writes (`tokens.cache_write_by_ttl`) extend the latest outstanding
  expiry time; a shorter later write never shortens it. A cache read refreshes
  the longest outstanding lifetime conservatively because read usage does not
  identify the lifetime of the prefix it reads. An unknown reported lifetime
  expires nothing. One minute is added to each expiry estimate. The idle time
  is measured from the last stored message or from the last model step,
  whichever is later. Both the configured idle lifetime and outstanding cache
  expiry must pass. The session stores the last step time, reported lifetime
  and latest expiry in `meta.model_step_at`, `meta.model_cache_ttl` and
  `meta.model_cache_expires_at` when a turn ends, so a restarted process reads
  them back. An estimate that expires too early can discard a warm prefix,
  increase token cost and latency, and remove reasoning context the model
  could otherwise use. An estimate that expires too late retains larger
  prompts longer. The session marks
  the opening message with `metadata.expires_thinking` before the first request
  of the turn, and the prompt builder leaves the blocks of every assistant row
  before the newest such message out of the prompt, so every later request sends
  the same history. Blocks leave only from the start of the history and never
  return, also after the option is turned off. A turn that follows without such
  a pause keeps replaying earlier blocks, and so does an agent without the
  option. A mark takes effect only when its message has text and the turn before
  it ended with an answer that has text. After a tool round with no such answer
  the message continues that round for the provider, which must keep its blocks,
  and a message without text can later render as nothing and join the turns
  around it; in both cases the blocks leave at the next marked message that
  qualifies. Other values of `ttl`, an unreadable timestamp and a turn that no
  admitted user message opened leave the history as it is. Only drivers that
  replay `thinking_blocks` (Claude and Bedrock) are affected.
- **Lifecycle notes.** Messages from `activate` and `before_step` are sent as
  positional notes after the history and stored once, where they were first sent:
  developer messages as developer rows and system messages as system rows, each
  with `metadata.preserve_position`, `metadata.lifecycle_phase` and
  `metadata.system_action = "lifecycle_note"`. A binding's own metadata contributes
  only `memory_ids`. `before_step` notes commit in one batch with the step output
  and are discarded with a discarded output, so each step adds one set. `activate`
  fires once, so its notes are stored when they fire and outlive a step whose
  output is discarded; a later checkpoint folds them into its summary like any other
  row. A lifecycle message in the user or assistant role fails the step: a host
  note must not speak as either party.
- **Stored rows.** A row renders as itself on every request. Developer rows render
  in place on every driver instead of joining the top-level instructions, and
  adjacent rows of one role never merge. Model text and lifecycle notes are stored
  only when they contain a non-space character. A tool round with blank text stores
  an empty assistant row, and a blank assistant row stays out of the prompt unless
  it holds the thinking blocks of its round. A user message with no text, files or
  attachments is rejected with `empty_message`; with attachments, the empty text
  part is omitted. Rows stored blank by earlier versions render as nothing.
- **Parallel tool rounds.** The calls of one response render together after its
  assistant row, then all their results, in the order the model produced them.
  Calls with no assistant row before them keep a call and its result together. This
  shape must ship in the first release that stores fingerprints: changing it later
  edits the prefix of every fingerprinted row.

Positional notes are ordinary rows outside the prompt too. The checkpoint
summarizer reads them as `[SYSTEM]` and `[DEVELOPER]` lines, and they count toward
`TITLE_TRIGGER_MESSAGE_COUNT`. Title generation leaves them out, since a title
describes the conversation and not the time it took place.

These history edits change the prefix by design:

- A tool result marked `stale` is replaced with a withdrawal notice.
- The attached-files note lists the filename and size the upload has when the
  prompt is built (`Unknown filename` once the upload is gone).
- Attention attachments that expire are withdrawn.
- A developer or system message a client injects is stored when it arrives. If a
  request is in flight, it lands before that request's output.
- Stop returns steering applied by the interrupted step to pending, and removes it
  from the prompt until a later step applies it again. The Stop boundary row commits
  with the Stop, so it precedes the notes and text the cancelled step stores
  afterwards.
- A memory addition changes the session context memory in the top-level system
  prompt, which also changes the prefix fingerprint. Memory stays there because it
  must survive checkpoints and can be deleted or cleared, which a positional row
  could not do.
- The restored request, with its turn note, leaves the prompt when the
  next user turn starts.
- A step whose output is discarded (a provider failure, Stop with no text, a
  truncated step with no text, which stores only the truncation notice) discards
  the `before_step` and recall notes it sent, so they do not replay.

The prompt cache restarts at the edited message and the API drops the thinking
blocks after it.

After upgrading, a stored parallel round renders in the new shape, so its cache
restarts once from that round. Its rows are not rewritten.

After upgrading, stored conversations restart their cache once: earlier steps
sent lifecycle notes that were never stored, stored rows that used to merge now
render separately, and assistant rows carry no `prefix_fingerprint`, so their
thinking blocks are stripped from the next request (except those of a tool round
in progress). Recall notes stored by earlier versions stay where they were written.

## Durable behavior controls

Opt-in trait behaviors can propose the shared declarative `_control` subset:
agent/model/trait/tool targets, session/public metadata, and `memory.compact`.
The response and its pending proposal marker are saved atomically. Tool and
delegation outcomes settle before a proposal takes effect. Recovery replays
persisted proposals without rerunning tools or taking another model step;
explicitly cancelled tool rounds do not apply their proposals.
Proposals apply in order. An explicit model, trait or tool target is retained
when switching agents, even if it matches the preceding agent's settings.

Replay is at-least-once: a crash between a declarative effect and its completion
marker can repeat it. External providers and lifecycle hooks must use stable
refs and idempotent writes, not rely on a final `deactivate` callback.

`memory.compact = true` persists a request that bypasses the token threshold,
not an explicit disable or a missing provider. False is not cancellation.
When a proposal also changes configuration, requested compaction captures the
committed agent/provider, not the old response's settings. An agent handoff
continues the current turn through the canonical replacement-agent
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
| Placement hint | `display_type` | `meta.display_type` |

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

`display_type` is a stored placement hint. The `instructions` flag determines
which messages this module writes and whether it queues an inline presentation
reference.

| `instructions` | Messages written | How it reaches the thread |
|---|---|---|
| `false` | `type="artifact"` with `metadata.artifact_id`, plus `system` `artifact_created` | the client renders the artifact message |
| `true` or omitted | a `developer` message carrying an embed instruction, plus `system` | a terminal assistant message carries `metadata.presentation.artifact_refs` for a compatible renderer |

The standalone artifact message is written only when `instructions` is exactly
`false`. Omitted instructions request inline delivery; setting `display_type`
alone does not switch delivery to a standalone message.

Render mode is independent of delivery. `instructions=false` with `type=inline`
puts content in its own artifact message. Inline delivery with `type=standalone`
provides a reference that a compatible client can present as a chip.

**Unreleased renderer contract:** the metadata fallback described here requires
a renderer that consumes `presentation.artifact_refs` outside the Markdown body
and deduplicates it against successfully rendered authored `<artifact>` tags.
That companion and its live SQLite/PostgreSQL checks remain prerequisites for
releasing this change. Older clients ignore the field and keep their existing
behavior; this backend change alone does not make a missing tag visible.

References belong to the creating turn. Session retains them through tool calls
and truncated responses, then attaches them to the next tool-free terminal
assistant record and its CONTENT update. Empty terminal text can still carry
references. Starting a new turn discards pending references from an interrupted
or cancelled turn. A stored truncated record still runs `after_persist` without
consuming the references.

The reserved metadata field has this shape:

```json
{"presentation":{"artifact_refs":[{"artifact_id":"generated-artifact-id"}]}}
```

Session derives these IDs from successful tool-created artifacts. Agent-supplied
`metadata.presentation` is ignored; unrelated agent metadata is preserved. No
markup is appended to model text, including unfinished Markdown fences.

Keep the stored `type` and `display_type` separate when returning artifact
metadata. To request a chip, set the render mode directly (`type="standalone"`).
Changing the placement hint does not change how the client draws the content.

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
        display_type = "standalone",   -- stored placement hint
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

An entry with an `id` updates that artifact, including when both `title` and
`content` are present. The update can set `content_type`, `description`,
`preview`, `icon` and `status` in `meta`. Other keys, such as `display_type`
and `page_id`, keep their values.

### HTTP API

`GET /artifact/{id}` returns metadata for one artifact.

| Field | Source |
|---|---|
| `uuid` | `artifact_id` |
| `session_id` | `session_id` |
| `type` | the `kind` column; for `view_ref`, `meta.display_type` |
| `kind` | the `kind` column |
| `display_type` | `meta.display_type` |
| `title`, `created_at`, `updated_at` | columns |
| `content_type`, `description`, `preview`, `icon`, `status` | from `meta` |
| `page_id`, `is_view_reference`, `params` | `view_ref` only |
| `content_version` | revision of the content; starts at 1 and rises by one each time the content changes |

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

Edits publish the current artifact metadata on `artifact:<id>` after commit.
Deletions publish `{ uuid, session_id, deleted: true }` on the same topic.
Only the owner’s connected clients receive these events.

### Limitations

- `kind` is stored verbatim from `type` with no enum check.
- A delegated tool call produces no artifact; the control payload is ignored.
- SQLite does not cascade artifact deletion with its session. Orphaned rows
  remain listable, and fetching one returns HTTP 404.

## Session Forms

Session forms let an agent ask the user structured questions in the chat and
get the answer back as an ordinary user message. A form is stored as a
`wippy-component-tag-1.0` artifact (see Artifacts above) with one extra
metadata key, `meta.session_form`; no new SQL table is used.

### Enable

Add one of the two traits to an agent:

```yaml
traits:
  # Choice questions only.
  - id: wippy.session.forms:ask_user
  # Or: choice questions and the standard fields.
  # - id: wippy.session.forms:ask_user_fields
```

| Trait | Tool it adds | Field types |
| --- | --- | --- |
| `wippy.session.forms:ask_user` | `ask_user` | `choice` |
| `wippy.session.forms:ask_user_fields` | `ask_user_fields` | `choice`, `text`, `textarea`, `number`, `email`, `date`, `checkbox` |

The tool creates a form and ends the turn. Each tool's schema lists only its
own field types, and the server refuses any other type from it with
`unsupported_type`, so an agent with `ask_user` can never create a form with
standard fields. Both traits also add `read_form` (read an earlier form's
questions, or its answer record, by `form_id`). Attach one of them: the two
tools have different names, so an agent with both gets both tools and both
prompts. Every agent, with or without a trait, gets a bounded index of the
session's forms injected into its prompt so it can find a form id.

### API

`GET` and `POST /artifact/{id}/state` read a form's canonical state and accept
its answer. Both are served by `wippy.session.forms:state_service` behind the
HTTP handling in `src/api/artifact_state_access.lua`. A submission
commits the accepted answer and its user message in one transaction, then
wakes the owning session process; a missed wake-up is recovered from the
stored row on the next session start.

A form holds choice fields (single or multiple selection, notes on a chosen
option, a free-text "Other" answer) and standard fields: `text`, `textarea`,
`email`, `number`, `date` and `checkbox`, each optional or required. A form
with only choice fields is form version 1; a form with any standard field is
version 2, and an older `wippy-form` shows a "needs a newer version" notice
for it. The server checks every answer, including a text field's `pattern`,
which the browser never evaluates.

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
for the full `ask_user`, `ask_user_fields` and `read_form` contract, the answer record shape, late
answers, and how an answer is admitted into the conversation, and
[Session Forms (frontend)](https://docs.wippy.ai/en/frontend/micro-frontends/session-forms)
for the `wippy-form` / `wippy-form-answers` components and the HTTP contract
from the browser side.

## Tool approval

Tool approval asks the user before a tool call runs. The user approves the
call, approves all calls of a kind, or denies it. The messages between the
Session and a chat client are in
[docs/tool-approval-protocol.md](docs/tool-approval-protocol.md).

### Turn it on

Add the trait to an agent. Every option is optional:

```yaml
traits:
  - id: wippy.session.traits:tool_approval
    context:
      require: marked
      approve_all: "off"
      timeout_seconds: 900
      max_requests_per_turn: 10
```

| Option | Default | Values |
| --- | --- | --- |
| `require` | `marked` | `marked`, `all` |
| `approve_all` | `off` | `off`, `batch`, `tool`, `session` |
| `timeout_seconds` | 900 | 30 to 3600 |
| `max_requests_per_turn` | 10 | 1 to 50 |

- With `require: marked`, only tools that set `approval` in their registry
  meta ask (`approval: required`, or `approval: { required: true,
  approve_all: true }`). Delegation calls never ask under `marked`. With
  `require: all`, every call needs approval, delegation calls included, but an
  Approve all grant can cover a call, and a repeat of a call denied earlier in
  the turn settles without a card. No tool is exempt because it only reads
  data.
- With `approve_all: "off"`, Approve all is offered only for a tool whose
  author set `approval.approve_all: true`.
- An invalid context, including an unknown key, fails the turn with
  `tool_approval_config_invalid` before any model call.
- Activation is sticky. The first agent step with the trait stores the settings in
  the session. Switching to an agent without the trait does not
  turn approval off, and the stricter `require` wins.

`GET /api/v1/sessions/capabilities` reports `tool_approval: 1` when the Session
supports it. A chat client must declare an approval surface for the session
(see the protocol document). With a client that does not support the
capability, every call that needs approval settles at once as not run
(`approval_ui_unavailable`), and the turn ends with a notice.

If a client declared a surface before and none is live now, the request stays
pending for a 120 second grace period, or until its deadline.

### Operator switch

The `tool_approval_enforcement` requirement of `wippy/session` (environment
variable `SESSION_TOOL_APPROVAL_ENFORCEMENT`) is `enforce` by default. The
value `off` skips the approval gate for every session and logs a warning for
each skipped check. This is a security downgrade, meant for rollback. Any other
value reads as `enforce`. It skips only the gate. The trait is still
validated, so an invalid context still fails the turn. The activation is still
stored, so the Web Host still isolates content and the `isolation_required`
refusal below still applies.

```yaml
- name: dep.wippy.session
  kind: ns.dependency
  component: wippy/session
  parameters:
    - name: tool_approval_enforcement
      value: "off"
```

### Artifacts in protected sessions

The Web Host cannot isolate JSON or packaged web content. In a protected
session the Session refuses a `_control.artifacts` item that holds such
content, new or as an update leaves it. That includes a number or a boolean,
and text that parses as a JSON number, boolean or null. It allows HTML,
markdown, a JSON string, a Session form tag (`wippy-form`) without `on*`
props, and `view_ref` items. One refused item refuses the whole
`_control.artifacts` list of the call, and nothing is written. The tool call
fails with an error that starts with `isolation_required:`, and the model can
return HTML or markdown instead.

### Known limits

- Only tool calls of chat sessions are checked. Dataflow, Temporal, CLI loops
  and direct `funcs.call` are not.
- Tools that a delegated child agent calls are not checked.
- A pending approval does not survive a Session process restart. Recovery
  reports the call as not run or as an unknown outcome. No call runs again.
- Approval protects against the model, tool results and other users. It does
  not protect against code that already runs as the user in the browser, such
  as an app page.
- Where the registry cannot pin a tool version, a small race remains between
  the recheck at release and the start of the call.
- Deleting a session while its process runs ends that process with an error.
  This was already so before tool approval.

## Upgrading to 0.7.0

Session 0.7.0 adds Session Forms. Check these points before you upgrade.

- **New requirement `ui_server`.** The module now serves the `wippy-form` and
  `wippy-form-answers` bundles from an HTTP server. The default is
  `app:gateway`. If your HTTP server has another name, the static routes
  (`/wippy-session-forms` and `/wippy-session-form-answers`) do not work until
  you set the parameter on the dependency:

  ```yaml
  - name: dep.wippy.session
    kind: ns.dependency
    component: wippy/session
    parameters:
      - name: ui_server
        value: app:your_server
  ```

- **Web Host 1.0.65 or later.** The form card needs the Host's artifact-state
  API. An older Host shows the questions disabled and cannot send answers.
- **Other users' artifacts answer 404, not 403.** `GET /artifact/{id}` and
  `GET /artifact/{id}/content` answer an artifact that belongs to someone else
  exactly like a missing one. A client that reads the 403 must read the 404.
- **Sessions finish 10 seconds after the last client leaves.** The plugin used
  to finish them as soon as the last client disconnected. A client that
  connects again within the 10 seconds cancels the wait, so a page reload does
  not end a turn.
- **An enforced Stop leaves the session idle.** When a turn does not stop in
  time and the plugin has to cancel the session process, the session is
  stored as `idle` (it was `failed`), clients get no error, and Send stays
  enabled. Form answers accepted during that turn are admitted without
  starting a new turn.
- **Steering accepted after a turn's first message stays after it.** A steering
  row accepted after the row that starts the turn is anchored after that row,
  so the model reads the two in the order they were accepted. Steering left
  pending by a stopped or recovered turn still goes ahead of the new message.
- **A stored `running` status reads as `idle`** while no session process is
  registered for the session. This is what the API returns for a turn that a
  crash or a restart cut off. The stored row is not changed.

[wippy-documentation]: https://docs.wippy.ai
[releases-page]: https://github.com/wippyai/module-session/releases

### Outgoing prompt checkpoints (pending upstream admission support)

When Agent requests compaction before model dispatch, Session commits an explicit
exclusive checkpoint boundary: the summary replaces completed history through the
anchor, while the originating user request is restored at user authority. Stored
tool results remain intact. The boundary and request reference are committed with
the summary; a failed write leaves the previous prompt usable. Reopening a session
honors that boundary, and pending input remains queued for its normal safe boundary.
Existing checkpoints and explicit `messages():after(id)` queries remain inclusive.

This path requires Agent 0.5.9 and LLM 0.5.11 or later, which provide the checkpoint
callback and prompt-admission capability released from Framework #203. Session's
dependency minimums and test lock require those published versions.

Run `make test-admission` to check the published dependencies. For a source composition,
use `make test-admission FRAMEWORK_DIR=/path/to/framework`. Both forms fail rather than
skip when the checkpoint callback capability is unavailable.
