# Session module — test and lint helpers.
#
# Everything runs from the test/ harness, which pulls the module in through
# workspace.replacements in test/.wippy.yaml. app:db is file-backed rather than
# :memory: because a plain in-memory DB gives each pooled connection its own
# empty database, so the schema can vanish under parallel test connections.
# `make test` recreates the DB each run for a clean slate.
#
# build-ui / ui-dev build the wippy-form and wippy-form-answers web
# components (frontend/wippy-form, frontend/wippy-form-answers — each its
# own npm package, the Session module has no pnpm workspace) into
# src/forms/ui/dist/ and src/forms/ui/answers-dist/, which
# src/forms/ui/_index.yaml serves. build-ui uses `npm ci` for a
# reproducible install from each package's committed package-lock.json;
# run `npm install` by hand in the package first if its lockfile is
# missing or out of date. Each `cd && npm ci && npm run build` line runs
# in its own subshell — a failure in either package's ci/build aborts the
# target before the other package (if it hasn't run yet) is attempted.
#
# test-ui / lint-ui follow the same per-package `npm ci` pattern as
# build-ui (each line its own subshell; a failure in the first package
# aborts before the second is attempted). lint-ui also runs `vue-tsc
# --noEmit` for wippy-form, which renders .vue SFCs and depends on
# vue-tsc; wippy-form-answers has no .vue files and no vue-tsc dependency,
# so it gets ESLint only. check-ui (scripts/check-ui.mjs) fails when a
# fresh build of either package differs from its committed dist/
# answers-dist output, or when src/forms/ui/_index.yaml's hand-copied
# registry metadata disagrees with the owning package.json's `wippy`
# block (see the script's own header for why this is a check rather than
# a generator). verify chains the backend and UI gates CI runs separately,
# so a full local check is one command instead of five.

TEST_DIR         := test
TEST_DB          := .wippy/test.db
UI_DIR           := frontend/wippy-form
UI_ANSWERS_DIR   := frontend/wippy-form-answers

.PHONY: test lint install clean build-ui ui-dev ui-dev-answers test-ui lint-ui check-ui verify

test: clean
	cd $(TEST_DIR) && wippy test

lint:
	cd $(TEST_DIR) && wippy lint --level error

install:
	cd $(TEST_DIR) && wippy install

clean:
	cd $(TEST_DIR) && rm -f $(TEST_DB) $(TEST_DB)-wal $(TEST_DB)-shm

build-ui:
	cd $(UI_DIR) && npm ci && npm run build
	cd $(UI_ANSWERS_DIR) && npm ci && npm run build

# wippy-form's own dev watcher. wippy-form-answers' equivalent is the
# separate `ui-dev-answers` target below, not merged into this one: `npm
# run dev` runs `vite build --watch`, which blocks forever, so two of them
# cannot sensibly share one sequential recipe.
ui-dev:
	cd $(UI_DIR) && npm run dev

ui-dev-answers:
	cd $(UI_ANSWERS_DIR) && npm run dev

test-ui:
	cd $(UI_DIR) && npm ci && npm test
	cd $(UI_ANSWERS_DIR) && npm ci && npm test

lint-ui:
	cd $(UI_DIR) && npm ci && npm run lint && npx vue-tsc --noEmit
	cd $(UI_ANSWERS_DIR) && npm ci && npm run lint

check-ui:
	node scripts/check-ui.mjs

verify: test lint test-ui lint-ui check-ui
