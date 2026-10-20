# Changelog

## Unreleased

### Bug Fixes

* Preserve manual session names during automatic title generation. Running sessions publish both title paths through the existing owner using the stored title; renaming a stopped session persists without starting it.
* Keep the originating user-request text in prompts after a mid-turn checkpoint, alongside the summary and newest tool results. Preserve user authority, avoid reloading summarized attachments, and keep later user turns distinct from the checkpointed request. Bound restored excerpts to 6000 UTF-8 bytes while retaining both ends, and place the original task before retained steering even when its anchor is unavailable. The resume note preserves later corrections and completed progress.
* When this fix and Agent's background-memory recall clarification are published and installed, affected users can remove their local checkpoint-task and memory-label patches. These changes are not included in Session 0.6.8.
* PostgreSQL also requires the Runtime SQL timestamp-precision fix ([runtime #983](https://github.com/wippyai/runtime/pull/983)) so checkpoint cursors retain fractional seconds.

## [0.6.9](https://github.com/wippyai/session/compare/v0.6.8...v0.6.9) (2026-10-20)


### Features

* keep the route pinned by an llm fallback for the rest of the turn ([fbe2e84](https://github.com/wippyai/session/commit/fbe2e845d9896101f32356532a7910b9a2e8c8cc))
* **session:** apply agent behavior controls after tool settlement ([#40](https://github.com/wippyai/session/issues/40)) ([e9d3dd2](https://github.com/wippyai/session/commit/e9d3dd29846c064cdb5de7424a676e5fb32e6e37))
* **session:** send outcome cancelled on cancelled function_error events ([555d61b](https://github.com/wippyai/session/commit/555d61b1f5929342f57df9e2e12bde5d5a79b893))


### Bug Fixes

* clear pinned routes after committed model switches ([def8fbb](https://github.com/wippyai/session/commit/def8fbbb0263f2107388df42924759806fbc627b))
* close stopped steps through the lifecycle hooks ([5182fbb](https://github.com/wippyai/session/commit/5182fbbd10f7d9fe301d9af153a6fa9cf890c760))
* persist checkpoint state atomically ([4280dad](https://github.com/wippyai/session/commit/4280dadb05b09348a449d81d47b19bf47450c38c))
* persist checkpoint state atomically ([c1182af](https://github.com/wippyai/session/commit/c1182afe82562c3af8e1b337bf6f70fa7fe47ed5))
* preserve end-hook status for deleted sessions ([f24631c](https://github.com/wippyai/session/commit/f24631ccd1cffa50e3ffcce4da873ac972cf0185))
* preserve explicitly named session titles ([42ac5fb](https://github.com/wippyai/session/commit/42ac5fbaa0539d0b9a6e4a6c11b631ff1870080f))
* publish all titles through the owner and allow offline renames ([b04304d](https://github.com/wippyai/session/commit/b04304dfba29d69151dbec7e0aa2c505cc1c3c41))
* publish authoritative session state for delayed external events ([2b02223](https://github.com/wippyai/session/commit/2b02223a99403fc178de1e62c0d9683dc572e987))
* require Agent 0.5.5 for complete checkpoint continuation ([b06a379](https://github.com/wippyai/session/commit/b06a37905f269343ad29d77fd73ee1d20c810652))
* require Agent memory labeling for checkpoint continuation ([30fbe96](https://github.com/wippyai/session/commit/30fbe96a45b0de88c27bcb8be6bcb5d64bf045ba))
* retain canonical lifecycle finish and clarify explicit continuation ([d52c9c1](https://github.com/wippyai/session/commit/d52c9c159480010e2498534e3b515b844b2fb104))
* retire deleted session owners without recovery notices ([1c8fb10](https://github.com/wippyai/session/commit/1c8fb10225d54a74762f1d7de37479860d765304))
* retire deleted session owners without recovery notices ([52a4a9a](https://github.com/wippyai/session/commit/52a4a9a83866d7335fac7f29208155e2a364333f))
* **session:** cancel in-flight model and tool calls on Stop ([0798126](https://github.com/wippyai/session/commit/079812607eac76a0ce0161bc72474ef18425c3ec))
* **session:** cancel in-flight model and tool calls on Stop ([714d733](https://github.com/wippyai/session/commit/714d733d4da120eaed211f5d987c473773f20774))
* **session:** preserve Stop and recovery intent in subsequent prompts ([321cf12](https://github.com/wippyai/session/commit/321cf1288dddd90837de2b14071748f8df3178da))
* **session:** preserve task ordering and bound checkpoint excerpts ([599b1b4](https://github.com/wippyai/session/commit/599b1b42629834c26cdb25286874098a93397a0f))
* **session:** retain the active user request across checkpoints ([a0c322a](https://github.com/wippyai/session/commit/a0c322a40a00baed48b5cbd1157c88fde4aeecf6))
* **session:** retain the user task across mid-turn checkpoints ([485bc9f](https://github.com/wippyai/session/commit/485bc9f551838d37c854a1a6e6b014c1d0f8093e))
* **session:** send only outcome on cancelled function_error events ([#82](https://github.com/wippyai/session/issues/82)) ([9a579cf](https://github.com/wippyai/session/commit/9a579cf343df3b2fe7641129aa5c27f4864effff))
* **session:** unify title updates and preserve offline renames ([807f73c](https://github.com/wippyai/session/commit/807f73cfef343956ff9741e0ca9d40c9c9458eda))

## [0.6.8](https://github.com/wippyai/session/compare/v0.6.7...v0.6.8) (2026-10-14)


### Bug Fixes

* Disconnect, chat close, inactivity, and session-capacity retirement let accepted turns finish and persist their model, tool, and handoff results before exit. Reconnecting cancels pending retirement; explicit Stop remains effective. Cancelled public calls settle through a terminal error event and through the history API.
* With Relay 0.3.17 and Session 0.6.8 installed, affected users can remove the local backend wind-down and cancellation-settlement patches after checking the published versions in their environment.

* harden tool controls and persisted handoffs ([#61](https://github.com/wippyai/session/issues/61)) ([e8cce7c](https://github.com/wippyai/session/commit/e8cce7c0d2507bf897724f955f991b1dbf5caf92))
* **session:** drain accepted work before lifecycle retirement ([#65](https://github.com/wippyai/session/issues/65)) ([7b7e2b4](https://github.com/wippyai/session/commit/7b7e2b413b0ccf34f1d5e2cd9113d57794b6d0d3))

### Dependencies

* Require Agent 0.5.4 and LLM 0.5.7 so Stop during prompt construction prevents another provider call and positional conversation messages retain their order.

## [0.6.7](https://github.com/wippyai/session/compare/v0.6.6...v0.6.7) (2026-10-09)


### Features

* add Attention context and compatible optimistic delivery ([#60](https://github.com/wippyai/session/issues/60)) ([1eb65e7](https://github.com/wippyai/session/commit/1eb65e7e02859e0b042509832e46bddd434dba6f))

## [0.6.7] (2026-10-07)

Attention features require Web Host 1.0.61, Agent 0.5.3 and LLM 0.5.5. Use Relay 0.3.16 to forward the initial Attention setting through WebSocket session opening.

### Features

* Sessions support per-session Attention settings and authorized browser reads and actions. Fresh explicit reads remain available when automatic context attachment is off.
* Context attachments use a kind/version envelope with strict payload validation. The receiver supports inline delivery and authenticated HTTP staging.
* Approved PNG and WebP captures can supply image content through `wippy.attention.visual` attachments. Capture approval creates a removable Host draft, and the image is submitted only on a later explicit Send.

### Bug fixes

* Message admission validates and persists user text, file references and required context atomically. Committed permission and status are announced before the one existing correlated `received` response.
* Attention inspection keeps its existing time limit and now uses fractional server receive times, avoiding deadline loss from whole-second rounding.
* Prompt construction lists ordinary files instead of automatically inlining every image. Image content is included only through authorized visual context attachments.

### Changed

* Attention traits withdraw expired or superseded observations through existing message-ID metadata updates and `metadata.stale`. Prompt construction preserves matching tool calls and results while replacing stale observations with a bounded notice.
* Authenticated capability discovery lets the Host select supported Attention features. Ordinary chat keeps its existing commands and receipts, and browser-operation terminal results remain separate from message acceptance.
* V1 does not collect page URLs, route owners or Vue renderer details. Context kind/version handling preserves extension without adding those fields to V1.
## [0.6.6](https://github.com/wippyai/session/compare/v0.6.5...v0.6.6) (2026-10-06)


### Bug Fixes

* continue the turn with the new agent after a tool-driven handoff ([#59](https://github.com/wippyai/session/issues/59)) ([f0219a6](https://github.com/wippyai/session/commit/f0219a628b148306a9a06f3926fef006d69c76cd))
* preserve tool feedback chronology and failed-action loop accounting ([#55](https://github.com/wippyai/session/issues/55)) ([06464d1](https://github.com/wippyai/session/commit/06464d1c7a8b807068a10c4b1a36662ba5c4b966))


### Performance Improvements

* **process:** reuse session receive cases ([#56](https://github.com/wippyai/session/issues/56)) ([4393c3a](https://github.com/wippyai/session/commit/4393c3a04c40bd83342ad0b5935baff8849684c5))

## [0.6.5](https://github.com/wippyai/session/compare/v0.6.4...v0.6.5) (2026-10-01)


### Bug Fixes

* **process:** correlate tool events with persisted message IDs ([#52](https://github.com/wippyai/session/issues/52)) ([34652b8](https://github.com/wippyai/session/commit/34652b814e4566d987cfbb6685e4bf0462350518))
* **process:** trigger checkpoints on the full context size ([#47](https://github.com/wippyai/session/issues/47)) ([83566b5](https://github.com/wippyai/session/commit/83566b55d66b71dc7be312d67fabccb8abb79367))

## [0.6.4](https://github.com/wippyai/session/compare/v0.6.3...v0.6.4) (2026-10-01)


### Bug Fixes

* apply the initial agent and model before the first turn ([#50](https://github.com/wippyai/session/issues/50)) ([da1eaca](https://github.com/wippyai/session/commit/da1eacad68c22f3c43978df616c1a4aecc45f347))

## [0.6.3](https://github.com/wippyai/session/compare/v0.6.2...v0.6.3) (2026-09-29)


### Features

* **EE2-2448:** add session-owned steering policy ([#48](https://github.com/wippyai/session/issues/48)) ([bd7fffd](https://github.com/wippyai/session/commit/bd7fffd45705f1184a2434fa863e89f408b055b7))

## [0.6.2](https://github.com/wippyai/session/compare/v0.6.1...v0.6.2) (2026-09-28)


### Bug Fixes

* announce SESSION_OPENED before the first upstream event ([#44](https://github.com/wippyai/session/issues/44)) ([15e9da3](https://github.com/wippyai/session/commit/15e9da3264e7ebe15c1fe4ae00e2367bdc33f403))
* **process:** send message_received after the message is persisted ([#45](https://github.com/wippyai/session/issues/45)) ([4fded17](https://github.com/wippyai/session/commit/4fded17e60373a13a5d9fefc6f05cca7133f4f9c))

## [0.6.1](https://github.com/wippyai/session/compare/v0.6.0...v0.6.1) (2026-09-28)


### Bug Fixes

* **process:** keep user input out of an in-flight agent turn and make stop escalate ([#38](https://github.com/wippyai/session/issues/38)) ([e45d2cd](https://github.com/wippyai/session/commit/e45d2cd67cce1fba9fb7f8cd845cd386e6891e35))

## [0.6.0](https://github.com/wippyai/session/compare/v0.5.0...v0.6.0) (2026-09-26)


### Features

* **prompt:** cache the conversation history with a rolling history_tail marker ([#39](https://github.com/wippyai/session/issues/39)) ([7ef1613](https://github.com/wippyai/session/commit/7ef1613b4bb60f362daa61cc11d23ce7a6b9a568))

## [0.5.0](https://github.com/wippyai/session/compare/v0.4.1...v0.5.0) (2026-09-23)


### Features

* **api:** actor-scoped artifact catalog, plus artifact creation and metadata fixes ([#30](https://github.com/wippyai/session/issues/30)) ([ce4a496](https://github.com/wippyai/session/commit/ce4a496b7439a7bad015becdd39481bb11dd9716))
* **artifacts:** store content_version instead of returning a literal ([#34](https://github.com/wippyai/session/issues/34)) ([fe8847c](https://github.com/wippyai/session/commit/fe8847c68eec05fefe376d3aef3677ec733a0f13))
* **prompt:** let a tool withdraw its own result with metadata.stale ([#35](https://github.com/wippyai/session/issues/35)) ([e91ff31](https://github.com/wippyai/session/commit/e91ff31e33e0f310fb5f2fa0b9b17fed5f6675c8))


### Bug Fixes

* checkpoint on every agent step and drop the 250-message limit ([#37](https://github.com/wippyai/session/issues/37)) ([28f7c6a](https://github.com/wippyai/session/commit/28f7c6a9b540c01269e4ecfea966d18391db3be4))

## [0.4.1](https://github.com/wippyai/session/compare/v0.4.0...v0.4.1) (2026-08-17)


### Bug Fixes

* **artifacts:** render standalone artifacts (emit type=artifact message) ([5cd464b](https://github.com/wippyai/session/commit/5cd464bdbffb4f0c8f0e90e687641ad085cb1083))

## [0.4.0](https://github.com/wippyai/session/compare/v0.3.8...v0.4.0) (2026-07-09)


### Features

* add basic implementation ([e3bc3d7](https://github.com/wippyai/session/commit/e3bc3d7a0c3fb73823b9648cc8a961c0e4a3b041))
* add dependencies for LLM, migration, actor, agent, and testing components ([800e9d3](https://github.com/wippyai/session/commit/800e9d3dc3a8caec11e8fc09cf508de8e6ec67fb))
* add user_id to artifacts and make session_id optional ([#1](https://github.com/wippyai/session/issues/1)) ([0c4d40b](https://github.com/wippyai/session/commit/0c4d40bb19640c43d873361eecde6c1030a262f4))
* Add user_id to artifacts and make session_id optional ([#10](https://github.com/wippyai/session/issues/10)) ([cfd82e4](https://github.com/wippyai/session/commit/cfd82e403690ee0e397a0592b97186ce52e7daea))
* **ci:** adopt release-please for automated releases ([#27](https://github.com/wippyai/session/issues/27)) ([3cb35d9](https://github.com/wippyai/session/commit/3cb35d9b97a9ee82884a07d807b6318c18153441))
* implement artifact handling and metadata updates ([5636912](https://github.com/wippyai/session/commit/56369125da94305b5ff280ad1b1e3a04e18a0860))
* migrate hardcoded `app:*` values to environment variables ([db4d320](https://github.com/wippyai/session/commit/db4d3201522c31ff85cf8c370633903289214591))
* polishing ([61f1fa7](https://github.com/wippyai/session/commit/61f1fa7d5ee75b94ed6d441da48c8087674447f7))
* **session:** route checkpoints through agent contract bindings ([1154f48](https://github.com/wippyai/session/commit/1154f48c97ba366082f24bb0cea047e1c605e2bd))
* update module ([#7](https://github.com/wippyai/session/issues/7)) ([7d6d6cd](https://github.com/wippyai/session/commit/7d6d6cdb815caf1e1214f721ea462c54a0bac9da))


### Bug Fixes

* artifacts automatically stick to user session ([#11](https://github.com/wippyai/session/issues/11)) ([260db86](https://github.com/wippyai/session/commit/260db8627de613dfc18c9ac1a5af22ad8e8625b9))
* Fix the initialization function execution ([#12](https://github.com/wippyai/session/issues/12)) ([7a3d8f5](https://github.com/wippyai/session/commit/7a3d8f5e7c9bf4e7d8ee1da732e797345ffc7de0))
* Fix users table name in migrations ([#13](https://github.com/wippyai/session/issues/13)) ([790175e](https://github.com/wippyai/session/commit/790175eaa4992085e6d7d64b67c4c014531ffb08))
* Improve order of operations with the session context ([1d538d5](https://github.com/wippyai/session/commit/1d538d56b3f27273faa5101a5b61937c9a810fb4))
* make on_session_end_func_id optional with an empty default ([128f1c6](https://github.com/wippyai/session/commit/128f1c62302cf202af133818f239944c61e30541))
* **session:** remove duplicate file provider contract ([77274b1](https://github.com/wippyai/session/commit/77274b12e2a37ffebde8a75ff4315b4c81aec35e))
* stability and simplification ([#9](https://github.com/wippyai/session/issues/9)) ([18b63ec](https://github.com/wippyai/session/commit/18b63ec5b5404b847e1e0136b70c20df6111639f))
* Stabilizes session statuses ([#8](https://github.com/wippyai/session/issues/8)) ([c7ef819](https://github.com/wippyai/session/commit/c7ef8196d62d83dabdc051798bbec9a13501995b))
