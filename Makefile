# Session module — test and lint helpers.
#
# Tests run from the test/ harness. app:db is file-backed rather than :memory:
# because a plain in-memory DB gives each pooled connection its own empty
# database, so the schema can vanish under parallel test connections.
# `make test` recreates the DB each run for a clean slate.

TEST_DIR := test
TEST_DB  := .wippy/test.db
WIPPY ?= wippy
TEST_CONFIG ?=
TEST_CONFIG_ARG := $(if $(TEST_CONFIG),--config $(TEST_CONFIG))

.PHONY: test lint install clean

test: clean
	cd $(TEST_DIR) && $(WIPPY) test -c $(TEST_CONFIG_ARG)

lint:
	cd $(TEST_DIR) && $(WIPPY) lint

install:
	cd $(TEST_DIR) && $(WIPPY) install

clean:
	cd $(TEST_DIR) && rm -f $(TEST_DB) $(TEST_DB)-wal $(TEST_DB)-shm
