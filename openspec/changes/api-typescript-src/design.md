# Design

## Context

See proposal.md for motivation and scope. Current state, as set up by `api-kysely-foundation`:

- `tsconfig.json` sets `allowJs`, `checkJs: false`, `strict`, `nodenext`, `erasableSyntaxOnly`, `allowImportingTsExtensions` and `verbatimModuleSyntax`. `npm run typecheck` runs in `api-ci.yml`.
- Node 24 strips types natively. `npm start` (`node ./src/index.js`) already loads 78 `.ts` modules in production. Dokku starts the app through `npm start`, and the root `dev`/`start` scripts call the package scripts, so nothing else references `src/index.js`.
- Converted controllers type `app` as a bare `Application`, so `app.get(...)` returns `any`. Hooks are typed `(ctx: HookContext)`.
- `tsc --checkJs` reports 237 errors in the non-test `.js` source (checked on 2026-10-23):
  - About 80% are implicit `any` parameters and variables.
  - 41 are unknown properties, mostly the permission scope union, `JwtPayload.roles` and the loosely built objects in `logger.js`.
  - The rest are missing declarations for untyped packages, plus four CommonJS default imports that TypeScript considers not callable (`express(feathers())`, `authManagement(...)`, and two in `emails.js`).
- The app adds members that Feathers' types don't know:
  - `app.jobs`: an array with a `schedule` method attached, read by `admin/jobs`.
  - `app.isDevelopment()` and `app.isProduction()` from `feathers-envhelpers`.
  - `ctx.allowedFields`, set by `authorize` and read by `filterAllowedFields`.
- Tests import about 30 source modules by their `.js` specifier. Several mock hooks by extensionless path (`vi.mock('../../hooks/authorization')`).
- `db/integrationTestSetup.js` and the test data in `src/services/__test__/data/*.js` are imported by TypeScript tests.

## Goals / Non-Goals

**Goals:**

- No non-test `.js` file under `packages/api/src`, and `npm run typecheck` passes under the current `strict` settings without `@ts-ignore`/`@ts-expect-error`.
- No `any` that hides a shape the code relies on. `any` stays acceptable where the code passes data through untouched, such as hook `data` and `result`, and library payloads it forwards.
- Unchanged behaviour: the existing test suites pass with only their import specifiers changed.

**Non-Goals:**

- Typing per-service hook contexts (`HookContext<App, Service>`), Feathers settings or the service registry.
- Restructuring modules, renaming exports, or moving the known exceptions (`searchIndex`, `autocomplete`, `hooks/email`) behind domains.
- Changing `tsconfig.json` options.

## Decisions

### Rename and annotate, don't rewrite

- Each file moves with `git mv` (to keep its history) and changes only enough to typecheck:
  - parameter and return types
  - small named types for shapes used in more than one place
  - narrow casts at library boundaries
- A type error is fixed with types, not with different logic. Rewrites that behave identically are fine, such as passing `'utf8'` to `fs.readFileSync` in `emails.ts` instead of an options object that has no encoding. When typing reveals a real bug (for example, the admin create scopes whose conditions throw because a create has no resource, already noted in `permissions.js`), the fix is recorded in tasks.md as a follow-up and not made here.
- Alternative considered: turning on `checkJs` with JSDoc types. It types the same code with noisier syntax and leaves two conventions in `src`. Rejected.

### One `Scope` type for authorization

- `permissions.ts` exports a `Scope` type: the `scope` string, an optional `condition(userId, resource, app)` returning `boolean | Promise<boolean>`, and an optional `fields(userId, resource)` returning `string[]`. It also types the role map as `Record<Role, Scope[]>`, with `Role` being `'guest' | 'user' | 'admin' | 'superadmin'`.
- The `resource` the conditions receive is what `authorize` loads: entries come from the domains' `getForAuthorization`, and other services from `service.get`. It is typed as the narrow shape the conditions read (`id`, and `active` and `ownerships` for entries), not as any full record.
- The JWT payload is decoded with `jwtDecode<{ roles: { name: string }[] }>`, which replaces the unknown `roles` on `JwtPayload`.

### Feathers augmentation in `src/declarations.ts`

