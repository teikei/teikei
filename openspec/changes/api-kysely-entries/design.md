# Design

## Context

See proposal.md for motivation and scope. The layering, factories, query translator (`src/db/feathersQuery.ts`) and error mapper (`src/db/errors.ts`) come from `api-kysely-foundation` and are reused unchanged unless noted. Current state that shapes this change:

- **Public services** (`farms`, `depots`, `initiatives`) are `feathers-objection` services shaped by hooks:
  - `find`, summary (default): `entryColumns()` plus, for farms only, `products(id, category, name)`.
  - `find` with `$details=true`, and `get`: every column, plus
    - farms: `depots` (entry columns, `description`, `deliveryDays`, `url`), `products`, `badges(id, name, category, url, logo)`
    - depots: `farms` (entry columns, each with all product columns)
    - initiatives: all goal columns and the filtered badges
  - `find` and `get` both add `active = true`.
  - After-hooks run in order `filterAllowedFields` → `refreshSearchIndex` → `toGeoJSON(nested)`.
  - Nested records are Objection models, so they carry their own `type` and `link`.
- **Writes:**
  - Public create runs Joi (`schemas.farm`, `depot`, `initiative`) on insert only, never on patch.
  - After the write, `relate(model, relation)` replaces each relation present in `data` through `upsertGraph` in its own transaction. It attaches the full related records to the result and swallows errors.
  - `relateOwner` sets `ownerships` to the current user on public create.
- **Admin services** (`admin/farms`, `admin/depots`, `admin/initiatives`):
  - Paginated (default 50, no maximum) and always eager-load every relation, mapping them to id arrays on `find` and `get`.
  - react-admin never sends `$details`, but the API partner does. With `$details=true` the id mapping is skipped, and each relation comes back as full rows (every column) with `type`/`link`:
    - farms: `products`, `badges`, `depots`, `ownerships`
    - depots: `farms`, `ownerships`
    - initiatives: `goals`, `badges`, `ownerships`
  - Those `ownerships` are user rows minus the fields `User.$formatJson` strips (`password`, the `verify*` and the `reset*` token columns), so `reactivationToken` is still in the response.
  - `q`, `name` → `name $ilike`.
  - `hasBadge`, `notHasBadge` and `hasOrigin` are Objection modifiers over the `farms_origins`, `depots_origins` and `initiatives_origins` views. For admins without the `superadmin` role, `hasOrigin` scopes every list to their admin origins.
- **`entries`** merges active farms (with products), depots and initiatives (with goals) using `publicEntryColumns`. `mine=true` additionally loads `ownerships(id)`, keeps the caller's own entries (optionally filtered by `id` + `type`) and strips the ownerships. `admin/entries` lists one user's entries with `id: "<Type>_<id>"`, `type` and `_id`, but no `link`.
- **Authorization:**
  - `authorize` loads the stored resource through `service.get(id, { query: { $eager: '[ownerships]' }, provider: null })` whenever a scope has a `condition` or `fields`.
  - Its conditions read `resource.properties.*`, because the service returns GeoJSON.
  - `get` filters on `active = true`, so authorizing a request against an inactive entry answers 404.
  - The admin origin checks in `permissions.js` are raw knex queries.
- **Query inventory (task 1.1):** the production `teikei-api` access logs covered 2026-10-06 to 2026-10-20, which is all logrotate keeps. Those 14 days were accepted, because the TYPO3 job is the only external integration not driven by code in this repo.
  - The partner signs in every 6 hours and calls `GET /admin/farms?$details=true&$limit=10000`, `GET /admin/initiatives?$details=true&$limit=10000`, and `GET /admin/users?$limit=10000`. The users call is out of scope.
  - On the public endpoints, `$details=true` came only from crawlers. `$select` and `$eager` came only from the maintainer's own experiments. No other query parameter was sent apart from one `search=…`, which fails with 500 today.
- **Database types:** Postgres `int8` and `numeric` come back from `pg` as strings (ids `"1"`, coordinates `"52.5163"`). Kysely uses the same driver and type parsers, so separate queries return the same types.
- **Existing tests:** `farms`, `depots`, `initiatives` and `entries` tests mock `hooks/authorization` and `hooks/email` and assert selected fields only. They don't pin full bodies, authorization or admin behaviour.

## Goals / Non-Goals

**Goals:**

- Byte-compatible responses for every public, admin and internal caller of the migrated services. That includes the API partner's admin `$details=true` bulk read (except that `ownerships` no longer carry `reactivationToken`), the public `$details=true` shape, the GeoJSON envelopes, the nested relation shapes, the string-typed ids and coordinates, the status codes and the error codes.
- Atomic entry writes: the row, its relations and its ownership commit or roll back together.
- Authorization works on plain records from the domains, without a Feathers round trip or `$eager`.

**Non-Goals:**

- Fixing `refreshSearchIndex` running after every read. It is kept as is.
- Changing Joi schemas or validating patches.
- Fixing the existing `admin/*:create` origin condition, which dereferences a missing resource (see Risks).
- Migrating users, email-origin configuration or the `audit.js` timestamp hooks for other services.

