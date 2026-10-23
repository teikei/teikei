# Design

## Context

See proposal.md for motivation and scope. This change starts after `api-kysely-users-auth` has landed. What still uses Objection or the knex runtime instance at that point:

- **`admin/email-campaigns`** (feathers-objection, `$ilike` whitelisted, paginated 50):
  - The before-`create` hook sets `ctx.params.status`, not `ctx.data.status`, so it has no effect. A new campaign gets `CREATED` from the column default instead.
  - The before-`patch` hook queues messages when a `CREATED` `bio_certification_update` campaign is patched to `SENT`. Its SQL is broken (proposal), and it runs outside the patch's own query.
  - `bio_certification_update` has no email template in `src/templates/emails/` any more, and all such campaigns on production are `SENT` (checked on 2026-10-22).
  - The admin's campaign create view and its "Send Campaign" button exist only for this broadcast: the create form defaults to `bio_certification_update`, and sending any other campaign queues nothing. The reminder campaigns are created by the jobs.
  - `disallowIfCampaignsDisabled` guards external writes. `setCreatedAt`/`setUpdatedAt` stamp the rows.
- **`admin/email-messages`** (feathers-objection, the same options and guard). `email_messages` has no timestamp columns.
- **Validation:** neither model has a Joi schema (`schemas.emailCampaignAdmin` and `schemas.emailMessageAdmin` are undefined), so nothing is validated today.
- **Writes:** the admin uses `ra-data-feathers` with `usePatch`, so it never sends `update`. It sends `create` on messages from "Send Test Email", which queues one message of a campaign for a chosen user.
- **Internal callers:**
  - `createLoginReminders` and `createSecondLoginReminders` create a `SENT` campaign through the service. Then, in a separate knex transaction, they update user states and insert the queued messages in one `with … update … returning` / `insert … select` statement.
  - `sendEmailCampaignMessages` finds `QUEUED` messages (first page of 50) and gets each campaign through the services. It gets the user from `users`, which hands the full record, password included, to the template locals. The reminder templates use `user.id` and `user.reactivationToken`.
  - `flagInactiveUsers` runs one raw update.
- **`admin/stats`:** four raw counts. pg returns `count` as a string, and the admin dashboard reads `stats.count` and the per-state rows as they are.
- **`admin/audit`:** a raw `hstore` query over `audit` (`svals`, `slice`), formatted to German text lines with `moment`. It has no permission scope, so only the audit email job calls it.
- **Runtime knex:** `src/db.js` builds the knex instance with `knexSnakeCaseMappers` only for `Model.knex(db)`. knex itself stays for `db/knexfile.js`, the Dokku predeploy `migrate:latest`, and `db/integrationTestSetup.js` (`knex-db-manager`).
- **Joi schemas:** `src/models/validation/` is imported by `domain/{farms,depots,initiatives,users}.ts` and the models. After this change `farm`, `depot`, `initiative` (and their admin variants), `entry.js`, `user` and `userAdmin` remain in use. `role`, `origin`, `userSignUp`, `recoverPassword`, `resetPassword`, `changeUserAccount`, `changePassword` and `initialValues` are unused. `packages/map` has its own copy.
- **Tests:** `src/__test__/foreignKeys.test.js` reads `information_schema` through `Model.knex()`.

## Goals / Non-Goals

**Goals:**

- No `objection`, `feathers-objection`, `objection-db-errors` or `src/models/` left in `packages/api`, and one database pool per process.
- The campaign, message, stats and audit responses are unchanged, apart from the removed broadcast and the `create` and `update` methods that go with it (see Decisions).
- The login reminder campaigns keep working as they do.

**Non-Goals:**

- Adding validation to campaigns or messages.
- Removing or migrating the existing `bio_certification_update` campaign rows.
- Sending more than 50 queued messages per job run, or any other change to the send loop.
- Rewriting the audit text, or replacing `moment`.

## Decisions

### Campaigns and messages follow the lookup pattern

- **Repositories** `src/repositories/{emailCampaigns,emailMessages}.ts`:
  - `findPage(query)` over a queryable column list, with `$ilike` as today (`db/feathersQuery.ts`), and `findById`, `insert`, `update`, `delete`
  - the `EmailCampaignValues`/`EmailCampaignChanges` and `EmailMessage…` types
- **Domains** `src/domain/{emailCampaigns,emailMessages}.ts`:
  - `list`, `get` (`notFound`), `patch`, `remove` and, for messages, `create`, with `withoutServerFields`-style stripping of `id`/`type`/`link`
  - the campaign domain's `patch` is a plain update, like the lookups
- **Controllers** `src/services/admin/{emailCampaigns,emailMessages}.ts`:
  - messages: `find`, `get`, `create`, `patch` and `remove`; campaigns: `find`, `get`, `patch` and `remove`. `update` now answers `405`, and so does `create` on campaigns.
  - serialised with `toEmailCampaign`/`toEmailMessage` (`type` `EmailCampaign`/`EmailMessage`, `link` `/email-campaigns/<id>` and `/email-messages/<id>`) and `toPage`
  - `disallowIfCampaignsDisabled` and `setUpdatedAt` stay registered as today, with `mapDatabaseErrors` as the error hook. `setCreatedAt` and the `admin/email-campaigns:create` permission go with `create`.
- **Rejected alternative:** write Joi schemas for both resources while porting. That would be new behaviour that could reject what the admin sends today, with no reported problem behind it.

### Broadcast campaigns are removed, not fixed

