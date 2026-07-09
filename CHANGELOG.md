# Changelog

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
