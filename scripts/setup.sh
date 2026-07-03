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
# Use `npm ci` (not `npm install`) so setup installs strictly from the committed
# lockfiles and never rewrites them. `npm install` re-solves per platform and, on
# macOS, strips the Linux-only `libc` metadata that CI writes, causing recurring
# lockfile drift. `npm ci` cascades into every package via the `install` lifecycle
# script ("lerna exec -- npm ci --legacy-peer-deps"), so map-next is installed too.
npm ci

echo "==> Linking env secrets"
"$SCRIPT_DIR/link-env.sh"

echo "==> Installing project-local skills"
npx --yes skills experimental_install

echo "==> Installing Playwright browsers"
cd packages/map-next && npx playwright install --with-deps && cd "$REPO_ROOT"

echo "==> Setup complete"
