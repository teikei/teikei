# Design

## Context

See proposal.md for motivation and scope. Current state that shapes the approach:

- **Factories:** every layer is a factory that takes `db` and builds the layer below it (`createFarmsRepository(db)`, `createFarmsDomain(db)`, `createFarmsController(db)`), as `api-kysely-foundation` set up. This change keeps that.
- **What the entry domains do today** (`domain/{farms,depots,initiatives}.ts`, each about 260–285 lines):
  - choose column lists (`FARM_COLUMNS`, `NESTED_DEPOT_COLUMNS`, `BADGE_SUMMARY`, `ADMIN_OWNER_COLUMNS`, `['id']`) for each relation loader
  - group the entry-tagged relation rows with `byEntry`
  - call `replaceRelation` with join-table and column names
  - add `type`/`link`, at the top level and on nested records
  - unwrap `$details`, `hasBadge` and `notHasBadge` from the Feathers query
  - wrap every call in `withFeathersErrors`
- **`domain/entries.ts`** merges the three types into one list. It filters `mine` by `entry.type`, and builds the admin `<Type>_<id>` keys without `link`.
- **Lookup domains** (`products`, `goals`, `badges`, `origins`, `roles`) have the same mix at a smaller scale: `Query` and `Id` from `@feathersjs/feathers`, `Insertable<Products>` from `kysely` and `db/types.ts`, `withFeathersErrors`, and `toProduct`-style helpers that the entry domains reuse for nested records.
- **Callers outside the controllers:**
  - `hooks/authorization.js` and `permissions.js` call `getForAuthorization` and `isInAdminOrigins`. Neither returns `type`/`link`.
  - `services/entryContactMessage.js` calls `getWithOwners` and needs `type` for `parseGeoJSON` and `permalink`.
- **Write responses** for each entry type carry the full records of the relations present in the input. These come from the same loaders and columns as the admin `$details` shape: products, goals, badges with `BADGE_COLUMNS`, depots with `DEPOT_COLUMNS`, farms with `FARM_COLUMNS`, and owners with `ADMIN_OWNER_COLUMNS`.
- **Safety net:** `services/__test__/entries{Public,Admin,Internal,List}.test.ts` assert full bodies over HTTP through the real `authorize` hook, and the lookup tests do the same for the lookups.

## Goals / Non-Goals

**Goals:**

- Each concern has one layer, and a lint rule enforces the boundary for the domain layer.
- The entry domains become small enough that the remaining duplication between farms, depots and initiatives is easy to see and stays acceptable.

**Non-Goals:**

- A generic entry abstraction across the three types. Each type keeps its own repository, domain and controller, written out.
- Enforcing "controllers call only domains" by lint. Three existing callers (`services/searchIndex.js`, `services/autocomplete.js` and `hooks/email.js`) use repositories directly. The convention is documented; enforcing it can come with a later change.

## Decisions

### Layer responsibilities

```
  Controller   src/services/<name>.ts, src/services/serializers.ts
     |  Feathers params/Id/query parsing, type/link and other response
     |  shapes, database error mapping (error hook), hook registration
     v
  Domain       src/domain/<name>.ts
     |  validation, transaction boundary, orchestration across
     |  repositories, rules (admin origin scoping, not found, server-
     |  assigned fields), plain typed arguments, plain records
     v
  Repository   src/repositories/<name>.ts
     |  Kysely queries, column lists, join tables, relation reads
     |  assembled onto their entries, relation writes, row/value types,
     |  Feathers query translation (db/feathersQuery.ts)
     v
  Postgres
```

These rules go into a new `packages/api` section of `AGENTS.md`. They replace the foundation design's "domains add `type` and `link`" and "repositories accept an optional transaction so a domain can compose them".

### Domain imports, enforced by ESLint

- A `no-restricted-imports` block for `packages/api/src/domain/**` bans:
  - the `kysely`, `pg`, `@feathersjs/feathers` and `@feathersjs/adapter-commons` packages
  - `**/db/types*` and `**/db/feathersQuery*`
  - from `**/repositories/*`: any import whose name is all upper-case (`importNamePattern: '^[A-Z][A-Z0-9_]*$'`), which covers the exported column lists. ESLint 10.4 supports `importNamePattern`.
