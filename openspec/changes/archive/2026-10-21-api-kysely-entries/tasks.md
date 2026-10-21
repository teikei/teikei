# Tasks

## 1. Query inventories

- [x] 1.1 Collect the query strings sent to `/farms`, `/depots`, `/initiatives` and their admin counterparts from the production `teikei-api` nginx access logs. The logs cover only 14 days (2026-10-06 to 2026-10-20, the logrotate limit), and that was accepted. Finding: the API partner (TYPO3 job) reads `admin/farms` and `admin/initiatives` with `$details=true&$limit=10000`. Record the distinct parameters and operators per endpoint as a comment at the top of `src/repositories/{farms,depots,initiatives}.ts`, written now as stubs. Verify by matching the partner's requests from the logs against the recorded list, and keep the full partner request URLs for task 10.3.
- [x] 1.2 List the query strings `ra-data-feathers` sends for the `admin/farms`, `admin/depots` and `admin/initiatives` lists: filters, `q`, `hasBadge`/`notHasBadge`, sort and paging, and the `getMany` calls of the `ReferenceArrayInput`s that point at them. Get them from `packages/admin/src/resources` and from logged requests while exercising each list and edit page against the dev API. Record them next to the 1.1 comments. Verify that every logged query string matches an entry on the list.

## 2. Characterisation tests

These tests run over HTTP through the real `authorize` hook, like `src/services/__test__/lookups.test.ts`, and assert full response bodies. They must pass against the current `feathers-objection` services before any rewrite. Each later group may change them only for the differences listed in its own tasks.

- [x] 2.1 Public `farms`, `depots` and `initiatives` (`src/services/__test__/entriesPublic.test.ts`). Cover:
  - `find` in summary and `$details=true` shapes, and inactive entries excluded.
  - `$eager` and `$select`, as accepted today.
  - `get` as guest and as owner (owner sees `address`, `street`, `housenumber`).
  - 404 for missing and for inactive ids.
  - Owner `create` and `patch` with relations; `remove`.
  - A `create` with an explicit `id` (today the given id is stored).
  - 403 for a non-owner patch and for forbidden fields.
  - The external `update` status.

  Verify the tests pass on the current code.

- [x] 2.2 Admin `admin/farms`, `admin/depots` and `admin/initiatives` (`src/services/__test__/entriesAdmin.test.ts`). Cover:
  - Paged `find` with the 1.2 query strings, as superadmin, and as `admin@example.com` with admin origins inserted in the test, so origin scoping and `hasBadge`/`notHasBadge` take effect.
  - `get` with relation ids.
  - `find` with the partner's `$details=true&$limit=10000`, and `get` with `$details=true`, asserting the full nested relation records, including every `ownerships` user field.
  - `create` and `patch` with every relation, `create` with an explicit `id`, and `remove`.
  - The current failure of an admin `create` under the origin condition.

  Verify the tests pass on the current code.

- [x] 2.3 `entries` (summary, and `mine` with and without `id` + `type`), `admin/entries` and `admin/users/:userId/entries` (`src/services/__test__/entriesList.test.ts`). Verify the tests pass on the current code.
- [x] 2.4 Internal behaviour, with the `emails` service's `create` spied:
  - `entrycontactmessage` sends to every owner, and the template receives the entry and the owners.
  - Admin notification on public create (who receives it, and the locals).
  - `autocomplete` with `entries=true` (HERE request mocked) returns the ranked entry matches.

  Verify the tests pass on the current code.

## 3. Shared building blocks

