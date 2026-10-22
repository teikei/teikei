# Proposal

## Why

Once entries and users run on Kysely, the only Objection consumers left are the email campaign and message services, a few admin read services, and jobs that use `BaseModel.knex()` as a raw-SQL handle. Moving these over makes it possible to delete Objection, `feathers-objection` and `objection-db-errors`, along with the second connection pool they need. This is the last change of the roadmap in `api-kysely-foundation`, combining its steps 3 (jobs/admin) and 5 (removal). Afterwards no Objection code remains in `packages/api`.

The broadcast campaigns are removed instead of ported. `bio_certification_update` was a one-time broadcast that is no longer in use: its email template no longer exists, every such campaign on production is `SENT` (checked on 2026-10-22), and the queueing SQL has had an unterminated string literal since at least September 2023, so no broadcast can have been queued since. Porting and fixing it would add a mass mailing path nobody uses.

## What Changes

- Everything migrated here follows the three API layers from `AGENTS.md` (`api-layer-boundaries`): Kysely queries in repositories, domains free of `kysely`, `pg` and Feathers imports, and controllers that parse Feathers params, shape responses and register `mapDatabaseErrors`.
- Migrate `admin/email-campaigns` and `admin/email-messages` to `src/repositories/`, `src/domain/` and `.ts` controllers following the lookup pattern: paged `find`, `get` and writes.
  - Neither resource has a Joi schema today (the models point at `schemas.emailCampaignAdmin` and `schemas.emailMessageAdmin`, which don't exist, so nothing is validated), and this change adds none.
  - The campaigns feature toggle (`disallowIfCampaignsDisabled`) stays a controller hook, because it reads app configuration.
  - Like the other Kysely controllers, they implement only the methods in use. `update` (PUT), which the admin never sends because it uses `patch`, answers `405`. So does `create` on campaigns, whose only caller was the admin's create form (see below).
- Remove the broadcast campaigns:
  - in the API, the broadcast templates list and the before-`patch` hook that queues a message for every verified user when a `CREATED` broadcast campaign is set to `SENT`. Patching a campaign becomes a plain update.
  - in `packages/admin`, the campaign create view, the template choice (which defaults to `bio_certification_update`) and the "Send Campaign" button. The campaigns list and edit view, the link to a campaign's messages and the "Send Test Email" button stay.
  - The login reminder campaigns are not affected: the reminder jobs, the message queue, the send job, the reminder templates and the Postmark `broadcast` message stream and layout they use all stay.
- Move `admin/stats` and `admin/audit` to Kysely `sql` queries in repositories, behind thin domains like the lookups, with unchanged response shapes.
- Move the raw SQL in `createLoginReminders`, `createSecondLoginReminders` and `flagInactiveUsers` to Kysely repository methods. The jobs call them through domains, which use `transaction(db, fn)`. The reminder campaign is now created in the same transaction as the state updates and queued messages, so a failure no longer leaves an empty `SENT` campaign behind.
- `sendEmailCampaignMessages` reads its recipient through the users domain with the owner columns plus `reactivationToken` (which the reminder templates link to), instead of the full record with password and tokens.
- Remove `objection`, `feathers-objection` and `objection-db-errors` from the dependencies.
- Delete `src/models/`, including `BaseModel` and `JoiValidator`. The Joi schemas in `src/models/validation/` move to `src/domain/validation/`, next to the domains that validate with them (farms, depots, initiatives and users). Schemas that no domain uses after the migration are deleted.
- Remove the runtime knex instance from `src/db.js` (`Model.knex`, `knexSnakeCaseMappers`). This leaves one Kysely pool, so its default size can go up.
- knex stays as the migration runner (`db/knexfile.js`, the Dokku predeploy `migrate:latest`) and in the integration test setup. `src/__test__/foreignKeys.test.js` moves to Kysely.

Out of scope:

- Replacing knex as the migration runner.
- Replacing the admin's `ra-data-feathers` data provider.
- Converting `.js` files that no longer touch the database.

## Capabilities

### New Capabilities

None. This is a refactor plus the removal of the unused broadcast campaigns.

### Modified Capabilities

None. The change opts out of delta specs (`skip_specs: true`).

## Impact

- **Code:** `packages/api` and `packages/admin`.
  - `src/services/admin/{emailCampaigns,emailMessages,stats,audit}.js` become `.ts` controllers over new repositories and domains, without the broadcast hook.
  - `packages/admin`: `resources/emailCampaigns.jsx`, `components/EmailCampaignForm.jsx`, `App.jsx`; `components/SendCampaignButton.jsx` is deleted.
  - `src/jobs/{createLoginReminders,createSecondLoginReminders,flagInactiveUsers,sendEmailCampaignMessages}.js`.
  - `src/db.js` and `src/db/kysely.ts` (pool default).
  - `src/models/` is deleted; its Joi schemas move to `src/domain/validation/`.
  - `src/__test__/foreignKeys.test.js`.
- **Dependencies:** `objection`, `feathers-objection` and `objection-db-errors` are removed. `knex` stays for migrations.
- **Runtime/ops:** one connection pool per API process instead of two. No schema change; the existing `bio_certification_update` campaigns and their messages stay as records. Rollback is a git revert.
- **Admin users:** campaigns can no longer be created or sent from the admin. Only the one-time broadcast used this.
- **Ordering:** requires `api-kysely-entries`, `api-layer-boundaries` (both archived) and `api-kysely-users-auth` to be merged.
