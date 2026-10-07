WIPPY ?= wippy
TEST_ARTIFACTS ?= /tmp/wippy-session-tests
TEST_DIR ?= $(TEST_ARTIFACTS)/workspace
TEST_CONFIG ?= $(abspath $(TEST_DIR))/.wippy.yaml
TEST_DB ?= $(TEST_ARTIFACTS)/test.db
TEST_BACKUP_DIR ?= $(TEST_ARTIFACTS)/backups
TEST_FILTER ?=
FRAMEWORK_DIR ?=
BENCH_WARMUP ?= 5
BENCH_SAMPLES ?= 30
BENCH_SIZES ?= 1,8,32
BENCH_REVISION ?= $(shell git rev-parse HEAD)
BENCH_FRAMEWORK_REVISION ?= $(if $(FRAMEWORK_DIR),$(shell git -C "$(FRAMEWORK_DIR)" rev-parse HEAD),locked)

.PHONY: test test-runtime bench lint install prepare clean

test: clean
	mkdir -p "$(TEST_ARTIFACTS)/benchmarks"
	cd "$(TEST_DIR)" && WIPPY_TEST_REPOSITORY="$(CURDIR)" WIPPY_TEST_ARTIFACTS="$(abspath $(TEST_ARTIFACTS))" "$(WIPPY)" test --config "$(TEST_CONFIG)" \
		-o "app:db:file=$(abspath $(TEST_DB))" \
		-o "app:env_storage:file_path=$(abspath $(TEST_ARTIFACTS))/test.env" \
		-o "app.runtime:benchmark_output:directory=$(abspath $(TEST_ARTIFACTS))/benchmarks" \
		$(if $(strip $(TEST_FILTER)),test -- "$(TEST_FILTER)")

test-runtime: TEST_FILTER = app.runtime:handoff_runtime
test-runtime:
	@test -n "$(FRAMEWORK_DIR)" || { echo 'Set FRAMEWORK_DIR to use the required runtime test runner' >&2; exit 1; }
	$(MAKE) install
	WIPPY_TEST_REQUIRE_CASES=1 $(MAKE) test TEST_FILTER="$(TEST_FILTER)"

bench:
	@set -eu; for size in $(subst $(COMMA), ,$(BENCH_SIZES)); do \
		WIPPY_BENCH_SIZE="$$size" WIPPY_BENCH_WARMUP="$(BENCH_WARMUP)" WIPPY_BENCH_SAMPLES="$(BENCH_SAMPLES)" \
		WIPPY_BENCH_REVISION="$(BENCH_REVISION)" WIPPY_BENCH_RUNTIME="$$("$(WIPPY)" version)" \
		WIPPY_BENCH_FRAMEWORK_REVISION="$(BENCH_FRAMEWORK_REVISION)" \
		$(MAKE) test-runtime TEST_FILTER=app.runtime:handoff_benchmark; \
	done

COMMA := ,

lint:
	cd "$(TEST_DIR)" && "$(WIPPY)" lint --config "$(TEST_CONFIG)" --level error

install: prepare
	cd "$(TEST_DIR)" && "$(WIPPY)" install --config "$(TEST_CONFIG)"

prepare:
	bash scripts/test-workspace.sh "$(CURDIR)" "$(TEST_DIR)" "$(FRAMEWORK_DIR)"

clean:
	bash scripts/prepare-test-db.sh "$(TEST_DB)" "$(TEST_BACKUP_DIR)"
