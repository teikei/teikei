#!/bin/bash

set -euo pipefail

# Prepare a fresh checkout or worktree for development:
# 1. Install npm dependencies at the repo root
# 2. Symlink env secrets into each package (scripts/link-env.sh)
# 3. Install project-local skills pinned in skills-lock.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "==> Installing npm dependencies"
npm install

echo "==> Linking env secrets"
"$SCRIPT_DIR/link-env.sh"

echo "==> Installing project-local skills"
npx skills experimental_install

echo "==> Setup complete"
