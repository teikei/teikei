# Proposal

## Why

`api-kysely-entries` left `src/domain/` doing work that belongs to other layers. The entry domains name join tables and foreign-key columns (`replaceRelation(trx, 'farmsProducts', 'farmId', …)`), choose column lists, group relation rows by entry id, type their inputs with `Insertable<Farms>` and `Transaction<DB>`, parse Feathers query parameters (`$details`, `hasBadge`), map database errors to Feathers errors, and build the response shapes (`type`, `link`, admin id arrays, `<Type>_<id>` keys). Very little of it is a business rule. The roadmap's next change, `api-kysely-users-auth`, adds a users domain with role and origin sync, and it would copy this pattern. Fixing the boundaries now, while the characterisation snapshots from `api-kysely-entries` pin every response, is cheaper than fixing three modules later.

## What Changes

- **Repositories own persistence mechanics:**
  - Relation writes become intent-level methods per entry type. Join-table and column names stay inside `src/repositories/`.
  - Reads return assembled records with their nested relations, through named read shapes: summary, detail, owned, admin ids, admin details. Grouping relation rows by entry (`byEntry`) and the column lists move into the repositories.
  - Value and row types (`FarmValues`, `FarmRow`, …) are exported from the repositories, so other layers don't need `src/db/types.ts`.
  - A `transaction(db, fn)` helper replaces direct use of `db.transaction()` and `Transaction<DB>` outside the repositories.
- **Controllers own transport and presentation:**
  - Feathers `params`, `Id` and query parameters are parsed in the controllers, so domains take plain typed arguments.
  - Database errors are mapped to Feathers errors by one error hook per migrated service, replacing `withFeathersErrors` in the domains.
  - `type`/`link` serialisation, the admin `<Type>_<id>` keys and the merged `entries` list are built by serialisers in `src/services/`.
- **Domains stay minimal.** They keep validation, the transaction boundary, orchestration across repositories, and rules such as admin origin scoping (`adminFilters`), dropping server-assigned fields from input, and not-found handling. `src/domain/entryRecords.ts` is split up and removed.
- **Lint enforces the boundary.** ESLint `no-restricted-imports` on `packages/api/src/domain/**` bans `kysely`, `pg`, `@feathersjs/feathers`, `@feathersjs/adapter-commons`, `src/db/types.ts`, `src/db/feathersQuery.ts`, and the column constants that repositories export.
- **Documentation:** the layering rules get a `packages/api` section in `AGENTS.md`. It replaces two conventions in the archived `api-kysely-foundation` design: domains adding `type`/`link`, and domains composing repositories through `Transaction<DB>`.
- **Scope:** entries (`farms`, `depots`, `initiatives`, `entries`, their admin variants, and the domain callers in `hooks/authorization.js`, `permissions.js` and `services/entryContactMessage.js`) and lookups (`products`, `goals`, `badges`, `origins`, `roles`, public and admin).
- **No behaviour change.** Every characterisation snapshot and integration test passes unchanged.

Out of scope:

- `services/searchIndex.js`, `services/autocomplete.js` and `hooks/email.js`, which call repositories directly without a domain. The convention for them is recorded, but they are not reworked here.
- Joi schemas, which stay in `src/models/validation/` until `api-kysely-remove-objection`.
- Revising the `api-kysely-users-auth` and `api-kysely-remove-objection` proposals. That follows this change with `/opsx:update`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a pure refactor, and the change opts out of delta specs (`skip_specs: true`).

## Impact

- **Code:** `packages/api/src`:
  - `domain/*`
  - `repositories/*`, plus a new `repositories/transaction.ts`
  - `services/{farms,depots,initiatives,entries,products,goals,badges}.ts` and `services/admin/*.ts`
  - a new `services/serializers.ts`
  - `db/errors.ts`
  - `hooks/authorization.js`, `permissions.js`, `services/entryContactMessage.js`
- **Tests:** repository tests in `repositories/__test__/` follow the moved helpers. The HTTP characterisation snapshots in `services/__test__/__snapshots__/` must not change.
- **Tooling:** `eslint.config.js` gains the domain import restrictions.
- **Docs:** `AGENTS.md`.
- **Clients and runtime:** no change. No schema change, no data migration. Rollback is a git revert.
