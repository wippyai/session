#!/usr/bin/env bash
set -euo pipefail
database=$1
backups=$2
mkdir -p "$(dirname "$database")" "$backups"
stamp=$(date +%Y-%m-%d-%H%M)
backup="$backups/$stamp.sql"
if ! (set -C; : > "$backup") 2>/dev/null; then
    backup="$backups/$stamp-$(date +%S)-$$.sql"
fi
sqlite3 "$database" .dump > "$backup"
rm -f "$database" "$database-wal" "$database-shm"
sqlite3 "$database" 'PRAGMA user_version = 0;'
