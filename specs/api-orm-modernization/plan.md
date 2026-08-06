# Implementation Plan: API ORM Modernization

Spec: specs/api-orm-modernization/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

- [ ] 1. API response contract test coverage (depends on: none)
  - [ ] 1.1 Add shared HTTP response-test helpers: anonymous / authenticated-non-owner /
        owner request fixtures, and seed factories for entries with their relations
  - [ ] 1.2 Response-shape tests for `farms`, `depots`, `initiatives` (default and
        `$details=true` variants)
  - [ ] 1.3 Response-shape tests for `users`, and `entries` covering the anonymous listing,
        the `mine` variant, and the GeoJSON envelope produced by `toGeoJSON`
  - [ ] 1.4 Response-shape tests for `goals`, `products`, `badges`, `autocomplete`
  - [ ] 1.5 Field-level access-control tests for `farms` and `depots` in all three auth
        states, asserting `address` / `street` / `housenumber` appear only for the owner
  - [ ] 1.6 Blanket no-secrets regression test across every public endpoint — `password`,
        `verifyToken`, `verifyShortToken`, `verifyChanges`, `resetToken`,
        `resetShortToken` — including inside nested relations
  - [ ] 1.7 `find` and `get` coverage for all 11 adapter-generated `admin/*` services:
        `{ total, limit, skip, data }` envelope, relation-as-ID-array default, and the
        `$details=true` nested variant
  - [ ] 1.8 Admin query-surface tests: `$modify` (`hasBadge`, `notHasBadge`, non-superadmin
        `hasOrigin` scoping), `$joinRelation` filtering `admin/users` by `roles.id`, and
        `$ilike` fuzzy search including the `q` parameter path
  - [ ] 1.9 Response-shape tests for the hand-written admin services `admin/entries`,
        `admin/stats`, `admin/audit`
  - [ ] 1.10 Relation-write tests: creating and patching a farm with `products`, `badges`
        and `depots` returns the expected related IDs, and the owner is related on create
  - [ ] 1.11 DB-constraint violation tests — unique, foreign key, not-null — each asserting
        HTTP status and error code
  - [ ] 1.12 Coarse regression guard on `entries` and the `farms` listing: statement-count
        upper bound baselined against the current implementation via knex's `query` event,
        with loose bounds that will not flake on CI
  - [ ] 1.13 Confirm the whole suite passes against the current Objection implementation and
        record it as the acceptance gate for Features 5-8

- [ ] 2. TypeScript toolchain with no build step (depends on: none)
  - [ ] 2.1 Add `typescript` devDependency and `tsconfig.json` with `noEmit: true`,
        `module: nodenext`, `allowImportingTsExtensions: true`, `erasableSyntaxOnly: true`,
        `allowJs: true`, `strict: true`, `checkJs: false`
  - [ ] 2.2 Add a `typecheck` script, wire it into CI, and widen `vitest.config.js` to match
        both `.js` and `.ts` test files
  - [ ] 2.3 Convert `src/utils/**`, `src/logger`, `src/middleware/**` to TypeScript
  - [ ] 2.4 Convert `src/app`, `src/index`, `src/permissions`, `src/db` to TypeScript, and
        verify `npm start` / `npm run dev` still invoke `node` directly with no build step
        added to the Dockerfile or Procfile
  - [ ] 2.5 Convert `src/jobs/**` and the ORM-free files in `src/hooks/**` to TypeScript
  - [ ] 2.6 Document the erasable-syntax-only constraint (no enums, namespaces, parameter
        properties or decorators) in the package README

- [ ] 3. Generated database types (Kanel) (depends on: none)
  - [ ] 3.1 Add `kanel` and configure it against the database the migrations produce, with
        output committed under `src/db/`
  - [ ] 3.2 Add a documented regeneration script and commit the generated types; confirm
        running it after `migrate:latest` on an up-to-date database produces no diff
  - [ ] 3.3 Add a CI drift check that regenerates and fails on any difference from the
        committed output
  - [ ] 3.4 Verify generated identifiers are camelCase, matching the existing
        `knexSnakeCaseMappers` convention, and wire one consumer to prove the setup

- [ ] 4. Extract ORM-agnostic concerns off the Objection models (depends on: 1)
  - [ ] 4.1 Move Joi validation from Objection's `Validator` to a service-level before hook
        using the existing `src/models/validation/` schemas, preserving the
        patch-skips-validation behaviour
  - [ ] 4.2 Produce the `type` and `link` virtuals outside the model layer and repoint every
        consumer, including `relateOwner` and `filterOwnedEntries`
  - [ ] 4.3 Replace `$formatJson` secret stripping on `User` with an explicit mechanism and
        confirm the Feature 1 no-secrets test still passes
  - [ ] 4.4 Implement database error mapping over raw `pg` error codes (`23505`, `23503`,
        `23502`), drop `objection-db-errors` from the base model, and keep all existing
        error-code tests passing unchanged — do not add `db-errors`
  - [ ] 4.5 Reduce `src/models/base.js` to model definition only and confirm the full suite
        is green with no observable behaviour change

