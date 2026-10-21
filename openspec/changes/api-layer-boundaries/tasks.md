# Tasks

All commands run in `packages/api` unless noted. Throughout this change, the snapshots in `src/services/__test__/__snapshots__/` must stay byte-identical. `git diff --exit-code src/services/__test__/__snapshots__` is part of every verification below.

## 1. Shared building blocks

- [x] 1.1 Add `src/repositories/transaction.ts` with `transaction(db, fn)`, handing `fn` a `Database`-typed transaction. Make `replaceRelation`, `forEntries` and `byEntry` (moved from `domain/entryRecords.ts`) module-internal helpers of `src/repositories/`. Verify that `npm run typecheck` passes and `repositories/__test__/entryBuildingBlocks.test.ts` passes with its imports updated.
- [x] 1.2 Add `mapDatabaseErrors` (an error hook around `toFeathersError`) to `src/db/errors.ts`, and export a `ListQuery` alias from `src/db/feathersQuery.ts`. Verify with a unit test that the hook maps a `pg.DatabaseError` 23503 to `Conflict` and passes a `NotFound` through unchanged.
- [x] 1.3 Add `src/services/serializers.ts` with `toProduct`, `toBadge`, `toGoal`, `toOrigin`, `toRole` and `toOwner`, moved from the lookup domains and `entryRecords.ts`. Verify that `npm run typecheck` passes.

## 2. Lookups

- [x] 2.1 Rework `domain/{products,goals,badges,origins,roles}.ts`:
  - take `string` ids and `ListQuery`
  - take value types from their repositories (`ProductValues`, …) instead of `kysely` and `db/types.ts`
  - drop `withFeathersErrors` and the `toX` helpers

  Update `services/{products,goals,badges}.ts` and `services/admin/{products,goals,badges,origins,roles}.ts` to convert ids, serialise with `serializers.ts`, and register `mapDatabaseErrors`. Verify that `lookups.test.ts`, `adminLookups.test.ts` and `repositories/__test__/lookups.test.ts` pass with unchanged snapshots.

## 3. Farms

- [x] 3.1 In `repositories/farms.ts`:
  - add the read shapes from design.md (summaries, details, admin page and by id with `{ details }`, owned, map entries), assembling relations inside the repository
  - add `saveRelations(id, relations, tx)`
  - export `FarmValues`, `FarmChanges` and the relation input type

  Cover `saveRelations` in `repositories/__test__/entries.test.ts`: replacing and keeping order, ignoring absent keys, and an unknown id raising the foreign-key error. Verify that the repository tests pass.

- [x] 3.2 Rewrite `domain/farms.ts` on top of the read shapes, `saveRelations` and `transaction`. The write response re-reads the admin details shape and keeps the written keys. The domain takes plain arguments (`details: boolean`, `AdminUser`, badge filters, `string` ids) and keeps `adminFilters`, `withoutServerFields`, validation and `notFound`. Verify that `npm run typecheck` passes.
- [x] 3.3 Add `toFarm` to `serializers.ts`, covering nested products, depots, badges and owners. Update `services/farms.ts` and `services/admin/farms.ts` to parse `$details`, `hasBadge`/`notHasBadge` and `params.user`, serialise, and register `mapDatabaseErrors`. Verify that the farm cases in `entriesPublic.test.ts` and `entriesAdmin.test.ts`, and `farms.test.js`, pass with unchanged snapshots.

## 4. Depots and initiatives

- [x] 4.1 Apply group 3 to depots: repository read shapes (including nested farms with their products) and `saveRelations` with a repository test, the domain rewrite, `toDepot`, and both controllers. Verify that the depot cases in `entriesPublic.test.ts` and `entriesAdmin.test.ts`, and `depots.test.js`, pass with unchanged snapshots.
- [x] 4.2 Apply group 3 to initiatives: read shapes with goals and badges, `saveRelations` with a repository test, the domain rewrite, `toInitiative`, and both controllers. Verify that the initiative cases in `entriesPublic.test.ts` and `entriesAdmin.test.ts`, and `initiatives.test.js`, pass with unchanged snapshots.

## 5. Entries and internal callers

- [x] 5.1 Make `domain/entries.ts` return `{ farms, depots, initiatives }` from the repositories' map-entry and owned shapes, with the `mine` `type` + `id` filter applied per group. The `entries` controller flattens and serialises the groups; the `admin/entries` controller builds the `<Type>_<id>`/`_id` keys without `link`. Both register `mapDatabaseErrors`. Verify that `entriesList.test.ts` and `entries.test.js` pass with unchanged snapshots.
- [x] 5.2 Update `services/entryContactMessage.js` to serialise `getWithOwners` results before `parseGeoJSON`, and register `mapDatabaseErrors`. Point `hooks/authorization.js` and `permissions.js` at the reworked domain methods (`string` ids). Add a test to `entriesPublic.test.ts` that sends a database error through `authorize` (a non-numeric id on `farms` patch) and asserts the same status as before this change. Verify that `entriesInternal.test.ts` and the new test pass.
- [x] 5.3 Delete `domain/entryRecords.ts`, and remove `withFeathersErrors` if nothing uses it any more. Verify with `grep -rn "entryRecords\|withFeathersErrors" src` (no hits apart from the definition, if kept) and `npm run typecheck`.

## 6. Boundary enforcement and documentation

- [x] 6.1 Add the `no-restricted-imports` block for `packages/api/src/domain/**` to `eslint.config.js`: the `kysely`, `pg`, `@feathersjs/feathers` and `@feathersjs/adapter-commons` packages; `**/db/types*` and `**/db/feathersQuery*` (allowing the `ListQuery` type import is part of this task); and upper-case names from `**/repositories/*`, with a message that points to `AGENTS.md`. Verify that `npm run lint` (repo root) passes, and that adding `import { sql } from 'kysely'` to a domain file temporarily makes it fail.
- [x] 6.2 Add a `packages/api` implementation-rules section to `AGENTS.md`, next to the `packages/embed` one, covering:
  - the three layers and what each owns (design.md "Layer responsibilities")
  - `transaction(db, fn)`
  - serialisers in `src/services/serializers.ts`
  - `mapDatabaseErrors`
  - the lint rule
  - the existing direct-repository callers (`searchIndex`, `autocomplete`, `hooks/email.js`) as known exceptions

  Verify by checking every rule against the code from groups 2–5.

## 7. Integration check

- [x] 7.1 Run `npm run typecheck`, `npm test` and the root `npm run lint`. Verify that all pass and that `git diff --exit-code src/services/__test__/__snapshots__` is clean.
- [ ] 7.2 Deploy to `teikei-api-preview` and run the smoke checks from design.md (Migration Plan). Verify that the embed map, legacy map, entry create/edit, my entries, and the admin lists and edit forms work as before.

## Workflow follow-up

- Revise `api-kysely-users-auth` (`/opsx:update`) so its users repository/domain follows these rules. Role and admin-origin sync should become `saveRelations`-style repository methods inside `transaction`.
- Revise `api-kysely-remove-objection` to follow the same rules for the email campaign and message domains, and decide where the Joi schemas go (next to the domains).
- Archive this change after review and the preview checks.
