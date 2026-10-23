# Proposal

## Why

The Kysely migration moved the repositories, domains and most controllers to TypeScript. The other 50 `.js` files in `packages/api/src` (about 2,600 lines) are the app wiring, hooks, auth, permissions, emails and jobs. `tsc --noEmit` doesn't check them, because `checkJs` is off. That leaves the authorization layer unchecked, even though it's the most security-sensitive code: string-keyed `service:method` scopes, permission conditions and field lists. The tooling from `api-kysely-foundation` (native type stripping, mixed imports, `typecheck` in CI) already supports converting them without a build step, and the code is fresh in mind after the Objection removal.

## What Changes

- Convert every non-test `.js` file under `packages/api/src` to `.ts` and type it under the existing `strict` tsconfig:
  - app and entry point: `app.js`, `index.js`, `db.js`, `logger.js`
  - authorization: `permissions.js`, `hooks/authorization.js`
  - the remaining hooks, middleware and utils
  - the remaining services: authentication, authManagement, emails, emailPreview, entryContactMessage, geocoder, reverseGeocoder, autocomplete, searchIndex, status, userReactivation, and the admin `jobs`, `bounces` and `userAccountStateChange`
  - the jobs
  - the Joi schemas in `domain/validation/`
- The entry point becomes `src/index.ts`. The `start`, `dev` and `dev-debug` scripts run it directly through Node's type stripping, so Dokku's `npm start` keeps working without a build step.
- Every importer switches to the `.ts` specifier: source, and the JS and TS tests.
- Add a type for permission scopes. The authorization hook and `permissions.ts` then share one checked shape for `scope`, `condition` and `fields`.
- Declare in one place the members this app adds to Feathers' `Application` (`jobs`, `isDevelopment`, `isProduction`) and to `HookContext` (`allowedFields`).
- Add type declarations for untyped dependencies: `@types/*` packages where they exist, otherwise minimal local declarations.
- Replace the few lodash calls in source with built-ins. lodash stays as a dev dependency for the tests that use it.
- Lint now rejects new `.js` files in `packages/api/src` outside `__test__`.
- Update `AGENTS.md`: `src` is TypeScript apart from tests, and the known exceptions use their new file names.

Behaviour, responses and error codes don't change.

Out of scope:

- Tests (`src/**/__test__/**/*.js`): they stay JavaScript. Only their import specifiers change.
- `db/` (migrations, seeds, knexfile, test setup) and `scripts/`: they stay JavaScript, and knex keeps running the migrations.
- Typing Feathers settings (`app.get(...)`) or the service registry (`Application<Services, Settings>`).
- Fixing behaviour that typing reveals as wrong. Such findings are recorded and fixed separately.

## Capabilities

### New Capabilities

None. This is a refactor.

### Modified Capabilities

None. The change opts out of delta specs (`skip_specs: true`).

## Impact

- **Code:** `packages/api/src` (50 files renamed and typed; imports updated in source and tests), `packages/api/package.json` (scripts, dev dependencies), `eslint.config.js`, `AGENTS.md`.
- **Dependencies:** new dev-only `@types/*` packages. lodash moves to `devDependencies`. No runtime dependency is added.
- **Runtime/ops:** Node 24 already strips types for the `.ts` modules loaded in production. Only the entry file changes. Rollback is a git revert.
- **Ordering:** follows `api-kysely-remove-objection`, which is merged; its archive task is unrelated.
