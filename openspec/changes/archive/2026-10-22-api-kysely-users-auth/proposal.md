# Proposal

## Why

The `users` service is the authentication stack's last dependency on `feathers-objection`: `LocalStrategy`, `JWTStrategy` and `feathers-authentication-management` (FAM) all call it. Only Objection's `User.$formatJson` keeps the password and token fields out of serialised output. FAM also exposes more actions than any client uses, among them `checkUnique`, which lets guests ask whether an email is taken. This is step 4 of the roadmap in `api-kysely-foundation`. It moves users onto Kysely, and it narrows both the `users` service and FAM to what the clients actually use.

## What Changes

- Build users on the three API layers from `AGENTS.md` (`api-layer-boundaries`):
  - **Repository** (`src/repositories/users.ts`, extended): the queries, the safe and credential column lists, the named admin filters, `saveRelations(id, { roles, adminOrigins }, tx)`, the entry activation update, and the `UserRow`/`UserValues`/`UserChanges` types.
  - **Domain** (`src/domain/users.ts`): Joi validation, the `transaction(db, fn)` boundary for sign-up and admin writes, and plain typed arguments. It imports no `kysely`, `pg` or Feathers types; the lint rule enforces this.
  - **Controllers** (`src/services/users.ts`, `src/services/admin/users.ts`): parse the Feathers `Id`, query and `params.user` into the domain's arguments, shape the responses, and register `mapDatabaseErrors`.
- Replace `users` with a Feathers-shaped controller over the users domain. It supports only the calls the auth stack makes for the actions clients use, taken from the source of FAM 5.1.0 and `@feathersjs/authentication(-local)` 5.0.44:
  - `find`: the controller parses the query into one of these domain calls: equality on `email` (`LocalStrategy`, `sendResetPwd`, `passwordChange`) and on `verifyToken` (`verifySignupLong`), `$in` on `email` (audit email job), and `$limit`. It always returns an unpaginated array. Any other query is rejected with `BadRequest`, and external `find` stays disallowed.
  - `get`: the full record, including credential and token fields, with `roles` and `adminOrigins`. JWT, `resetPwdLong` and `validateUserPassword` depend on it.
  - `create` (sign-up), `patch` (account, verification and reset-token updates) and internal-only `remove`.
- The existing users hooks stay unchanged: password hashing, add/remove verification, `protect`, `preventChanges`, the external patch allowlist and the verify-date conversions.
- **BREAKING:** `authManagement` accepts only the actions the embed app and the legacy map use: `verifySignupLong`, `sendResetPwd`, `resetPwdLong` and `passwordChange`. Every other action is rejected with `BadRequest`, and the `users` service gets no query support for them. That covers `checkUnique`, `resendVerifySignup`, `identityChange`, `verifySignupShort`, `verifySignupSetPasswordLong`, `verifySignupSetPasswordShort`, `resetPwdShort` and `options`.
- Migrate `admin/users`:
  - The paged find's `roles.id` filter (today `$joinRelation`) and its origin scoping (today `$or`) become named repository filters. The controller reads them from the query; the domain applies admin origin scoping, as the entry domains do.
  - Role and admin-origin sync becomes the repository's `saveRelations`, which the domain calls inside the user's `transaction`. An unknown role or origin id now fails the whole write with `409 Conflict`, instead of being logged while the user columns are saved.
- Move `assignUserRole` into the sign-up transaction: the domain creates the user and saves its role through `saveRelations` in one `transaction`.
- Migrate the remaining user-related code:
  - `userAccountActions`: entry activation becomes a parameterised repository method instead of interpolating the user id, reached through the users domain. Setting a user's `active` flag and their entries' happens in one transaction. Like `authorize`, these hooks run outside the users service's error hooks, so they map database errors with `withFeathersErrors`.
  - `getOriginConfiguration` in `src/hooks/email.js`, which stays a documented direct-repository exception.
  - `importEmailBounces`, `admin/bounces`, `admin/user-account-state-change` and `user-reactivation`.
  - Fix `admin/bounces` while porting it: it binds the admin's origin records instead of their names as SQL values, so as far as the code shows it never returns a bounce.
- User reads outside the auth path select a safe column list by default. `reactivationToken` joins the fields stripped from responses. A test asserts that no external response contains password or token fields.
- The `roles` in the JWT payload and the shape of `params.user` (`roles`, `adminOrigins`, and the password internally) stay the same.

Out of scope:

- Entries, covered by `api-kysely-entries` and `api-layer-boundaries`, both archived.
- Email campaigns and messages and removing Objection, covered by `api-kysely-remove-objection`.
- Replacing FAM or the Feathers authentication strategies.

## Capabilities

### New Capabilities

- `account-management`: the self-service account actions the API accepts (sign-up verification, password-reset request and reset, password change), and the rejection of all others.

### Modified Capabilities

None. There are no existing specs.

## Impact

- **Code:** `packages/api`.
  - `src/repositories/users.ts` is extended and `src/domain/users.ts` is new.
  - `.ts` controllers replace `src/services/users.js` and `src/services/admin/users.js`.
  - Reworked: `src/services/authManagement.js` (action allowlist; `GUEST_EMAIL_ACTIONS` shrinks to `sendResetPwd`), `src/hooks/user.js`, `src/hooks/userAccountActions.js`, `src/hooks/email.js`, `src/jobs/importEmailBounces.js` and `src/services/admin/bounces.js`.
  - Tests in `src/services/__test__/{users,authManagement}.test.js` stop using the `User` model. The `resendVerifySignup` tests change to assert rejection.
- **Models:** `User`, `Role` and `Origin` stay until `api-kysely-remove-objection`.
- **Clients:** no change for `packages/embed`, `packages/map` or `packages/admin`, which use only the four remaining actions. External callers of the removed actions get `BadRequest`.
- **Runtime/ops:** no schema change, no data migration. Rollback is a git revert.
