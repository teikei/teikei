# Tasks

All commands run in `packages/api` unless noted. Start only after `api-kysely-users-auth` is merged into `preview`. The characterisation tests from group 1 must pass against the current services first. Later groups change them only for the broadcast removal, the reminder transaction and the `405` on `update` and campaign `create`, each in the task that causes it.

## 1. Characterisation tests

- [x] 1.1 Add `src/services/__test__/emailCampaigns.test.ts`, over HTTP through the real `authorize` hook as a superadmin, asserting full bodies:
  - `admin/email-campaigns` and `admin/email-messages`: paged `find` with the filters `packages/admin` sends (`id`, `campaignId`, `status`, `$ilike`, sort, paging, `id[$in]`), `get`, `create`, `patch` and `remove`
  - the `405` for external writes with the campaigns feature off
  - patching a `bio_certification_update` campaign from `CREATED` to `SENT`, which today queues nothing (`it` asserting the current result, with a comment pointing at task 2.2)

  Verify that the tests pass on the current code.

- [x] 1.2 Add tests for `admin/stats` (four rows, string counts, per-state user counts) and `admin/audit` (one badge added to and one removed from a farm and an initiative within the last 7 days, as text lines). Add job tests that invoke `createLoginReminders`, `createSecondLoginReminders` and `flagInactiveUsers` against users in each state, asserting the campaign, the user states, timestamps and tokens, and the queued messages. Add a `sendEmailCampaignMessages` test with the `emails` service's `create` spied. Verify that the tests pass on the current code.

## 2. Email campaigns and messages

- [x] 2.1 Add the email-messages repository, domain and `.ts` controller (design.md), and `toEmailMessage` in `serializers.ts`. Replace `services/admin/emailMessages.js`. Verify that the message cases of 1.1 pass, changed only for `update` answering `405`.
- [x] 2.2 Add the email-campaigns repository, domain and `.ts` controller without `create` and without the broadcast hook, and `toEmailCampaign` (design.md). Replace `services/admin/emailCampaigns.js` and drop the `admin/email-campaigns:create` permission. Change the 1.1 tests only for `create` and `update` answering `405`, patching a missing campaign answering `404` instead of the `500` the hook causes, and sending a `CREATED` `bio_certification_update` campaign queuing nothing. Verify that 1.1 passes with these changes.
- [x] 2.3 In `packages/admin`, remove `EmailCampaignsCreate`, the campaigns `create` view and `hasCreate`, show the template read-only in `EmailCampaignForm`, and delete `SendCampaignButton` (design.md). Verify that the root `npm run lint` and `npm run build` in `packages/admin` pass.

## 3. Jobs

- [x] 3.1 Add `markReminderSent`, `markSecondReminderSent` and `flagNoResponse` to the users repository, `queueForUsers` to the email-messages repository, and `startLoginReminders`/`startSecondLoginReminders` to the campaign domain. Switch the three jobs to them. Add a test that a failing message insert leaves no campaign and no changed user. Verify that the 1.2 job tests pass, changed only by that.
- [x] 3.2 Add `getCampaignRecipient` to the users domain and switch `sendEmailCampaignMessages` to it. Verify that the 1.2 send test passes, and that the spied locals contain `reactivationToken` but no `password` or `verify*`/`reset*` field.

## 4. Stats and audit

- [x] 4.1 Add the stats and audit repositories, domains and `.ts` controllers, and replace `services/admin/{stats,audit}.js`. Verify that the 1.2 stats and audit tests pass unchanged, and so does the audit email job test.

## 5. Removing Objection

- [x] 5.1 Move the Joi schemas in use to `src/domain/validation/` and delete the unused ones (design.md). Update the domain imports. Verify that `npm run typecheck` and `npm test` pass.
- [x] 5.2 Reduce `src/db.js` to the Kysely instance, raise `DEFAULT_POOL_MAX` to 10 and update its comment in `src/db/kysely.ts`. Port `src/__test__/foreignKeys.test.js` to Kysely. Delete `src/models/`, and remove `objection`, `feathers-objection` and `objection-db-errors` with `npm uninstall` in `packages/api`, so the root lockfile is updated. Verify that:
  - `grep -rn "objection\|models/\|BaseModel" src --include='*.js' --include='*.ts'` finds only comments
  - `npm ls objection` is empty
  - the API starts with `npm run dev` (repo root) and serves `/farms`
- [x] 5.3 Update `AGENTS.md` where it mentions Objection or `src/models/` (for example, the known exceptions list). Verify with `grep -rn -i "objection" AGENTS.md` (no hits).

## 6. Integration check

- [x] 6.1 Run `npm run typecheck`, `npm test` and the root `npm run lint`. Verify that all pass and that `git diff --exit-code src/services/__test__/__snapshots__` is clean.
- [ ] 6.2 Tell the content team that campaigns can no longer be created or sent from the admin (design.md, Migration Plan; production has no `CREATED` `bio_certification_update` campaign, checked on 2026-10-22). Deploy the API and the admin to preview and run the smoke checks from design.md. Verify that each works as before.

## Workflow follow-up

- Archive this change after review and the preview checks. It completes the Kysely roadmap from `api-kysely-foundation`.
