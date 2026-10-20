# Proposal

## Why

Entries (farms, depots, initiatives) are the core of the API and its most entangled Objection consumer. They run on `feathers-objection` services that accept client-controlled `$eager` and `$select`. Relation writes happen in after-hooks that run outside the entry's transaction and swallow failures. Several hooks depend on Objection model instances (`toJSON()`, `type()`), and the authorization hook loads resources through `$eager`. This is step 2 of the roadmap in `api-kysely-foundation`: it moves entries onto the repository → domain → controller pattern on Kysely that the lookups proved.

## What Changes

- Migrate the public `farms`, `depots` and `initiatives` and the admin `admin/farms`, `admin/depots` and `admin/initiatives` services to repositories, domains and thin `.ts` controllers.
- Migrate `entries` (including `mine`), `admin/entries` (which `admin/users/:userId/entries` delegates to), the entry search in `autocomplete` (`entries_search`), and `searchindex`.
- Relation writes (products, badges, depots, goals, farms, ownerships) become part of the entry's create/patch transaction. A failed relation write now fails the request; today it is logged and the request returns success with stale relations.
- `authorize` loads the resource for conditional and field-scoped permissions from the domains instead of calling `service.get` with `$eager`. Permission conditions read flat records instead of GeoJSON properties. The admin origin checks in `permissions.js` move to Kysely.
- `entryContactMessage` and `sendNewEntryNotification` read owners and admins through repositories instead of `$eager` / `withGraphFetched`.
- `entryContactMessage` accepts only `farm`, `depot` and `initiative` as `type` and answers anything else with `BadRequest`. Today it builds a service name from the client-supplied `type`, so any service with a `get` can be reached.
- Entry contact mails use the owner's `locale`. Today the owner lookup drops `locale`, so they always go out in the default language.
- External `update` (PUT) on `farms`, `depots` and `initiatives` answers 405 instead of 403, because the controllers leave the method out. The migrated lookups already do this.
- An `id` in a create request (public or admin) is ignored, so the database always assigns it. Today `feathers-objection` inserts a client-supplied `id`, which lets a caller choose the primary key and push past the id sequence. No client sends one.
- Public query contract:
  - `$details=true` stays, with the same summary and detail response shapes, because an API partner uses it to read entries with details in bulk.
  - The accepted filters are fixed from an inventory of the query strings production traffic sends to these endpoints.
  - **BREAKING:** `$eager` and `$select` are rejected with `BadRequest` unless the inventory shows a partner relies on them.
- The admin `hasBadge`, `notHasBadge` and origin-scoping filters (Objection `$modify` modifiers) become named repository filters. Admin responses keep their relation id arrays.
- Nested user data in entry responses (ownerships) is read with an explicit safe column list. Objection's `User.$formatJson` no longer guards it.
- Otherwise, paths, response shapes (GeoJSON envelopes, `type`, `link`, nested relations), status codes and error codes stay the same.

Out of scope:

- Users and authentication, covered by `api-kysely-users-auth`.
- Email campaigns and messages, stats, audit and jobs, plus removing Objection, covered by `api-kysely-remove-objection`.
- Changing validation: Joi still runs on create only, not on patch.

## Capabilities

### New Capabilities

None. This is a refactor. The only intended behaviour changes are the ones listed under What Changes: rejecting unsupported query parameters, surfacing failed relation writes, restricting the entry contact `type`, using the owner's locale for contact mails, answering 405 for `update`, and ignoring a client-supplied `id` on create.

### Modified Capabilities

None. Like `api-kysely-foundation`, the change opts out of delta specs (`skip_specs: true`).

## Impact

- **Code:** `packages/api`.
  - New repositories and domains for farms, depots, initiatives, entries and entry search, with shared helpers for syncing join tables.
  - `.ts` controllers replace `src/services/{farms,depots,initiatives,entries}.js` and `src/services/admin/{farms,depots,initiatives,entries}.js`.
  - Reworked: `src/services/{autocomplete,searchIndex,entryContactMessage}.js`, `src/hooks/relations.js`, the entry parts of `src/hooks/admin.js`, `src/hooks/geoJson.js`, `src/hooks/authorization.js`, `src/permissions.js` and `sendNewEntryNotification` in `src/hooks/email.js`.
  - Test fixtures in `src/services/__test__/data/{farms,depots,initiatives}.js` stop using the models.
- **Models:** `Farm`, `Depot`, `Initiative` and `EntriesSearch` stay while the `User` model's relation mappings reference them. They are deleted in `api-kysely-remove-objection`.
- **Clients:** no change intended for `packages/embed`, the legacy `packages/map`, `packages/admin` or the API partner that uses `$details`.
- **Runtime/ops:** no schema change, no data migration. Rollback is a git revert.