- **API:** the broadcast templates list and the queueing hook are not ported. Patching a campaign to `SENT` only sets its status.
- **Admin:**
  - `EmailCampaignsCreate`, the `create` view in `App.jsx` and `hasCreate` on the list go.
  - The edit form shows the template read-only instead of the select, and loses `SendCampaignButton`, which is deleted.
  - The edit form keeps the name, the "Send Test Email" card and the link to the campaign's messages, so a reminder campaign can still be previewed for a chosen user.
- **What stays:** the reminder jobs, the message queue, `sendEmailCampaignMessages`, the reminder templates, and the Postmark `broadcast` message stream and `layouts/broadcast.njk`, which the reminder emails use.
- **Why:** the broadcast is unused (Context), and the fix would turn a path that has silently done nothing since 2023 into a mailing to every verified user, with no template to send.
- **Rejected alternatives:**
  - Port and fix it, as first planned. That keeps and tests a mass mailing path nobody uses.
  - Remove only `bio_certification_update` from the template list. That leaves a rule, a transaction and a repository method that can never run.
- **If a broadcast is needed again,** it is a repository method and a rule in the campaign domain. Git history has the old one.

### Reminder jobs: one transaction per run, through the domains

- The users repository gains `markReminderSent(sentAt, tx)`, `markSecondReminderSent(sentAt, tx)` and `flagNoResponse()`. These are today's statements in Kysely, returning the affected user ids where messages follow.
- The email-messages repository gains `queueForUsers(campaignId, userIds, tx)`.
- The campaign domain exposes `startLoginReminders()` and `startSecondLoginReminders()`. Each creates the `SENT` campaign, updates the users and queues their messages in one `transaction`, and returns the campaign id and the message count for the job's log.
- **The timestamp** that `reminder_sent_at` and `second_reminder_sent_at` get is `new Date()`, taken in the domain as today.
- **Why one transaction:** today a failing update leaves an empty `SENT` campaign behind, which the admin cannot tell from a run with no recipients. Folding the create in costs nothing.
- **The campaign** is inserted through the campaigns repository in the domain, not through the service, so the jobs no longer depend on the service's `create`.
- **Rejected alternative:** keep the single SQL statement with a CTE. The update and the insert are clearer as two repository calls in one transaction, and the CTE's only advantage, atomicity, now comes from the transaction.

### Campaign sending reads a recipient, not an account

- The users domain gains `getCampaignRecipient(id)`, which returns the `OWNER_COLUMNS` plus `reactivationToken`.
- `sendEmailCampaignMessages` switches its `users.get` to that call. Its `admin/email-messages`/`admin/email-campaigns` service calls stay, because they are internal and the job is otherwise unchanged.

### Stats and audit behind thin domains

- `src/repositories/stats.ts` returns the four counts as `sql` queries, with `count` left as the string pg returns.
- `src/repositories/audit.ts` runs the audit query unchanged as a `sql` template.
- **Domains:**
  - `domain/stats.ts` builds today's four `{ id, resource, stats }` rows
  - `domain/audit.ts` keeps `mapToText`; `moment` is not a banned import
- **Controllers:** `.ts` controllers with `find` only, registering `mapDatabaseErrors`.

This keeps "controllers depend on domains only", as `api-layer-boundaries` decided for the lookups.

### Joi schemas move to `src/domain/validation/`

- `farm.js`, `depot.js`, `initiative.js`, `entry.js` and `user.js` move, with `index.js` reduced to the schemas the domains use.
- The others are deleted.
- They stay `.js` files: converting them is out of scope (proposal), and the domains import them as they do today.

### One Kysely pool

- `src/db.js` keeps only `app.set('kysely', createKysely(app.get('postgres')))`.
- `DEFAULT_POOL_MAX` goes from 5 to 10: the pg default, and less than the 15 per process (knex 10 + Kysely 5) that the foundation's pool-sizing note accepted. `kyselyPoolMax` stays configurable, and the comment about the knex pool goes.
- `foreignKeys.test.js` queries `information_schema` through `app.get('kysely')` with `sql`.
- Comments that cite feathers-objection as the reference for current behaviour (`db/errors.ts`, `db/feathersQuery.ts`, the characterisation tests) stay. They describe why the behaviour is what it is.

## Risks / Trade-offs

- **[Campaigns can no longer be created or sent from the admin]** → Only the one-time broadcast used this. Reminder campaigns come from the jobs, and "Send Test Email" still previews them.
- **[`update` now answers `405` on campaigns and messages, and `create` on campaigns]** → The admin sends `patch` (`usePatch`) and no longer creates campaigns. The jobs create campaigns through the domain and messages through the service's `create`/`patch`.
- **[A Joi schema file is referenced from somewhere this inventory missed]** → `grep -rn "models/" src` after the move must come back empty. The typecheck and the suite cover the domain imports.
- **[A bigger pool exceeds the Postgres limit during deploy overlap]** → 2 × 10 per app on servers with 97 usable connections, below the 30 the foundation already accepted.

## Migration Plan

- Normal API release; no schema change, no data migration.
- No `bio_certification_update` campaign on production is `CREATED` (checked on 2026-10-22), so the removal leaves none half-done. Tell the content team that campaigns can no longer be created or sent from the admin.
- Smoke checks on `teikei-api-preview`:
  - the admin dashboard (stats)
  - the campaigns and messages lists and edit forms, with the feature toggle on and off, and no create button or "Send Campaign" button on campaigns
  - "Send Test Email" from a reminder campaign
  - the reminder jobs triggered via `admin/jobs`, with the queued messages being sent
  - the audit email job
- Rollback is a git revert and redeploy.