## Decisions

### Repositories: one per entry type, relations loaded in batches

- **Repositories:** `src/repositories/{farms,depots,initiatives}.ts` each provide:
  - row queries: `findMatching` (public), `findPage` (admin) and `findById`
  - `insert`, `update` and `delete`
  - relation loaders that take a list of entry ids and return rows tagged with the entry id
- **Assembly:** domains group the loaded relation rows onto their entries. This is what Objection's `withGraphFetched` does: one query per relation, never N+1.
- **Alternative rejected: `jsonArrayFrom` correlated subqueries.** They would be one query, but values inside `json_agg` come back as JSON numbers. Nested ids and coordinates would turn from `"1"` into `1` and drift from today's responses.
- **Column lists live in the repositories** as named constants:
  - `ENTRY_COLUMNS` and `PUBLIC_ENTRY_COLUMNS`, replacing `entryColumns` and `publicEntryColumns` in `hooks/relations.js`
  - the nested depot columns
  - `PRODUCT_SUMMARY` and `BADGE_SUMMARY`
- **Owners:** `src/repositories/users.ts` starts here with two column lists and the admin-notification query:
  - `OWNER_COLUMNS` (`id`, `email`, `name`, `origin`, `baseurl`, `locale`) for the public and contact paths.
  - `ADMIN_OWNER_COLUMNS` for admin `$details`. It is today's admin set minus every secret: `id`, `email`, `name`, `phone`, `origin`, `baseurl`, `locale`, `isVerified`, `createdAt`, `updatedAt`, `lastLogin`, `adminEmailNotifications`, `resetAttempts`, `state`, `active`, `reminderSentAt`, `secondReminderSentAt`, `bounceType` and `bounceName`.

  Every user column an entry query reads comes from this module, so no query can select `password` or a token column by accident. `api-kysely-users-auth` extends the module.

- **Search:** `src/repositories/entriesSearch.ts` holds the `to_tsquery`/`ts_rank` search and `REFRESH MATERIALIZED VIEW CONCURRENTLY entries_search`, both through Kysely `sql`.

### Domains: shape records, own validation and transactions

- **Entry domains:** `src/domain/{farms,depots,initiatives}.ts` return plain records with `type` and `link` added, and nested records with their own `type`/`link`. The lookup domains export their `toProduct`/`toBadge`/`toGoal` helpers, which today are module-private, so the nested shapes match the lookups'.
- **`entries` domain:** `src/domain/entries.ts` composes the three for `entries`, `mine` and `admin/entries`.
- **Create** runs in one `db.transaction()`:
  1. Validate the input with the existing Joi schema (`validate` from `src/db/errors.ts`). The admin variants use the `*Admin` schemas.
  2. Split off the relation keys, then drop `type`, `link` and `id`:
     - `type` and `link` were Objection virtual attributes.
     - `feathers-objection` already strips `id` on patch, but on create it inserts it today, so a client could choose an entry's primary key. Neither client sends one. Accepting it would also let a caller insert ids ahead of the sequence, so that later generated ids collide.
     - Dropping `id` on create is therefore an intended behaviour change (see proposal.md): the database always assigns the id.
  3. Insert the row with `createdAt`.
  4. Replace each relation present in the input.
  5. On public create, set `ownerships` to the caller.
- **Patch** follows the same steps without validation, setting `updatedAt` instead.
- **Response:** the result keeps today's shape: the written row plus the full records of every relation that was in the input.
- **Timestamps** move from the `setCreatedAt`/`setUpdatedAt` hooks into the domains for the migrated services. The hooks stay for services that still use them.
- **Relation replacement** is one helper, `replaceRelation(trx, joinTable, ownerColumn, ownerId, relatedColumn, ids)`: delete the join rows not in `ids`, insert the missing ones. Unknown ids hit the foreign keys added in `20260701120000_add_missing_foreign_keys` and surface as `Conflict` through `toFeathersError`, rolling back the whole write. This is the intended behaviour change from the proposal. Deleting an entry relies on the existing `ON DELETE CASCADE` for its join rows.
- **Alternative rejected:** keeping `relate` as an after-hook on top of Kysely. It would keep the non-atomic write and the swallowed errors, which this change exists to remove.

### Controllers and the hook boundary

- **Controllers:** `src/services/{farms,depots,initiatives}.ts` and `src/services/admin/{farms,depots,initiatives}.ts` are thin, and `entries` and `admin/entries` become `.ts` controllers. They implement only the methods the resource exposes. Public `update` is left out, replacing `disallow()`; as with the lookups, external callers then get 405 instead of 403.
- **The authorization-layer after-hooks stay hooks**, in today's order: `filterAllowedFields`, then `refreshSearchIndex`, then `toGeoJSON`. `filterAllowedFields` must run on the flat record before GeoJSON conversion. `toGeoJSON` loses its `.toJSON()` call and `filterOwnedEntries` reads `type` instead of `type()`.
- **Admin controllers** return relation id arrays directly from the domain by default. With `$details=true`, the domain attaches full nested records from the same batch loaders instead: every column, `type`/`link`, and `ADMIN_OWNER_COLUMNS` for ownerships. As a result, `mapResultRelationsToIds`, `parseQueryOptions` and `withEager` go away for entries.
- **Notifications:** `sendNewEntryNotification` stays an after-create hook, reading admins through the users repository and the plain result.

