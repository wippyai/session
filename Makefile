# Session module — test and lint helpers.
#
# Everything runs from the test/ harness, which pulls the module in through
# workspace.replacements in test/.wippy.yaml. app:db is file-backed rather than
# :memory: because a plain in-memory DB gives each pooled connection its own
# empty database, so the schema can vanish under parallel test connections.
# `make test` recreates the DB each run for a clean slate.

TEST_DIR := test
TEST_DB  := .wippy/test.db

.PHONY: test lint install clean

test: clean
	cd $(TEST_DIR) && wippy test

lint:
	cd $(TEST_DIR) && wippy lint --level error

install:
	cd $(TEST_DIR) && wippy install

clean:
	cd $(TEST_DIR) && rm -f $(TEST_DB) $(TEST_DB)-wal $(TEST_DB)-shm
