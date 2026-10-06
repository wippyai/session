# Session module — test and lint helpers.
#
# Everything runs from the test/ harness, which pulls the module in through
# workspace.replacements in test/.wippy.yaml. app:db is file-backed rather than
# :memory: because a plain in-memory DB gives each pooled connection its own
# empty database, so the schema can vanish under parallel test connections.
# `make test` recreates the DB each run for a clean slate.
#
# TEST_CONFIG names an extra runtime config, for example one that replaces
# dependency modules with local checkouts.

TEST_DIR := test
TEST_DB  := .wippy/test.db
WIPPY ?= wippy
TEST_CONFIG ?=
TEST_CONFIG_ARG := --config .wippy.yaml $(if $(strip $(TEST_CONFIG)),--config "$(TEST_CONFIG)")

.PHONY: test lint install clean

test: clean
	cd $(TEST_DIR) && $(WIPPY) test $(TEST_CONFIG_ARG)

lint:
	cd $(TEST_DIR) && $(WIPPY) lint $(TEST_CONFIG_ARG) --level error

install:
	cd $(TEST_DIR) && $(WIPPY) install

clean:
	cd $(TEST_DIR) && rm -f $(TEST_DB) $(TEST_DB)-wal $(TEST_DB)-shm
