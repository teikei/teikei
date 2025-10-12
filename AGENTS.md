# Repository Guidelines

## Project Structure & Module Organization

- Root uses npm workspaces plus Lerna; shared tooling lives in `package.json`, `scripts/`, and `eslint.config.js`.
- API resides in `packages/api` (Feathers/Express) with migrations in `db/` and job/email helpers in `scripts/`.
- Frontend apps: map in `packages/map` (React/Vite) with feature code in `src/`, assets in `public/`, webtests in `src/webtests`; admin in `packages/admin` (React Admin) with resources under `src/`.

## Build, Test, and Development Commands

- `npm install` bootstraps all workspaces; rerun after dependency updates.
- `npm run dev` starts Dockerized Postgres, the API, and the map; `npm run dev-admin` starts the admin UI.
- `npm run build` runs each package build (`vite build`, `babel`) for production bundles.
- `npm run lint`/`npm run prettier` enforce shared checks—fix findings before committing.
- API only: `cd packages/api && npm run dev` or `npm run build && npm start`.

## Coding Style & Naming Conventions

- Prettier (2-space indent, single quotes) and ESLint (TypeScript/React/Jest) define style; run the scripts instead of manual tweaks.
- React components and TypeScript types use `PascalCase`; hooks/utilities stay `camelCase`.
- Keep API service logic near its tests inside `__test__` folders to match the existing layout.

## Testing Guidelines

- Backend tests use Jest with Testcontainers; run `npm run test from `packages/api` with Docker running.
- Frontend end-to-end tests rely on Playwright (`npm run webtests`, `npm run webtests:ui` from repository root); keep specs in `packages/map/src/webtests`.
- Prefer Vitest or Testing Library colocated with components (`ComponentName.test.tsx`) for new map/admin unit tests.
- Cover new behaviour before each PR; flag temporary skips with TODO + linked issue.

## Commit & Pull Request Guidelines

- Use short imperative subjects with conventional prefixes (`fix:`, `feat:`, `chore:`) as seen in recent commits.
- Keep each commit focused; include schema or config adjustments alongside the code that depends on them.
- PRs must describe the change.

## Environment & Configuration

- Copy `.env.sample` to `.env`; The configuration file contains env variables for all packages (api, admin, map) and needs to be symlinked to each package
  using script `scripts/link-env.sh`
- Run `npm run migrate:latest` in `packages/api`; add sample users with `npm run seed:run` (this will be done automativally with `npm run dev` in development mode)
