#!/usr/bin/env bash
set -euo pipefail
command -v initdb >/dev/null || { echo 'Install PostgreSQL to run the isolated database tests.' >&2; exit 1; }
task_pg_dir=$(mktemp -d "${TMPDIR:-/tmp}/launchkit-pg.XXXXXX")
task_pg_port=${LOCAL_TEST_PG_PORT:-55441}
initdb -D "$task_pg_dir/data" -A trust --no-locale > "$task_pg_dir/init.log"
pg_ctl -D "$task_pg_dir/data" -l "$task_pg_dir/server.log" -o "-p $task_pg_port -h 127.0.0.1" -w start
trap 'pg_ctl -D "$task_pg_dir/data" -m fast -w stop; rm -rf "$task_pg_dir"' EXIT
TEST_DATABASE_URL="postgresql://$(id -un)@127.0.0.1:$task_pg_port/postgres" pnpm test
