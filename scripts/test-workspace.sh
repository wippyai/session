#!/usr/bin/env bash
set -euo pipefail
repository=$(cd "$1" && pwd -P)
mkdir -p "$2"
workspace=$(cd "$2" && pwd -P)
framework=${3:-}
if [ -n "$framework" ]; then framework=$(cd "$framework" && pwd -P); fi
case "$workspace/" in
  "$repository/"*) printf 'Test workspace must be outside the repository\n' >&2; exit 1 ;;
esac
modules=$(jq -cn --arg path "$workspace/modules" '$path')
source=$(jq -cn --arg path "$repository/test" '$path')
awk -v modules="$modules" -v source="$source" '
  $1 == "modules:" && $2 == ".wippy" { printf "    modules: %s\n", modules; next }
  $1 == "src:" && $2 == "." { printf "    src: %s\n", source; next }
  { print }
' "$repository/test/wippy.lock" > "$workspace/wippy.lock"
jq -n --arg repository "$repository" --arg workspace "$workspace" --arg framework "$framework" '
  {version: "1.0", logger: {level: "error"},
   registry: {dependency_vendor_dir: ($workspace + "/modules/vendor"),
              dependency_lock_path: ($workspace + "/wippy.lock")},
   workspace: {replacements: ({"wippy/session": $repository} +
     if $framework == "" then {} else {
       "wippy/agent": ($framework + "/src/agent/src"),
       "wippy/llm": ($framework + "/src/llm/src"),
       "wippy/test": ($framework + "/src/test")
     } end)}}
' > "$workspace/.wippy.yaml"
