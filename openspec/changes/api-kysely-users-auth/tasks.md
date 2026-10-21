# Tasks

All commands run in `packages/api` unless noted. The characterisation tests from group 1 must pass against the current Objection services first. Later groups change them only for the "Behaviour differences" in design.md, each in the task that causes it.

## 1. Characterisation tests

- [x] 1.1 Move `src/services/__test__/data/users.js` off the `users` service and the `User` model: `createTestUser` inserts with Kysely (bcrypt-hashed password, role `user`, optional `isVerified`, roles and admin origins), and returns the row. Update `users.test.js` and `authManagement.test.js`, which read through `User.query()`, to read with Kysely. Verify that the whole suite passes unchanged otherwise.
- [x] 1.2 Add `src/services/__test__/accounts.test.ts`, over HTTP through the real `authorize` hook, asserting full bodies:
  - sign-up (response, stored origin and verification fields, role `user`)
  - sign-in, with the decoded token's `roles` and the restricted user in the response
  - `get` of one's own account, and `403 FORBIDDEN` for another's
  - an external `patch` with password, and the ignored server-managed fields
  - each of `verifySignupLong`, `sendResetPwd`, `resetPwdLong` and `passwordChange`, with success and each error code the spec names
  - `405` for external `find`, `update` and `remove`

  Verify that the tests pass on the current code.

- [x] 1.3 Add `src/services/__test__/adminUsers.test.ts`:
  - paged `find` with the query strings `packages/admin` sends (`q`, `name`, `email`, `id`, `phone`, `isVerified`, `adminEmailNotifications`, `origin`, `state`, `roles.id`, `$sort`, paging, `id[$in]`), as superadmin and as an admin with origins inserted in the test
  - `get` with and without `$details=true`
  - `create`, and `patch` with `roles` and `adminOrigins`, including the current `200` for an unknown role id
  - `remove`, and `admin/users/:userId/entries`

  Also cover `admin/bounces`, `admin/user-account-state-change`, `user-reactivation` (active, reset, wrong token), the audit job's `$in` find, and `importEmailBounces` with the Postmark request mocked. Verify that the tests pass on the current code, and record in the test whether `admin/bounces` returns `[]` for an admin with a bounced user in their origin.

## 2. Users repository

- [x] 2.1 Extend `src/repositories/users.ts` with the column lists, reads, writes, `AdminUserFilters`, `withUserSearch` and the row/value types from design.md. Add `usersRoles` and `adminsOrigins` to `JoinTable` in `relations.ts`, and `findByOrigin` to `repositories/origins.ts`. Update the header inventory with the 1.3 query strings. Verify with repository tests in `repositories/__test__/users.test.ts`:
  - no read except the three account reads returns `password`, `reactivationToken` or a `verify*`/`reset*` token column
  - `saveRelations` replaces and keeps roles and admin origins, and an unknown id raises the foreign-key error
  - `setEntriesActive` changes only the given user's farms, initiatives and their farms' depots
  - `findAdminPage` applies `withRole` and `visibleTo`

## 3. Users domain and serialiser

- [x] 3.1 Add `src/domain/users.ts` with the operations from design.md. `signUp`, `createAdmin`, `patchAdmin` and `setActive` each run in one `transaction`. Add `toUser` to `src/services/serializers.ts`, serialising `roles` and `adminOrigins` with `toRole`/`toOrigin`. Verify that `npm run typecheck` and the root `npm run lint` pass, so the domain-import rule holds.

## 4. `users` controller

- [x] 4.1 Replace `src/services/users.js` with `src/services/users.ts`:
  - the four `find` shapes, and `BadRequest` otherwise
  - `get`, `create`, `patch` and `remove` over the domain, serialised with `toUser`
  - the existing hooks minus `withEager` and `assignUserRole`
  - `reactivationToken` added to `protectUserFields`
  - `mapDatabaseErrors`

  Remove `assignUserRole` and the model imports from `hooks/user.js`. Add a unit test that an unknown `find` query is rejected. Verify that `accounts.test.ts` passes, changed only for `reactivationToken`, and that `users.test.js`, `authentication.test.js` and `__test__/serviceErrorCodes.test.js` pass.

## 5. `admin/users` controller

- [x] 5.1 Replace `src/services/admin/users.js` with `src/services/admin/users.ts` after `services/admin/farms.ts`: parse `$details` and `roles.id`, pass `params.user`, serialise with `toUser`/`toPage`, and register `mapDatabaseErrors`. Delete `hooks/admin.js` and `hooks/relations.js`. Verify that `adminUsers.test.ts` passes, changed only for the `409` on an unknown role id and `reactivationToken` in write responses. Also verify with `grep -rn "hooks/admin\|hooks/relations" src` (no hits).

## 6. Other user-related callers

- [x] 6.1 Reduce `hooks/userAccountActions.js` to `activateAccount` and `recordLogin` over the domain, wrapped in `withFeathersErrors`. Switch the `authentication` after-hook and `admin/user-account-state-change` to them, and `user-reactivation` to `reactivate`. Register `mapDatabaseErrors` on both custom services. Add a test that a failing entry update leaves `users.active` unchanged. Verify that the 1.2 sign-in and 1.3 state-change and reactivation tests pass.
- [x] 6.2 Port `admin/bounces` to `listBounces`, fixing the origin binding if 1.3 recorded `[]`, and update its test to the bounced user's record. Port `jobs/importEmailBounces.js` to `recordBounce`, and `getOriginConfiguration` in `hooks/email.js` to `findByOrigin`. Verify with the 1.3 tests and `emails.test.js`, and with `grep -rn "models/" src/hooks src/jobs/importEmailBounces.js src/services/admin/bounces.js` (no hits).

## 7. `authManagement` allowlist

- [x] 7.1 Add the action allowlist hook to `src/services/authManagement.js`, shrink `GUEST_EMAIL_ACTIONS` to `sendResetPwd`, and drop `verifySignupSetPasswordLong` from `AMBIGUOUS_TOKEN_CODES`. Replace the `resendVerifySignup` test in `authManagement.test.js` with the spec's rejection scenarios (`checkUnique` with a known and an unknown email, `resendVerifySignup` without email sent, `options`, a missing action), and update `__test__/authManagementErrorCodes.test.js`. Verify that these tests and `accounts.test.ts` pass.

## 8. Integration check

- [x] 8.1 Add a test that collects every external response from the `accounts.test.ts` and `adminUsers.test.ts` flows, plus `admin/bounces` and `user-reactivation`, and asserts that none contains `password`, `reactivationToken` or a `verify*`/`reset*` token field at any depth. Verify that it passes.
- [x] 8.2 Run `npm run typecheck`, `npm test` and the root `npm run lint`. Verify that all pass, and that `grep -rn "models/users\|models/roles\|models/origins" src` only finds the models themselves and `src/models/`.
- [ ] 8.3 Deploy to `teikei-api-preview` and run the smoke checks from design.md (Migration Plan). Verify that each works as before, apart from the behaviour differences.

## Workflow follow-up

- Archive this change after review and the preview checks.
- `api-kysely-remove-objection` can then delete the `User`, `Role` and `Origin` models.
