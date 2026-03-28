#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
targets=("$root_dir")

while IFS= read -r dir; do
  targets+=("$dir")
done < <(find "$root_dir/packages" -mindepth 1 -maxdepth 1 -type d | sort)

display_dir() {
  if [[ "$1" == "$root_dir" ]]; then
    printf '.'
    return
  fi

  printf '%s' "${1#$root_dir/}"
}

run_in_targets() {
  local label="$1"
  shift

  for dir in "${targets[@]}"; do
    printf '\n==> %s: %s\n' "$(display_dir "$dir")" "$label"
    (
      cd "$dir"
      "$@"
    )
  done
}

run_in_targets "npx ncu -u" npx ncu -u
run_in_targets "npm install" npm install
