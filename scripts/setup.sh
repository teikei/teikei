#!/bin/bash

set -euo pipefail

# Prepare a fresh checkout or worktree for development:
# 1. Install npm dependencies at the repo root
# 2. Symlink env secrets into each package (scripts/link-env.sh)
# 3. Install project-local skills pinned in skills-lock.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "==> Selecting Node.js version (.nvmrc)"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
	set +u
	# shellcheck disable=SC1091
	. "$NVM_DIR/nvm.sh"
	nvm install
	nvm use
	set -u
else
	echo "    nvm not found; skipping. Ensure Node $(cat .nvmrc) is active." >&2
fi

echo "==> Installing npm dependencies"
npm ci

echo "==> Linking env secrets"
"$SCRIPT_DIR/link-env.sh"

echo "==> Installing project-local skills"
npx --yes skills experimental_install

echo "==> Installing Playwright browsers"
cd packages/embed && npx playwright install --with-deps && cd "$REPO_ROOT"

echo "==> Setup complete"