- **Still allowed:**
  - `@feathersjs/errors`. `NotFound` and `BadRequest` remain the application's error vocabulary, which hooks and clients already depend on. A domain error type plus a mapping would add a layer without changing any behaviour.
  - The `Database` type from `db/kysely.ts`. The domain only passes it on to repository factories and `transaction`, and keeping the factory signature avoids changing every caller.
- **Alternative rejected:** injecting repositories into domains instead of `db`. That would change every factory, caller and test for no real gain, because tests replace the database, not layers.

### Transactions through an opaque handle

- `repositories/transaction.ts` exports `transaction(db, fn)`, which runs `fn(tx)` inside `db.transaction().execute(...)`. `tx` is typed as `Database`, and repositories already accept an optional `trx: Database` on every method. A Kysely `Transaction<DB>` is a `Kysely<DB>`, so no new type is needed.
- The domain decides _that_ a write is atomic. The repository decides _how_.
- **Alternative rejected:** a unit-of-work object that bundles the repositories. It would be more machinery than three write paths need.

### Relation writes are intent-level repository methods

- Each entry repository gets one method, `saveRelations(id, relations, tx)`. It replaces the join rows for each key present in the input and ignores absent keys.
- Example: farms take `{ products, badges, depots, ownerships }`.
  - The farms repository maps each key to its join table and columns, and calls the existing `replaceRelation`, which becomes module-private to the repositories.
  - Setting the owner on public create becomes `saveRelations(id, { ownerships: [ownerId] }, tx)`.
- **Write response:** the domain re-reads the written entry with the admin details shape inside the same transaction, and keeps only the relation keys that were in the input. That is the same data `writeRelations` collects today (see Context).
  - Trade-off: a write runs the loaders for every relation, not just the written ones. Writes are rare, and it removes a second set of loader calls.
- `RelationIds` and the per-type relation input types move to the repositories, next to the value types (`FarmValues = Insertable<Farms>`, `FarmChanges = Updateable<Farms>`).

### Relation reads return assembled read shapes

- Each entry repository exposes named read shapes, not individual loaders. The names below are indicative. They are fixed during implementation, and each one is documented in the repository's header inventory.
  - **Farms:** `findSummaries(query)` (entry columns + products), `findDetails(query)` and `findDetailsById(id)` (farm columns + products, nested depots, badge summaries), `findAdminPage(query, filters, { details })` and `findAdminById(id, { details })`, `findOwned(userId, { activeOnly })`, `findMapEntries()` (public entry columns + products).
  - Depots and initiatives follow the same pattern with their own relations.
  - `findForAuthorization`, `findWithOwners` and `isInAdminOrigins` stay as they are.
- **Admin `details: false`** returns relation id arrays from the cheap `['id']` loaders. This stays a repository parameter rather than a mapping in the controller, so the API partner's `$limit=10000` pull and the react-admin lists keep today's query cost.
- `byEntry`, `toId`, `qualify` and the column constants become repository-internal. `repositories/entries.ts` keeps the shared column lists and `AdminFilters`.
- Nested records come back without `type`/`link`. The serialisers add them (see below).

### Serialisation in the controller layer

- `src/services/serializers.ts` holds one function per record type: `toFarm`, `toDepot`, `toInitiative`, `toOwner`, `toProduct`, `toBadge`, `toGoal`, `toOrigin`, `toRole`.
  - Each adds `type` and `link`, and serialises the nested relations it knows about. For example, `toFarm` maps `products`, `depots`, `badges` and `ownerships` when they are present and are records, not id arrays.
  - These are explicit per-type functions, not a generic walker.
- **Entries:**
  - `domain/entries.ts` returns `{ farms, depots, initiatives }`. The `mine` filter by `type` and `id` becomes a filter on the matching group.
  - The `entries` controller flattens the groups in today's order and serialises them.
  - The `admin/entries` controller builds the `<Type>_<id>` and `_id` keys without `link`.