- [ ] 5. Migrate admin services to `@feathersjs/knex` (depends on: 2, 3, 4)
  - [ ] 5.1 Migrate one relation-free admin service (`admin/roles`) as the pilot and verify
        `knexSnakeCaseMappers` works correctly with `KnexService` before proceeding
  - [ ] 5.2 Migrate the remaining relation-free admin services: `goals`, `products`,
        `badges`, `origins`, `emailCampaigns`, `emailMessages`
  - [ ] 5.3 Configure `$ilike` via the adapter's `operators` / `extendedOperators` option
        across the migrated services
  - [ ] 5.4 Implement a batched join-table relation-ID loader and verify no N+1 on the
        largest admin lists
  - [ ] 5.5 Migrate `admin/users`, reimplementing the `$joinRelation` `roles.id` filter
  - [ ] 5.6 Migrate `admin/farms`, reimplementing `$modify` `hasBadge` / `notHasBadge` /
        `hasOrigin` via `createQuery` overrides and/or `params.knex`, preserving the
        `whereExists` behaviour from the current model modifiers
  - [ ] 5.7 Migrate `admin/depots` and `admin/initiatives` including their `$modify` filters
  - [ ] 5.8 Verify `$details=true` still returns nested objects across all 11 services and
        that every Feature 1 admin test passes with unmodified assertions
  - [ ] 5.9 Manually verify `packages/admin` end to end — lists, filters, sorting,
        pagination, edit forms, delete actions — with no client changes

- [ ] 6. Repository layer pilot on `depots`, with the query-builder decision (depends on: 2, 3, 4)
  - [ ] 6.1 Establish `src/repositories/` and its conventions: explicit domain arguments,
        never a Feathers `params.query`; select list as the field allow-list, consistent
        with `src/permissions.js`
  - [ ] 6.2 Implement the `depots` repository variant A on knex + Kanel types, including
        non-N+1 loading of `farms.[products]` and `ownerships` with per-relation column
        allow-lists
  - [ ] 6.3 Implement the `depots` repository variant B on Kysely + `kanel-kysely`, with
        `CamelCasePlugin`, `ParseJSONResultsPlugin`, and explicit pool limits on both pools
  - [ ] 6.4 Rewrite the `depots` Feathers service as a thin hand-written service —
        authentication, validation, serialization and hook wiring only — delegating all data
        access to the repository
  - [ ] 6.5 Run both variants against the unmodified Feature 1 `depots` tests, including the
        field-level access-control and no-secrets assertions
  - [ ] 6.6 Write `specs/api-orm-modernization/decision-query-builder.md` covering observed
        type safety, nested many-to-many ergonomics, whether a second connection pool is
        warranted, and camelCase mapping consistency across the two stacks
  - [ ] 6.7 Delete the losing variant so only the chosen one remains

- [ ] 7. Migrate the remaining public services to repositories (depends on: 6)
  - [ ] 7.1 `farms` repository and thin service, with explicit loading of `products`,
        `badges`, `depots` and `ownerships`
  - [ ] 7.2 Replace `upsertGraph` relation syncing with explicit join-table synchronization
        inside the create/patch transaction, so a failed relation write fails the request
        instead of logging and returning 200
  - [ ] 7.3 Sequence relation writes against the notification and search-index side effects
        explicitly, removing the implicit hook-ordering dependency in the farms service
  - [ ] 7.4 `initiatives` repository and thin service
  - [ ] 7.5 `users` repository and thin service, keeping the
        `feathers-authentication-management` and `@feathersjs/authentication-local`
        integrations intact
  - [ ] 7.6 `goals`, `products` and `badges` repositories and thin services
  - [ ] 7.7 Verify every public Feature 1 test passes with unmodified assertions, and
        manually verify `packages/map` and `packages/embed` against the migrated API

- [ ] 8. Migrate the remaining direct Objection call sites (depends on: 6)
  - [ ] 8.1 Port `entries` to a repository, preserving the fixed server-side relation
        loading and owner-only column handling documented in the current service
  - [ ] 8.2 Port `autocomplete`, keeping the `to_tsquery` / `ts_rank` full-text query on
        `entries_search` along with its input escaping and length cap
  - [ ] 8.3 Port `admin/entries`, replacing `User.relatedQuery(...).for(...)`
  - [ ] 8.4 Port `admin/stats` and `admin/audit` onto the shared database module
  - [ ] 8.5 Port `src/hooks/email.js` (`withGraphFetched('users.[adminOrigins]')`) and
        `src/jobs/importEmailBounces.js`
  - [ ] 8.6 Repoint the jobs that currently reach the database via `BaseModel.knex()` at the
        shared database module

- [ ] 9. Remove the Objection dependencies (depends on: 5, 7, 8)
  - [ ] 9.1 Delete the Objection model classes from `src/models/`, moving any surviving
        column lists or relation maps into the repository or type layer
  - [ ] 9.2 Remove `objection`, `feathers-objection` and `objection-db-errors` from
        `packages/api/package.json` and the lockfile
  - [ ] 9.3 Confirm no file under `packages/api/src` imports any of the three, the full
        suite passes, and the app boots and serves requests
