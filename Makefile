WIPPY ?= wippy
TEST_ARTIFACTS ?= /tmp/wippy-session-tests
TEST_DIR ?= $(TEST_ARTIFACTS)/workspace
TEST_CONFIG ?= $(abspath $(TEST_DIR))/.wippy.yaml
TEST_DB ?= $(TEST_ARTIFACTS)/test.db
TEST_BACKUP_DIR ?= $(TEST_ARTIFACTS)/backups
TEST_FILTER ?=
POSTGRES_TEST_OVERRIDES ?=
POSTGRES_TEST_FILTER ?= app.persist:checkpoint_repo_test app.persist:writer_metadata_test app.persist:control_refresh_test app.persist:session_repo_test app.runtime:handoff_runtime app.runtime:checkpoint_runtime app:lifecycle_disconnect_test
FRAMEWORK_DIR ?=
PGHOST ?= localhost
PGPORT ?= 5433
PGDATABASE ?= session_test
PGUSER ?= kickside
PGPASSWORD ?= kickside
BENCH_WARMUP ?= 100
BENCH_SAMPLES ?= 100
BENCH_SIZES ?= 1,8,32
BENCH_MEMORY_OPERATIONS ?= 256
BENCH_METADATA_SIZES ?= 128,4096
BENCH_METADATA_MEMORY_OPERATIONS ?= 2048
BENCH_EXACT_ALLOCATIONS ?= 1
BENCH_REVISION ?= $(shell git rev-parse HEAD)
BENCH_FRAMEWORK_REVISION ?= $(if $(FRAMEWORK_DIR),$(shell git -C "$(FRAMEWORK_DIR)" rev-parse HEAD),locked)

.PHONY: test test-runtime test-postgres test-postgres-full bench lint install prepare clean

test: clean
	mkdir -p "$(TEST_ARTIFACTS)/benchmarks"
	cd "$(TEST_DIR)" && WIPPY_TEST_REPOSITORY="$(CURDIR)" WIPPY_TEST_ARTIFACTS="$(abspath $(TEST_ARTIFACTS))" "$(WIPPY)" test $(if $(filter 1,$(WIPPY_BENCH_EXACT_ALLOCATIONS)),--profiler) --config "$(TEST_CONFIG)" \
		-o "app:db:file=$(abspath $(TEST_DB))" \
		-o "app:env_storage:file_path=$(abspath $(TEST_ARTIFACTS))/test.env" \
		-o "app.runtime:benchmark_output:directory=$(abspath $(TEST_ARTIFACTS))/benchmarks" \
		$(if $(strip $(TEST_FILTER)),test -- "$(TEST_FILTER)")

test-runtime: TEST_FILTER = app.runtime:handoff_runtime
test-runtime:
	$(MAKE) install
	WIPPY_TEST_REQUIRE_CASES=1 $(MAKE) test TEST_FILTER="$(TEST_FILTER)"

# The caller supplies a fresh disposable database; this target never drops one.
test-postgres:
	$(MAKE) install
	mkdir -p "$(TEST_ARTIFACTS)/benchmarks"
	cd "$(TEST_DIR)" && TZ=UTC WIPPY_TEST_REQUIRE_CASES=1 WIPPY_TEST_REPOSITORY="$(CURDIR)" WIPPY_TEST_ARTIFACTS="$(abspath $(TEST_ARTIFACTS))" "$(WIPPY)" test --config "$(TEST_CONFIG)" \
		-o "app:db:kind=db.sql.postgres" -o "app:db:host=$(PGHOST)" -o "app:db:port=$(PGPORT)" \
		-o "app:db:database=$(PGDATABASE)" -o "app:db:username=$(PGUSER)" -o "app:db:password=$(PGPASSWORD)" \
		-o "app:db:options.sslmode=disable" \
		-o "app:env_storage:file_path=$(abspath $(TEST_ARTIFACTS))/test.env" \
		-o "app.runtime:benchmark_output:directory=$(abspath $(TEST_ARTIFACTS))/benchmarks" \
		$(POSTGRES_TEST_OVERRIDES) \
		$(if $(strip $(POSTGRES_TEST_FILTER)),test -- $(POSTGRES_TEST_FILTER))

# Release validation executes every suite rather than only persistence handoff.
# Benchmarks are opt-in workloads run by make bench; keep strict case checks
# for every normal suite without treating intentionally skipped workloads as failures.
test-postgres-full: POSTGRES_TEST_OVERRIDES = -o app.runtime:handoff_benchmark:meta.type=benchmark -o app.runtime:metadata_benchmark:meta.type=benchmark
test-postgres-full: POSTGRES_TEST_FILTER =
test-postgres-full: test-postgres

bench:
	@set -eu; run_benchmark() { \
		output="$(abspath $(TEST_ARTIFACTS))/benchmarks/$$4-$$1.json"; \
		rm -f "$$output"; \
		WIPPY_BENCH_SIZE="$$1" WIPPY_BENCH_WARMUP="$(BENCH_WARMUP)" WIPPY_BENCH_SAMPLES="$(BENCH_SAMPLES)" \
		WIPPY_BENCH_MEMORY_OPERATIONS="$$2" WIPPY_BENCH_EXACT_ALLOCATIONS="$(BENCH_EXACT_ALLOCATIONS)" \
		WIPPY_BENCH_REVISION="$(BENCH_REVISION)" WIPPY_BENCH_RUNTIME="$$("$(WIPPY)" version)" \
		WIPPY_BENCH_FRAMEWORK_REVISION="$(BENCH_FRAMEWORK_REVISION)" \
		$(MAKE) test-runtime TEST_FILTER="$$3"; \
		test -s "$$output" || { echo "Missing benchmark report $$output" >&2; exit 1; }; \
	}; \
	for size in $(subst $(COMMA), ,$(BENCH_SIZES)); do \
		run_benchmark "$$size" "$(BENCH_MEMORY_OPERATIONS)" app.runtime:handoff_benchmark session_handoff; \
	done; \
	for size in $(subst $(COMMA), ,$(BENCH_METADATA_SIZES)); do \
		run_benchmark "$$size" "$(BENCH_METADATA_MEMORY_OPERATIONS)" app.runtime:metadata_benchmark session_metadata_write; \
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

# Require the admission capability in either published dependencies or an explicit source composition.
.PHONY: test-admission
test-admission:
	$(MAKE) install
	WIPPY_TEST_REQUIRE_ADMISSION=1 $(MAKE) test TEST_FILTER=app.persist:checkpoint_repo_test