- [x] 3.1 Add `src/repositories/users.ts` with `OWNER_COLUMNS` (`id`, `email`, `name`, `origin`, `baseurl`, `locale`), `ADMIN_OWNER_COLUMNS` (design.md, Decisions), and `findAdminsToNotify(origin)` (users with role `admin`, `adminEmailNotifications`, and the origin among their admin origins). Verify with repository tests against the test container, including one asserting that neither list ever returns a secret column (`password`, `reactivationToken`, the `verify*` and `reset*` token columns).
- [x] 3.2 Add the `replaceRelation(trx, joinTable, ownerColumn, ownerId, relatedColumn, ids)` helper (in `src/repositories/relations.ts`). Verify with repository tests for adding, removing and keeping ids, for an empty list, and for an unknown id rolling back the surrounding transaction with `Conflict`.
- [x] 3.3 Export `toProduct`, `toBadge` and `toGoal` from the lookup domains, typed to accept the summary column subsets. Verify `npm run typecheck` and the lookup tests pass.
- [x] 3.4 Move the test fixtures in `src/services/__test__/data/{farms,depots,initiatives}.js` from the Objection models to Kysely inserts returning the row with `type`. Update the existing tests that call `entry.type()` or the models directly (`farms.test.js`, `entries.test.js`). Verify the whole suite passes unchanged otherwise.

## 4. Authorization reads plain records

- [x] 4.1 Add `findForAuthorization(id, { activeOnly })` to the three entry repositories, returning `{ id, active, ownerships: [{ id }] }`. Add the origin-permission queries currently in `permissions.js` (`adminHasOriginPermissionFor{Farm,Depot,Initiative}`) as repository queries over the origin views and `admins_origins`. Verify with repository tests.
- [x] 4.2 Replace `fetchResource` in `src/hooks/authorization.js` with a loader map:
  - The public entry paths use the active-only lookup and raise `NotFound` otherwise.
  - The admin entry paths use the lookup without the active filter.
  - `users` uses `service.get(id, { provider: null })` without `$eager`.

  Switch the `permissions.js` conditions to `resource.ownerships` / `resource.active`, and the origin checks to the 4.1 queries. Verify the 2.1 and 2.2 tests pass unchanged, including the 404 for inactive entries and every 403.

## 5. Farms

- [x] 5.1 Write `src/repositories/farms.ts`:
  - Row queries: public `findMatching` with the 1.1 allowlist and forced `active = true`; admin `findPage` with the 1.2 allowlist plus the `q`/`name` ilike, `withBadge`, `withoutBadge` and `inOrigins` filters.
  - `findById`, `insert`, `update`, `delete`.
  - Batch loaders for products, badges, depots and ownerships, each taking its column list: the summary or nested depot columns for the public shapes, all columns (and `ADMIN_OWNER_COLUMNS`) for admin `$details`.

  Verify with repository tests.

- [x] 5.2 Add `src/domain/farms.ts`:
  - Summary, detail and admin shapes with `type`/`link` on the farm and on nested records. The admin shape has relation id arrays, or full nested records with `$details=true`.
  - Transactional `create` (Joi `farm` / `farmAdmin`, `createdAt`, relations, owner) and `patch` (`updatedAt`, relations).
  - `remove`, and `getForAuthorization` / `getWithOwners`.

  Verify via the 2.1 and 2.2 tests once 5.3 lands.

- [x] 5.3 Replace `src/services/farms.js` and `src/services/admin/farms.js` with `.ts` controllers:
  - Keep the `filterAllowedFields`, `refreshSearchIndex`, `toGeoJSON('depots')` and `sendNewEntryNotification` after-hooks, with `toGeoJSON` no longer calling `.toJSON()`.
  - Leave out public `update`.
  - Reject `$eager` and `$select` (1.1 found no external use).

  Verify the 2.1 and 2.2 farm tests pass with only these changes: `$eager`/`$select` answer 400, external `update` answers 405, an unknown relation id answers 409 with nothing written, a create with an explicit `id` stores a database-assigned id instead, and admin `$details` ownerships lack `reactivationToken`. Also verify a test asserts that a create whose relation write fails leaves no farm row.

## 6. Depots

- [x] 6.1 Add `src/repositories/depots.ts` following 5.1, with relations `farms` (entry columns, each with all product columns, or all columns for admin `$details`) and `ownerships`, and admin origin scoping. Verify with repository tests.
- [x] 6.2 Add `src/domain/depots.ts` following 5.2 (Joi `depot` / `depotAdmin`). Replace `src/services/depots.js` and `src/services/admin/depots.js` with `.ts` controllers (`toGeoJSON('farms')`). Verify the 2.1 and 2.2 depot tests pass with the same listed differences as 5.3.

## 7. Initiatives