### Public query contract

- **Accepted parameters:**
  - `$details` (`'true'` selects the detail shape; any other value, or none, selects the summary)
  - `$limit`, `$skip`, `$sort`
  - a per-resource column allowlist through `findMatching`
- **The allowlist and operators** are fixed from the production query-string inventory (task 1.1). It found no filter in use, so the allowlist is empty.
- **`get` ignores `$details`**, as today.
- **Rejected with `BadRequest`:** `$eager` and `$select`, from clients and internally. The inventory found no external caller sending them.
- **`active = true`** is added by the repository query, not taken from the client query, so a client cannot override it.

### Admin query contract

- `src/repositories/*` declare the admin column allowlists. `q` and `name` become `name $ilike '%…%'`.
- `$details` is accepted next to `$limit`, `$skip` and `$sort`. `'true'` selects the full nested relation shape; any other value, or none, selects the id arrays. `$limit` has no maximum, because the partner sends `$limit=10000`.
- `hasBadge=<id>` and `notHasBadge=<id>` (farms only) and origin scoping become named filters:
  - `withBadge`, `withoutBadge` and `inOrigins` are `whereExists` subqueries on the origin views and `farms_badges`.
  - They take the admin's origins from `params.user.adminOrigins`.
  - As today, the badge filters replace the origin scoping instead of adding to it, and superadmins are not origin-scoped.
- **Inventory:** the exact `ra-data-feathers` query strings for the three admin lists, their filters, and the `ReferenceArrayInput`s that point at them are recorded at the top of each repository, as task 4.1 of the foundation did for the lookups.

### Authorization reads from the domains

- **Loader:** `authorize` keeps its scope logic but loads the resource through a loader map keyed by service path:
  - The public paths use `domain.getForAuthorization(id)`. It returns `{ id, active, ownerships: [{ id }] }` for active entries and raises `NotFound` otherwise, preserving today's 404.
  - The admin paths use the same call without the active filter.
  - `users` keeps `service.get(id, { provider: null })`, without `$eager`, until `api-kysely-users-auth`.
- **Permission conditions** in `permissions.js` read `resource.ownerships` and `resource.active` instead of `resource.properties.*`.
- **Origin checks** become repository queries over the origin views and `admins_origins`.
- **Alternative rejected:** a `params.withOwnerships` flag on `service.get`. It keeps a Feathers round trip, the after-hooks and the GeoJSON conversion in the authorization path just to read three fields.

### Internal callers

- **`entryContactMessage`:**
  - Calls `domain.getWithOwners(id)` for the requested type, instead of `app.service(\`${type}s\`).get(id, { $eager })`.
  - `type` is checked against `farm`, `depot` and `initiative`; anything else gets `BadRequest`. Today any service name can be reached that way.
  - The template still receives the GeoJSON `entry` (it reads `entry.properties.name`) and owners with `locale`. Today the `ownerships` eager filter drops `locale`, so contact mails always use the default locale. Selecting `OWNER_COLUMNS` fixes that.
- **`autocomplete`** keeps its HERE request and term sanitising; only the `entries_search` query moves to the repository.

## Risks / Trade-offs

- **[Response drift: nested `type`/`link`, string vs. number ids and coordinates, `null` vs. missing fields, and the partner's admin `$details` bulk shape]** → Characterisation tests assert full bodies over HTTP, through the real `authorize` hook, before any rewrite, and must pass unchanged afterwards. Every intended difference is listed in the tasks.
- **[The partner sends parameters the allowlist rejects]** → The production inventory came first and defines the allowlist. Before production, the partner's recorded admin requests are replayed with an admin token against preview and production and their bodies compared.
- **[Two pools, no cross-library transaction]** → An entry's whole read and write path moves at once. The remaining Objection writers (users) don't write entry tables.
- **[Admin users' and roles' Objection relation mappings still reference `Farm`, `Depot` and `Initiative`]** → Those model classes stay, unused by services, until `api-kysely-remove-objection`.
- **[Existing defect: the `admin/{farms,depots,initiatives}:create` scopes have an origin `condition`, but create has no id]** → The condition receives no resource and throws. It is kept as is, pinned by a characterisation test, and recorded for a follow-up instead of silently changing admin permissions here.
- **[`refreshSearchIndex` after every read]** → Unchanged load profile. It is out of scope and noted.

## Migration Plan

- No schema change and no data migration. The change deploys as a normal API release.
- Verify on `teikei-api-preview` with:
  - the embed map (map, entry details, my entries, create/edit flows)
  - the legacy map
  - the admin farm, depot and initiative lists, filters and edit forms
  - the partner's `admin/farms` and `admin/initiatives` `$details=true` requests, replayed with an admin token against preview and production, with bodies identical apart from `reactivationToken`
- Rollback is a git revert and redeploy.