- **Internal callers:** `services/entryContactMessage.js` serialises the result of `getWithOwners` with `toFarm`/`toDepot`/`toInitiative` before `parseGeoJSON`. The authorization paths don't need `type`/`link`.
- **Alternative rejected:** keeping `type` in the domain as the entry kind. The grouped return already carries the kind, and `type` and `link` stay together in one place.

### Feathers parsing in the controller

- **Controllers:**
  - Convert `Id` to `string`.
  - Read `$details === 'true'` into a boolean.
  - Take `hasBadge`/`notHasBadge` out of the admin query.
  - Pass `params.user` in the domain's own shape (`AdminUser`, owner id).
- **The remaining filter query** (`$limit`, `$skip`, `$sort`, allowlisted columns, `q`/`name`) is the admin wire contract, and the repository translates it (`db/feathersQuery.ts`, `withNameSearch`). The domain passes it through as an opaque `ListQuery` type, exported from `db/feathersQuery.ts` as an alias of the Feathers `Query`. That keeps `@feathersjs/feathers` out of the domain imports, without pretending the shape is anything other than the translator's input.
- **Domain rules that stay in the domain:**
  - `adminFilters` (superadmins unscoped, badge filters replacing origin scoping)
  - `withoutServerFields`
  - the react-admin "empty patch returns the record" rule in the lookup domains
  - `notFound`
- **Alternative rejected:** a domain-owned query type that the controller builds from Feathers syntax. It would duplicate the translator's allowlist logic one layer up.

### Database errors mapped by an error hook

- `db/errors.ts` exports `mapDatabaseErrors`, a Feathers error hook that runs `toFeathersError` on `ctx.error`. Each migrated service registers it as `error: { all: [mapDatabaseErrors] }`.
- `withFeathersErrors` is removed from the domains.
- `toFeathersError` already passes `FeathersError`s through unchanged, so `NotFound` and `BadRequest` raised by domains keep their classes.
- `services/entryContactMessage.js` registers the same hook.
- **Callers outside a service's hook chain map errors themselves.** A service's error hooks do not run for errors thrown in the app-level `authorize` before-hook (confirmed by the test from task 5.2). So the `authorize` entry loader and the admin origin conditions in `permissions.js` wrap their domain calls in `withFeathersErrors`, which stays in `db/errors.ts` for them.
- **Alternatives rejected:**
  - `withFeathersErrors` around each controller method: more repetition for the same effect.
  - An app-wide error hook: it would also turn plain `Error`s from not-yet-migrated services into `GeneralError` with different handling, which is out of scope.

### Lookups

- The lookup domains lose their `Query`, `Id`, `Insertable` and `withFeathersErrors` usage, and their `toX` helpers move to `serializers.ts`.
- What remains is thin: `get` with `notFound`, the empty-patch rule, and pass-through lists.
- The layer stays for uniformity, so that controllers depend on domains only.
- **Alternative rejected:** letting lookup controllers call repositories directly. That would mean two patterns to document, and an exception in any later controller rule.

## Risks / Trade-offs

- **[A serialiser misses a nested relation, so `type`/`link` disappears from a nested record]** → The HTTP snapshots pin every nested shape (public details, admin `$details`, write responses), and they must pass unchanged.
- **[Error hook ordering: the `authorize` before-hook loads through the domain, and a database error there must still be mapped]** → The service error hooks do not cover app before-hooks, so `authorize` and its permission conditions map errors with `withFeathersErrors` (see Decisions). A test forces a database error through `authorize` (a non-numeric id on `PATCH`) and asserts the 400 `BadRequest` that the code before this change returned.
- **[Write responses re-read every relation]** → One extra round of loader queries on create and patch only. Accepted.
- **[`importNamePattern` also blocks a legitimately upper-case export added later]** → Repositories export only column lists in upper case today. The lint message names the rule's reason, so an exception is a deliberate choice.

## Migration Plan

- Pure refactor, deployed as a normal API release. No schema change, no data migration.
- Verify on `teikei-api-preview` with the same smoke checks as `api-kysely-entries`: embed and legacy map, entry create/edit, my entries, and the admin lists and edit forms.
- Rollback is a git revert and redeploy.
