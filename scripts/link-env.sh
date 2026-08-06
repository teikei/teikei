#!/bin/bash

set -euo pipefail

# Symlink a root .env into each package. In a worktree, if the current root
# does not have a .env yet, reuse one from another checkout listed by git.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CURRENT_ROOT_ENV="$REPO_ROOT/.env"
PACKAGES=("packages/api" "packages/admin" "packages/map" "packages/embed")

usage() {
    cat <<'EOF'
Usage: scripts/link-env.sh [SOURCE_ENV]

If SOURCE_ENV is omitted, the script uses:
1. the current worktree's .env if it exists
2. TEIKEI_ENV_SOURCE if set
3. the first sibling git worktree with a root .env

The script then ensures the current repo root has a .env and links all package
.env files to ../../.env.
EOF
}

resolve_source_env() {
    local explicit_source="${1:-}"

    if [ -n "$explicit_source" ]; then
        echo "$explicit_source"
        return 0
    fi

    if [ -f "$CURRENT_ROOT_ENV" ]; then
        echo "$CURRENT_ROOT_ENV"
        return 0
    fi

    if [ -n "${TEIKEI_ENV_SOURCE:-}" ]; then
        echo "$TEIKEI_ENV_SOURCE"
        return 0
    fi

    while IFS= read -r line; do
        case "$line" in
            worktree\ *)
                local worktree_path="${line#worktree }"
                if [ "$worktree_path" != "$REPO_ROOT" ] && [ -f "$worktree_path/.env" ]; then
                    echo "$worktree_path/.env"
                    return 0
                fi
                ;;
        esac
    done < <(git -C "$REPO_ROOT" worktree list --porcelain)

    return 1
}

link_file() {
    local source_file="$1"
    local target_file="$2"

    if [ -L "$target_file" ] || [ -f "$target_file" ]; then
        rm -f "$target_file"
    fi

    ln -s "$source_file" "$target_file"
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    usage
    exit 0
fi

SOURCE_ENV="$(resolve_source_env "${1:-}")" || {
    echo "Error: could not find a source .env file."
    echo "Create $CURRENT_ROOT_ENV, set TEIKEI_ENV_SOURCE, or pass a path explicitly."
    exit 1
}

if [ ! -f "$SOURCE_ENV" ]; then
    echo "Error: source .env does not exist: $SOURCE_ENV"
    exit 1
fi

if [ ! -f "$CURRENT_ROOT_ENV" ]; then
    echo "Linking root .env -> $SOURCE_ENV"
    link_file "$SOURCE_ENV" "$CURRENT_ROOT_ENV"
else
    echo "Using existing root .env at $CURRENT_ROOT_ENV"
fi

echo "Creating package symlinks..."

for package in "${PACKAGES[@]}"; do
    PACKAGE_DIR="$REPO_ROOT/$package"
    TARGET_ENV="$PACKAGE_DIR/.env"

    if [ ! -d "$PACKAGE_DIR" ]; then
        echo "Warning: package directory does not exist: $PACKAGE_DIR"
        continue
    fi

    (
        cd "$PACKAGE_DIR"
        if [ -L "$TARGET_ENV" ] || [ -f "$TARGET_ENV" ]; then
            rm -f ".env"
        fi
        ln -s "../../.env" ".env"
    )

    echo "  ✓ $package/.env -> ../../.env"
done
