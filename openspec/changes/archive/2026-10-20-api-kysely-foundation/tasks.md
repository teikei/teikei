# Tasks

## 1. TypeScript without a build step

- [x] 1.1 Add `typescript` as a devDependency of `packages/api` and a `tsconfig.json` with `allowJs`, `checkJs: false`, `noEmit`, `strict`, `module`/`moduleResolution: nodenext`, `erasableSyntaxOnly`, `allowImportingTsExtensions` and `verbatimModuleSyntax`; verify `npm run typecheck` (new script, `tsc --noEmit`) exits 0 on the current sources.
- [x] 1.2 Extend `vitest.config.js` `include` to `src/**/*.test.{js,ts}`; verify with a throwaway `.ts` module imported from a `.js` file that `npm test` picks up a `.test.ts` file and that `npm start` and `npm run dev` (`node --watch`) both boot and serve `/status`. Remove the throwaway module afterwards.
- [x] 1.3 Add `npm run typecheck` for `packages/api` to the `test` job in `.github/workflows/api-ci.yml`; verify the job runs it by pushing the branch and checking the API CI run.
- [x] 1.4 Verify the Dokku build and start with mixed `.js`/`.ts` sources by deploying the branch to `teikei-api-preview` (predeploy `npm run migrate:latest` still succeeds, the app boots, `/status` responds). This gates every group after it.

## 2. Kysely instance and generated types

- [x] 2.1 Add `kysely` (dependency) and `kysely-codegen` (devDependency); promote `@feathersjs/adapter-commons` to a direct dependency at the version already in the lockfile; verify `npm ci` in `packages/api` leaves `package-lock.json` unchanged afterwards.
- [x] 2.2 Add `src/db/kysely.ts`: one `Kysely<DB>` instance with `PostgresDialect` and `CamelCasePlugin`, built from `app.get('postgres').connection`, with a small pool size read from config (default 5); create it in `src/db.js` next to the knex setup and expose it via `app.get('kysely')`; destroy it wherever the knex pool is torn down. Verify the app boots and the existing integration tests still pass.
- [x] 2.3 Add the `db:types` script (`kysely-codegen --camel-case --out-file src/db/types.ts`) and commit the generated `src/db/types.ts`. The script takes its connection from `postgres.connection` in `config/default.json`, the same source `db/knexfile.js` uses for migrations, so it needs no extra environment variable. Verify from a shell with `DATABASE_URL` unset that `migrate:latest` followed by `db:types` succeeds, that a second run produces no diff, and that `npm run typecheck` passes.
- [x] 2.4 Document the migration workflow (`migrate:make` → `migrate:latest` → `db:types`, commit the regenerated types) in `CONTRIBUTING.md`; verify the documented commands run as written against the dev database.

## 3. Postgres error mapping

- [x] 3.1 Add `src/db/errors.ts` mapping `pg` errors by SQLSTATE to Feathers errors, copying the mapping from `feathers-objection`'s error handler (23505 and foreign-key violations → `Conflict`; not-null, check and invalid-text violations → `BadRequest`; anything else → `GeneralError`), and a helper turning a Joi validation result into `BadRequest` with the same `errors` payload that `BaseModel`'s `JoiValidator` produces today. Verify with `src/db/__test__/errors.test.ts` running real violating statements against the test container and asserting class, code and payload.

## 4. Feathers query translation

