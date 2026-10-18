# Proposal

## Why

`packages/api` reaches the database through Objection.js, which is deprecated and unmaintained, wired to Feathers through `feathers-objection`'s generated CRUD services. Business rules live in a web of Feathers hooks, nothing is typed, and relation writes run outside the transaction of the entity they belong to. This change lays the foundation for a typed, layered API (repositories → domain services → thin Feathers controllers) on Kysely and TypeScript, and proves it on the lowest-risk resources first, so the remaining resources can follow incrementally without a big-bang rewrite.

## What Changes

- Introduce TypeScript to `packages/api` without a build step: Node 24 native type stripping, `allowJs`, `erasableSyntaxOnly`, `tsc --noEmit` as a lint/CI check. New code is `.ts`; existing `.js` files stay until touched.
- Add Kysely as the query layer, with database types generated from the migrated schema (`kysely-codegen`). knex stays as the migration runner only; existing migrations, the `knex_migrations` table and the Dokku predeploy hook are unchanged.
- Add shared infrastructure: a Kysely instance, a Postgres error mapper replacing `objection-db-errors`, and a small allowlisted translator from the Feathers query syntax that `ra-data-feathers` sends (`$limit`, `$skip`, `$sort`, equality, `$in`, `$ne`, plus `$ilike` where admin uses it) to Kysely.
- Migrate the lookup resources to the repository → domain → controller pattern: `products`, `goals`, `badges` (public, read-only) and `admin/products`, `admin/goals`, `admin/badges`, `admin/roles`, `admin/origins`.
- Paths, response shapes (including the `type` and `link` fields and the paginated `{ total, limit, skip, data }` envelope) and error codes of the migrated services stay the same.
- Migrated admin lookup services stop accepting the client-supplied `$eager` and `$select` query parameters and answer them with `BadRequest`; `ra-data-feathers` never sends either.

Out of scope, each a later change: entries (farms, depots, initiatives, entries, search index), jobs and remaining admin services, users and authentication, removing Objection and `feathers-objection`, and replacing the admin's `ra-data-feathers` data provider.

## Capabilities

### New Capabilities

None. This is a refactor with no intended change to spec-level behavior.

### Modified Capabilities

None. The change opts out of delta specs (`skip_specs: true`).

## Impact

- **Code:** `packages/api` — new `src/db/` (Kysely instance, generated types, error mapping, query translator) plus repositories and domains for the lookup resources; the corresponding Feathers service files are rewritten as thin controllers. The Objection models for these resources stay as long as other models' relation mappings reference them.
- **Dependencies:** adds `kysely`, `kysely-codegen` (dev) and `typescript` (dev). Objection, `feathers-objection` and `objection-db-errors` stay until the final step.
- **Runtime/ops:** two connection pools (knex and Kysely) run side by side during the transition. The Dokku start command and the predeploy migration hook must keep working with mixed `.js`/`.ts` sources.
- **Clients:** no change intended for `packages/embed` or `packages/admin`.