- [x] 7.1 Add `src/repositories/initiatives.ts` following 5.1, with relations `goals`, `badges` and `ownerships`, and admin origin scoping. Verify with repository tests.
- [x] 7.2 Add `src/domain/initiatives.ts` following 5.2 (Joi `initiative` / `initiativeAdmin`). Replace `src/services/initiatives.js` and `src/services/admin/initiatives.js` with `.ts` controllers (`toGeoJSON()`). Verify the 2.1 and 2.2 initiative tests pass with the same listed differences as 5.3, plus the admin list sidebar's `badges.id=<id>` filter answering 400 instead of today's 500 (decided during implementation: the filter never worked, and `badges.id` is no column).

## 8. Entry lists

- [x] 8.1 Add `src/domain/entries.ts` composing the three repositories for the public listing (`PUBLIC_ENTRY_COLUMNS`, farm products, initiative goals), `mine` (owner columns and ownerships, filtered to the caller, optional `id` + `type`) and `admin/entries` (`id: "<Type>_<id>"`, `type`, `_id`, no `link`). Replace `src/services/entries.js` and `src/services/admin/entries.js` with `.ts` controllers. `filterOwnedEntries` reads `type` and moves into the domain, and the `toGeoJSON()` hook stays. Verify the 2.3 tests pass unchanged and the `entries.test.js` `$eager` test still holds.

## 9. Internal callers and search

- [x] 9.1 Rewrite `src/services/entryContactMessage.js` to use `getWithOwners` from the domain matching `type`. It answers `BadRequest` for any other `type` and passes the entry as GeoJSON and the owners with `OWNER_COLUMNS` to the template. Verify the 2.4 contact test passes, with owners now carrying `locale`, plus a new test for the rejected `type`.
- [x] 9.2 Rewrite `sendNewEntryNotification` in `src/hooks/email.js` to use `findAdminsToNotify` and the plain create result (no `.toJSON()`). Verify the 2.4 notification test passes unchanged.
- [x] 9.3 Add `src/repositories/entriesSearch.ts` with the ranked `to_tsquery` search and the concurrent `entries_search` refresh. Switch `src/services/autocomplete.js` and `src/services/searchIndex.js` to it. Verify the 2.4 autocomplete test and `autocomplete.test.js` pass, and that a test refreshes the view after a create and finds the new entry.

## 10. Cleanup and integration checks

- [x] 10.1 Remove what no service uses any more:
  - from `src/hooks/relations.js`: `relate`, `relateOwner`, `withEager`, `selectEntryColumns`, `selectActiveEntries`, `entryColumns` and `publicEntryColumns`
  - from `src/hooks/admin.js`: the entry parts of `parseQueryOptions`, `mapResult*RelationsToIds`, `buildQueryFromRequest` and `filterEntriesByOriginPermissions`

  Keep whatever `admin/users` and `users` still import. Verify with `npm run lint`, `npm run typecheck`, and a grep showing that no entry service imports `feathers-objection` or `src/models/{farms,depots,initiatives,entriesSearch}.js`.

- [x] 10.2 Verify the whole API passes `npm run lint`, `npm run typecheck` and `npm test` in `packages/api`, and the embed real-backend e2e suite (`npm run e2e:integration`) passes.
- [x] 10.3 Deploy to `teikei-api-preview`. Verify:
  - The embed map, entry details, my entries, and the create, edit and delete flows behave as before.
  - The legacy map's map, details and entry forms still work.
  - The admin farm, depot and initiative lists, filters (including badge filters as an origin-scoped admin) and edit forms behave as before.
  - The partner requests recorded in 1.1 (`GET /admin/farms?$details=true&$limit=10000` and `GET /admin/initiatives?$details=true&$limit=10000`), replayed with an admin token against preview and production, return the same bodies apart from the dropped `reactivationToken`. (Verified 2026-10-21 for the entries unchanged in both databases: the bodies match field for field apart from `reactivationToken`, user activity that differs between the two databases, and relation order, which led to ordering relations by related id.)

## Workflow follow-up

- Archive the change once it is merged to `preview` and verified there.
- Record the `admin/*:create` origin-condition defect (design.md, Risks) as a follow-up issue.