- [x] 4.1 Inventory the query operators `ra-data-feathers` emits (from its source for `getList`, `getMany`, `getManyReference` and filters, plus the five lookup resources' list/reference usage in `packages/admin`); record the list as a comment at the top of `src/db/feathersQuery.ts`. Verify by exercising each lookup list page in the admin against the dev API and comparing the logged query strings with the list.
- [x] 4.2 Implement `src/db/feathersQuery.ts`: parse with `filterQuery` from `@feathersjs/adapter-commons` (default `$limit` 50, no max), apply equality, `$in`, `$ne`, `$ilike`, `$sort`, `$limit` and `$skip` for a per-resource column allowlist, reject everything else (unknown columns, `$select`, `$eager`, `$modify`, `$joinRelation`, `$or`) with `BadRequest`, and return the paged `{ total, limit, skip, data }` envelope with the count taken before limit/offset. Verify with `src/db/__test__/feathersQuery.test.ts` covering each supported operator from 4.1, the defaults, the count and each rejection.

## 5. Public lookups: products, goals, badges

- [x] 5.1 Add characterisation tests for `products`, `goals` and `badges` (`find` and `get` over REST params, full response body including `type` and `link`; status codes for `get` on a missing id and for external `create`/`patch`/`update`/`remove`); verify they pass against the current `feathers-objection` services before any rewrite.
- [x] 5.2 Add repositories in `src/repositories/` (`products.ts`, `goals.ts`, `badges.ts`) with typed `findAll` / `findById` accepting an optional transaction; verify with repository tests against the test container.
- [x] 5.3 Add domains in `src/domain/` that call the repositories and attach `type` and `link` (`Product` / `/products/:id`, `Goal` / `/goals/:id`, `Badge` / `/badges/:id`), raising `NotFound` for a missing id; verify via the characterisation tests once 5.4 lands.
- [x] 5.4 Replace `src/services/products.js`, `goals.js` and `badges.js` with thin `.ts` controllers that delegate to the domains, keep the `filterAllowedFields` after-hooks, and leave out the unsupported methods (external calls to them now get 405 from the REST transport instead of 403 from the authorization hook; decided during implementation); verify the 5.1 tests pass with only that status updated and `npm run typecheck` passes.

## 6. Admin lookups: products, goals, badges

- [x] 6.1 Add characterisation tests for `admin/products`, `admin/goals` and `admin/badges` (paged `find` with `$limit`/`$skip`/`$sort`/`$ilike`/`id[$in]`, `get`, and every write a superadmin is permitted per `src/permissions.js`: products create/patch, goals create/patch, badges create/patch/remove; full bodies, plus status codes for a unique violation and a missing id); verify they pass against the current services.
- [x] 6.2 Extend the repositories from 5.2 with the paged `find` via `feathersQuery.ts` (per-resource column allowlist) and `insert` / `update`, plus `delete` for badges, the only lookup a superadmin may remove; verify with repository tests.
- [x] 6.3 Extend the domains with `list`, `create`, `patch` and `remove`, mapping database errors through `src/db/errors.ts`; verify via the 6.1 tests once 6.4 lands.
- [x] 6.4 Replace `src/services/admin/products.js`, `goals.js` and `badges.js` with `.ts` controllers that no longer accept `$eager`; verify the 6.1 tests pass, a request with `$eager` returns `BadRequest`, and the admin's products, goals and badges list/edit pages work against the dev API.

## 7. Admin lookups: roles, origins

- [x] 7.1 Add characterisation tests for `admin/roles` and `admin/origins` (paged `find` with the operators from 4.1, `get`, full bodies, missing-id status); verify they pass against the current services.
- [x] 7.2 Add repositories, domains and `.ts` controllers for roles and origins following groups 5 and 6, exposing only `find` and `get`: no role may create, patch or remove roles or origins, so like group 5 the unsupported methods are left out and the Joi schemas stay with the Objection models (decided during implementation); verify the 7.1 tests pass and the admin's roles and origins pages work against the dev API.

## 8. Integration checks

- [x] 8.1 Verify the whole API passes `npm run lint`, `npm run typecheck` and `npm test` in `packages/api`, and the embed real-backend e2e suite (`npm run e2e:integration`) still passes.
- [x] 8.2 Check `max_connections` on the Dokku Postgres for preview and production, confirm knex pool max plus Kysely pool max per API process stays within it, adjust the Kysely pool default if needed, and record the outcome under Open Questions in `design.md`.
- [x] 8.3 Deploy to `teikei-api-preview` and verify the embed map's product/goal/badge filters and the admin lookup pages behave as before.

## Workflow follow-up

- Archive the change once it is merged to `preview` and verified there.
