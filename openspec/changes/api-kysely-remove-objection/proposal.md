# Proposal

## Why

Once entries and users run on Kysely, the only Objection consumers left are the email campaign and message services, a few admin read services, and jobs that use `BaseModel.knex()` as a raw-SQL handle. Moving these over makes it possible to delete Objection, `feathers-objection` and `objection-db-errors`, along with the second connection pool they need. This is the last change of the roadmap in `api-kysely-foundation`, combining its steps 3 (jobs/admin) and 5 (removal). Afterwards no Objection code remains in `packages/api`.

## What Changes

- Migrate `admin/email-campaigns` and `admin/email-messages` to repositories, domains and `.ts` controllers following the lookup pattern: paged `find`, `get`, writes, and the campaigns feature toggle.
- Fix the campaign broadcast queue while porting it. Its SQL has an unterminated string literal (`'SECOND_REMINDER_SENT)`), so setting a `bio_certification_update` campaign to `SENT` can never queue messages. The campaign id is also interpolated into the SQL; it becomes a parameter.
- Move `admin/stats` and `admin/audit` to Kysely `sql` queries with unchanged response shapes.
- Move the raw SQL in `createLoginReminders`, `createSecondLoginReminders` and `flagInactiveUsers` to Kysely, keeping the transactions where they exist today.
- Remove `objection`, `feathers-objection` and `objection-db-errors` from the dependencies.
- Delete `src/models/`, including `BaseModel` and `JoiValidator`. The Joi schemas in `src/models/validation/` move to a home next to the domains that use them.
- Remove the runtime knex instance from `src/db.js` (`Model.knex`, `knexSnakeCaseMappers`). This leaves one Kysely pool, so its default size can go up.
- knex stays as the migration runner (`db/knexfile.js`, the Dokku predeploy `migrate:latest`) and in the integration test setup. `src/__test__/foreignKeys.test.js` moves to Kysely.

Out of scope:

- Replacing knex as the migration runner.
- Replacing the admin's `ra-data-feathers` data provider.
- Converting `.js` files that no longer touch the database.

## Capabilities

### New Capabilities

None. This is a refactor plus a bug fix that restores the intended broadcast behaviour.

### Modified Capabilities

None. The change opts out of delta specs (`skip_specs: true`).

## Impact

- **Code:** `packages/api`.
  - `src/services/admin/{emailCampaigns,emailMessages,stats,audit}.js`.
  - `src/jobs/{createLoginReminders,createSecondLoginReminders,flagInactiveUsers}.js`.
  - `src/db.js` and `src/db/kysely.ts` (pool default).
  - `src/models/` is deleted.
  - `src/__test__/foreignKeys.test.js`.
- **Dependencies:** `objection`, `feathers-objection` and `objection-db-errors` are removed. `knex` stays for migrations.
- **Runtime/ops:** one connection pool per API process instead of two. No schema change. Rollback is a git revert.
- **Ordering:** requires `api-kysely-entries` and `api-kysely-users-auth` to be merged. The broadcast-queue fix can be split out as an earlier hotfix if it is needed sooner.
