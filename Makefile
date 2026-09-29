# Session module — test and lint helpers.
#
# Everything runs from the test/ harness, which pulls the module in through
# workspace.replacements in test/.wippy.yaml. app:db is file-backed rather than
# :memory: because a plain in-memory DB gives each pooled connection its own
# empty database, so the schema can vanish under parallel test connections.
# `make test` recreates the DB each run for a clean slate.
#
# build-ui / ui-dev build the wippy-form web component (frontend/wippy-form,
# its own npm package — the Session module has no pnpm workspace) into
# src/forms/ui/dist/, which src/forms/ui/_index.yaml serves. build-ui uses
# `npm ci` for a reproducible install from the committed package-lock.json;
# run `npm install` by hand in frontend/wippy-form first if the lockfile is
# missing or out of date.

TEST_DIR := test
TEST_DB  := .wippy/test.db
UI_DIR   := frontend/wippy-form

.PHONY: test lint install clean build-ui ui-dev

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

ui-dev:
	cd $(UI_DIR) && npm run dev
