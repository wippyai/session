# Session module test, lint and UI targets.
#
# Tests run from a generated workspace outside the repository
# (scripts/test-workspace.sh): `make install` prepares it and installs the
# locked dependencies, and `make test` clears the test database and runs the
# suite against it. The database is file-backed because a plain in-memory
# database gives every pooled connection its own empty schema.
#
# build-ui / ui-dev build the wippy-form and wippy-form-answers web
# components (frontend/wippy-form, frontend/wippy-form-answers; each is its
# own npm package, the Session module has no pnpm workspace) into
# src/forms/ui/dist/ and src/forms/ui/answers-dist/, which
# src/forms/ui/_index.yaml serves. build-ui uses `npm ci` for a
# reproducible install from each package's committed package-lock.json;
# run `npm install` by hand in the package first if its lockfile is
# missing or out of date. Each `cd && npm ci && npm run build` line runs
# in its own subshell, so a failure in either package aborts the target
# before the other package (if it has not run yet) is attempted.
#
# test-ui / lint-ui follow the same per-package `npm ci` pattern as
# build-ui. lint-ui also runs `vue-tsc --noEmit` for wippy-form, which
# renders .vue SFCs and depends on vue-tsc; wippy-form-answers has no .vue
# files and no vue-tsc dependency, so it gets ESLint only. check-ui
# (scripts/check-ui.mjs) fails when a fresh build of either package differs
# from its committed dist/ answers-dist output, or when
# src/forms/ui/_index.yaml's hand-copied registry metadata disagrees with
# the owning package.json's `wippy` block (see the script's own header for
# why this is a check rather than a generator). verify chains the backend
# and UI gates that CI runs as separate jobs.

WIPPY ?= wippy
TEST_ARTIFACTS ?= /tmp/wippy-session-tests
TEST_DIR ?= $(TEST_ARTIFACTS)/workspace
TEST_CONFIG ?= $(abspath $(TEST_DIR))/.wippy.yaml
TEST_DB ?= $(TEST_ARTIFACTS)/test.db
TEST_BACKUP_DIR ?= $(TEST_ARTIFACTS)/backups
TEST_FILTER ?=
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
# The suites test-postgres runs, as entry id prefixes: every namespace of the
# test workspace except two that are SQLite only by design. app.runtime holds
# only the SQLite bootstrap test (it builds a workspace with sqlite3, bash and
# make, and checks the SQLite backup) and the benchmarks, so just its handoff
# suite is listed. app.migration probes the migrations on its own SQLite file,
# which no database setting reaches. A prefix, not a list of suites, so a new
# suite runs on PostgreSQL unless someone excludes it here.
POSTGRES_SUITES ?= app: app.api: app.forms: app.funcs: app.lifecycle: app.persist: app.process: app.run_context: app.runtime:handoff_runtime
UI_DIR ?= frontend/wippy-form
UI_ANSWERS_DIR ?= frontend/wippy-form-answers

.PHONY: test test-runtime test-postgres bench lint install prepare clean build-ui ui-dev ui-dev-answers test-ui lint-ui check-ui verify

test: clean
	mkdir -p "$(TEST_ARTIFACTS)/benchmarks"
	cd "$(TEST_DIR)" && WIPPY_TEST_REPOSITORY="$(CURDIR)" WIPPY_TEST_ARTIFACTS="$(abspath $(TEST_ARTIFACTS))" "$(WIPPY)" test $(if $(filter 1,$(WIPPY_BENCH_EXACT_ALLOCATIONS)),--profiler) --config "$(TEST_CONFIG)" \
		-o "app:db:file=$(abspath $(TEST_DB))" \
		-o "app:env_storage:file_path=$(abspath $(TEST_ARTIFACTS))/test.env" \
		-o "app.runtime:benchmark_output:directory=$(abspath $(TEST_ARTIFACTS))/benchmarks" \
		$(if $(strip $(TEST_FILTER)),test -- "$(TEST_FILTER)")

test-runtime: TEST_FILTER = app.runtime:handoff_runtime
test-runtime:
	@test -n "$(FRAMEWORK_DIR)" || { echo 'Set FRAMEWORK_DIR to use the required runtime test runner' >&2; exit 1; }
	$(MAKE) install
	WIPPY_TEST_REQUIRE_CASES=1 $(MAKE) test TEST_FILTER="$(TEST_FILTER)"

# The caller supplies a fresh disposable database; this target never drops one.
test-postgres:
	@test -n "$(FRAMEWORK_DIR)" || { echo 'Set FRAMEWORK_DIR to use the required runtime test runner' >&2; exit 1; }
	$(MAKE) install
	mkdir -p "$(TEST_ARTIFACTS)/benchmarks"
	cd "$(TEST_DIR)" && TZ=UTC WIPPY_TEST_REQUIRE_CASES=1 WIPPY_TEST_REPOSITORY="$(CURDIR)" WIPPY_TEST_ARTIFACTS="$(abspath $(TEST_ARTIFACTS))" "$(WIPPY)" test --config "$(TEST_CONFIG)" \
		-o "app:db:kind=db.sql.postgres" -o "app:db:host=$(PGHOST)" -o "app:db:port=$(PGPORT)" \
		-o "app:db:database=$(PGDATABASE)" -o "app:db:username=$(PGUSER)" -o "app:db:password=$(PGPASSWORD)" \
		-o "app:db:options.sslmode=disable" \
		-o "app:env_storage:file_path=$(abspath $(TEST_ARTIFACTS))/test.env" \
		-o "app.runtime:benchmark_output:directory=$(abspath $(TEST_ARTIFACTS))/benchmarks" \
		test -- $(POSTGRES_SUITES)

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

verify: install test lint test-ui lint-ui check-ui
