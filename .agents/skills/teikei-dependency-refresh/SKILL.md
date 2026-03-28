---
name: teikei-dependency-refresh
description: Update npm dependencies across the Teikei monorepo when asked to refresh, bump, or modernize packages in the repo root and each packages/* workspace. Run `npx ncu -u` and `npm install`, execute the repo checks and tests, fix straightforward breakages, and report or pin back packages that look fundamentally incompatible after the upgrade.
---

# Teikei Dependency Refresh

Use this skill for repo-wide npm dependency upgrades in this monorepo.

## Scope

- Repo root `package.json`
- Every direct workspace under `packages/*`

## Workflow

1. Check the current tree with `git status --short`. Do not revert unrelated user changes.
2. Update manifests and install dependencies with the bundled script:

```bash
bash .agents/skills/teikei-dependency-refresh/scripts/update-all.sh
```

This runs `npx ncu -u` in the repo root and in every `packages/*` directory, then runs `npm install` in the same locations.

3. If an install fails, inspect the first blocking error before making changes. Prefer a narrow code or config fix, or a targeted version pin, over broad workarounds.
4. Run validation in this order:

```bash
npm run build
npm run lint
npm run prettier
(cd packages/api && npm test)
(cd packages/admin && npm run build && npm test)
(cd packages/map-next && npm run check && npm run lint && npm run test && npm run build)
npm run webtests
```

- `packages/admin` and `packages/map` expose `npm test` as a noop, so do not treat those as meaningful test coverage.
- `npm run webtests` is the real automated regression suite for the legacy map.

5. Fix breakages until the checks are green. Keep fixes local, simple, and consistent with existing code.
6. If one package still looks incompatible after a reasonable local fix attempt, isolate the blocker:

- Revert or pin only the dependency changes for that package and the related lockfile entries.
- Keep the rest of the upgrade green if possible.
- Report the incompatible package, the failing dependency version(s), the exact failing command, and why this does not look like a small local fix.

## Repo Rules

- `packages/map` is legacy reference code. Upgrade its dependencies when asked to do the full monorepo, but do not do broad refactors there. If a dependency bump breaks it and the fix is more than a narrow hotfix, treat that package as incompatible and report it.
- Root `npm install` already triggers repo install logic, but still run package-level `npm install` so peer conflicts surface where they actually happen.
- Keep fixes simple. Do not add libraries for trivial compatibility shims.
- Use `rg` for searches.

## Report Back

Include:

- Which manifests were upgraded
- Which commands were run
- Which checks passed
- Which files were changed for fixes
- Any blocked package, failing version, exact error, and recommended next step