- One module augments `@feathersjs/feathers`:
  - `Application` gains `jobs`, `isDevelopment()` and `isProduction()`
  - `HookContext` gains `allowedFields?: string[]`
- The augmenting interfaces repeat Feathers' type parameters, so the declarations merge. The file is part of the program through the tsconfig `include` and needs no import.
- This follows Feathers' own generator convention (`declarations.ts`).
- Alternative considered: casts at each use. Rejected: they would be spread over `app.ts`, `jobs/index.ts`, `admin/jobs.ts`, `services/index.ts`, `authorization.ts` and `filterAllowedFields.ts`.

### Declarations for untyped dependencies

- `@types/*` dev dependencies where the types match the installed major version: `node-schedule`, `nodemailer`, `nunjucks`, `serve-favicon`, and `email-templates` if its types fit v13.
- The rest get a minimal ambient declaration in `src/types/modules.d.ts` that covers only the surface used: `feathers-envhelpers`, `pg-escape`, `inky`, `geojson`, and `email-templates` if its `@types` package doesn't fit. Note that `@types/geojson` describes the GeoJSON format, not this library.
- The CommonJS default imports that TypeScript considers not callable get the import form whose type matches what Node actually loads. The app runs today, so the runtime value is known and only its static type changes.

### lodash out of source

- The eleven lodash calls in source (`get`, `pick`, `omit`, `keys`, `pickBy`, `isArray`, `compact`) become built-ins, so source needs no `@types/lodash`.
- `filterAllowedFields` keeps deleting keys in place, as its comment explains: this keeps the prototype intact.
- Only tests use lodash afterwards, so it moves to `devDependencies`.

### Entry point and specifiers

- `src/index.ts` replaces `src/index.js`. The `start`, `dev` and `dev-debug` scripts point at it, and so does `main`, which changes from `"src"` to `"src/index.ts"`: Node resolves a directory `main` to `index.js`, never `index.ts`.
- Every import of a renamed module, in source and in tests, uses the `.ts` specifier, as `api-kysely-foundation` set out.
- Extensionless `vi.mock` paths are left alone. Vitest resolves them to the same file, and the tests that rely on these mocks fail loudly if a mock stops applying.

### Guard against new JavaScript

- An `eslint.config.js` block for `packages/api/src/**/*.js`, ignoring `**/__test__/**`, reports every file through `no-restricted-syntax` on `Program` with the message "packages/api/src is TypeScript; use .ts". Lint already runs in CI and in lint-staged.
- Alternative considered: `allowJs: false` for `src`. Rejected: the TypeScript tests import `db/integrationTestSetup.js` and the JS test data, so `allowJs` has to stay on.
- Alternative considered: a `find` check in CI. Rejected: it would be a second mechanism, and contributors wouldn't see it locally.

### Order: leaves first

- Files convert bottom-up, so every step leaves `typecheck`, `lint` and the tests green:
  1. utils, logger, middleware, Joi schemas
  2. hooks
  3. permissions and authorization
  4. services
  5. jobs
  6. app wiring and entry point
  7. guard and docs
- A JS file importing a converted module only needs its specifier changed. A converted file importing a not-yet-converted `.js` module still compiles, because `allowJs` is on, so there's no forced big-bang step.

## Risks / Trade-offs

- [A type error gets "fixed" by changing logic, for example adding a guard that changes a response] → The rule above. Each step runs the full API suite, whose error-code tests (`authManagementErrorCodes`, `serviceErrorCodes`, `httpErrorCodes`, `rateLimit`, `logger`, `jobs`) pin the paths most likely to be touched.
- [The entry point change breaks the Dokku start] → `npm start` is the only path. It is checked locally, then on the preview deploy before production.
- [A `vi.mock` stops applying after a rename and a test silently exercises the real hook] → The affected tests assert behaviour that only the mock produces, such as skipping authorization and emails, so they fail instead.
- [An `@types` package lags behind the installed major version] → Use a local declaration instead, typed from the calls the code makes.
- [Typing `resource` too narrowly hides a field a condition reads] → The conditions are few and are listed in `permissions.ts`. The types come from what they read.

## Migration Plan

- No deploy-time steps: there are no schema or configuration changes. It can land as one PR, or as two split at the end of step 3 if review size calls for it.
- Rollback is a git revert.
