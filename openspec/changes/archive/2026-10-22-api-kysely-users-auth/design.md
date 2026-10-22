# Design

## Context

See proposal.md for motivation and scope, and `specs/account-management/spec.md` for the externally visible contract. Current state that shapes the approach:

- **Layer rules.** `AGENTS.md` (from `api-layer-boundaries`) fixes the controller / domain / repository split, `transaction(db, fn)`, `saveRelations`, serialisers in `src/services/serializers.ts`, `mapDatabaseErrors`, and the ESLint block on `src/domain/**`. The farm controllers and domain are the reference.
- **Callers of `users`, from the source of `@feathersjs/authentication(-local)` 5.0.44 and FAM 5.1.0:**
  - `LocalStrategy.findEntity`: `find({ query: { email, $limit: 1 } })`, internal; then `get(id, params)` when the call has a provider. It compares `password`.
  - `JWTStrategy.getEntity`: `get(id)` internally, then `get(id, { ...params, user })` when the call has a provider. The result becomes `params.user` (with `password`, `roles`, `adminOrigins`). `getPayload` puts `user.roles` into the token.
  - FAM, with `passParams` unset, so every call is internal: `find({ query: { email | verifyToken, $limit: 2 }, paginate: false })`; `get(id)` in `resetPwdLong`; `patch(id, …)` with the `verify*`, `reset*`, `isVerified` and `password` columns. It reads `verifyExpires`, `resetExpires`, `verifyChanges`, `resetToken` and `password` from the records.
  - `jobs/sendAuditEmail.js`: `find({ query: { email: { $in }, $limit: 100 } })`; the records go into email template locals.
  - `get(id)` from the `authorize` loader, `user-reactivation`, `admin/user-account-state-change` and `jobs/sendEmailCampaignMessages.js`; `patch(id, …)` from `hooks/userAccountActions.js` and `jobs/importEmailBounces.js` (snake_case keys today).
- **Objection's serialised user** carries the virtual `type: 'User'` and `link: '/users/<id>'`, and nested roles and origins carry `type`/`link` too. That includes the `roles` in the JWT payload. `User.$formatJson` strips `password`, `verify*` and `reset{Token,ShortToken,Expires}`, but not `resetAttempts` or `reactivationToken`. `protectUserFields` (`localHooks.protect`) only strips them from the external dispatch, so internal callers still see them.
- **`admin/users`:**
  - `find`/`get` select `userColumns()` (`hooks/relations.js`), with `roles` and `adminOrigins` eager, mapped to ids unless `$details=true`.
  - `q` becomes an `email` substring match, `name` and `email` become substring matches, and the sidebar sends `roles.id` (via `$joinRelation`). The list also filters by `id`, `phone`, `isVerified`, `adminEmailNotifications`, `origin` and `state`, sorts, pages, and the `ReferenceArrayInput`s send `id[$in]`.
  - Non-superadmins see users in their admin origins plus themselves; `get` is not scoped.
  - Writes: Joi `userAdmin` on create only. The `relate` hooks sync `roles`/`adminOrigins` after the write in their own transaction, and they log and swallow errors. The response is the whole row through `$formatJson`, plus the related records written.
- **`admin/bounces`** binds `params.user.adminOrigins`, an array of origin records, as SQL values, so as far as the code shows it can only ever match nothing.
- **Entry activation** in `hooks/userAccountActions.js` is three raw updates with the user id interpolated. `updateUserState` and `updateUserEntriesActiveState` are always called together, by the `authentication` after-hook and by `admin/user-account-state-change`, outside any transaction.
- **Join tables** `users_roles` and `admins_origins` cascade on user delete (foreign-key migration of 2026-07-01).

## Goals / Non-Goals

**Goals:**

- `users` and `admin/users` follow the layer rules: no Kysely in the domain, no Feathers in the domain, and every user write that touches more than one table runs in one transaction.
- Every non-auth read selects a named column list without secrets. Credential columns are read only by the methods the auth stack calls.
- The characterisation tests pin today's responses before the rewrite. Differences are only the ones listed under "Behaviour differences".

**Non-Goals:**

- Origin scoping for `admin/users` `get`, `patch` and `remove` (today only `find` is scoped).
- The admin user form's field set, including the bounce fields that `get` doesn't select today.
- What `jobs/sendEmailCampaignMessages.js` puts into its template locals (`api-kysely-remove-objection`).
- Moving the audit timestamp hooks (`setCreatedAt`, `setUpdatedAt`) into the domain. They stay in the hook chain with the other users hooks.

## Decisions

### Repository: named reads by purpose, and two column lists

`src/repositories/users.ts` already has `OWNER_COLUMNS`, `ADMIN_OWNER_COLUMNS` and `findAdminsToNotify`. It gains:

- **`CREDENTIAL_COLUMNS`**: every `users` column. Only the auth reads use it:
  - `findAccountById(id)`: the full row with `roles` and `adminOrigins`, every column of each (`get`)
  - `findAccountByEmail(email, limit)` and `findAccountByVerifyToken(token, limit)`: rows without relations (`find`)
- **`ADMIN_USER_COLUMNS`**: today's `userColumns()`, for `admin/users` reads.
- **Other reads**:
  - `findAdminPage(query, filters, { details })` and `findAdminById(id, { details })`: relation ids, or full role and origin records with `details`
  - `findByEmails(emails, limit)` for the audit job, with `OWNER_COLUMNS`
  - `findBounced(origins)` for `admin/bounces`
  - `findReactivation(id)` (`id`, `state`, `reactivationToken`) for `user-reactivation`
- **Writes**:
  - `insert`, `update`, `delete`
  - `saveRelations(id, { roles, adminOrigins }, tx)`, with `usersRoles` and `adminsOrigins` added to the `JoinTable` union of `replaceRelation`
  - `setEntriesActive(userId, active, tx)`: the three activation updates as Kysely queries with the id as a parameter
  - `recordBounce(email, { bounceType, bounceName })`, which returns the updated id or `undefined`
- **Admin filters:** `AdminUserFilters = { withRole?: string; visibleTo?: { origins: string[]; userId: string } }`. `withRole` becomes an `exists` on `users_roles`. `visibleTo` becomes `origin in (…) or id = userId`.
- **Search:** `withUserSearch(query)` turns `q` into an `email` match and `name`/`email` into substring matches, before `findPage`. It replaces `buildQueryFromRequest('email')`.
- **Types:** `UserRow`, `UserValues`, `UserChanges` and `UserRelations` are exported for the other layers.
- **Rejected alternative:** a single `findById(id, columns)`. It would put column choice back into the callers, and keep the secret columns one argument away from every read.

### Domain: plain operations and the transactions

`src/domain/users.ts` exposes operations named after what callers want:

- **Auth reads:** `getAccount(id)` (`notFound` otherwise), `findAccountsByEmail(email, limit)` and `findAccountsByVerifyToken(token, limit)`.
- **`signUp(input)`:** validates with Joi `user`, then inserts the user and saves `{ roles: [<id of role 'user'>] }` in one `transaction`. The role id comes from the roles repository inside the same transaction.
- **`patch(id, changes)`:** the internal and external account patch. `notFound` if there is no such user. The controller has already narrowed `changes` with the existing hooks.
- **Admin:**
  - `listAdmin(query, { details, user, withRole })` applies the scoping: no `visibleTo` for superadmins and internal callers, and the admin's origins plus themselves otherwise. This uses the `AdminUser` shape from `entryRules.ts`, extended with `id`.
  - `getAdmin(id, details)`
  - `createAdmin(input)` with Joi `userAdmin`, and `patchAdmin(id, input)`. Each writes the row and `saveRelations` in one `transaction`, and answers with the row in `ADMIN_OWNER_COLUMNS` plus the full records of the relations given, as the farm writes do.
  - `remove(id)`.
- **`setActive(id, active)`:** sets `users.active` and the user's entries in one `transaction`. It replaces the `updateUserState` + `updateUserEntriesActiveState` pairs.
- **`recordLogin(id)`:** state `RECENT_LOGIN`, `lastLogin`, and clears the reminder timestamps and `reactivationToken`.
- **`reactivate(id, token)`:** returns `'active'` or `'reset'` and throws `BadRequest` for a wrong token. The controller adds the error code and the message strings.
- **`recordBounce(email, suppression)`** and **`listBounces(user)`:** bounces in the user's admin origin names, the same rule for every role, as today's query intends.

The Joi schemas stay in `src/models/validation/` for now. `api-kysely-remove-objection` moves them to `src/domain/validation/`.

**Rejected alternative:** keep `updateUserState`/`resetUserLoginActivityState` calling `app.service('users').patch`. That runs internal writes through a hook chain built for client patches, and leaves the activation non-atomic.

### Controllers: the `users` find accepts exactly four query shapes

`src/services/users.ts` keeps the Feathers service interface, because the strategies and FAM resolve it by path:

- `find` parses `params.query` without `$`-filters other than `$limit`:
  - `{ email: string }` → `findAccountsByEmail`
  - `{ verifyToken: string }` → `findAccountsByVerifyToken`
  - `{ email: { $in: string[] } }` → `findByEmails`
  - anything else → `BadRequest`

  It always returns an array, whatever `paginate` says.

- `get`, `create` (`signUp`), `patch` and `remove` convert `Id` to `string` and call the domain.
- **Serialisation:** `toUser` in `serializers.ts` adds `type: 'User'` and `link: '/users/<id>'`, and serialises `roles` with `toRole` and `adminOrigins` with `toOrigin` when they are records. So responses, `params.user` and the JWT `roles` keep today's shape.
- **Hooks:** the existing users hooks stay registered in the same order, minus `withEager` (the reads already return the relations) and `assignUserRole` (now inside `signUp`). `protectUserFields` gains `reactivationToken`, which the spec forbids in responses. Error hook: `mapDatabaseErrors`.

`src/services/admin/users.ts` follows `services/admin/farms.ts`:

- It reads `$details` and `roles.id` from the query, and passes `params.user` and the rest of the query through as `ListQuery`.
- It serialises with `toUser` and `toPage`, and registers `mapDatabaseErrors`.
- `admin/users/:userId/entries` stays as it is.

`hooks/admin.js` and `hooks/relations.js` lose their last users and are deleted.

**Rejected alternative:** give FAM and the strategies their own adapter service instead of `users`. That would have to replicate the `users` hook chain (hashing, verification) that FAM's patches rely on, for no gain.

### Callers outside a service's hook chain

- **`hooks/userAccountActions.js`** is reduced to `activateAccount(app, id)` and `recordLogin(app, id)`. They wrap the domain's `setActive`/`recordLogin` in `withFeathersErrors`, because the `authentication` after-hook has no `mapDatabaseErrors`.
- **`services/admin/userAccountStateChange.js`** calls `setActive`, and **`services/userReactivation.js`** calls `reactivate`. Both are custom services, so they register `mapDatabaseErrors` like `entryContactMessage.js`.
- **`services/admin/bounces.js`** calls `listBounces(params.user)` and maps the records to today's camelCase shape.
- **`jobs/importEmailBounces.js`** calls `recordBounce` and keeps its logging.
- **`getOriginConfiguration`** in `hooks/email.js` uses a new `findByOrigin(origin)` on the origins repository. `hooks/email.js` is already listed in `AGENTS.md` as a direct-repository exception.

### `authManagement` allowlist

- A before-`create` hook rejects any `data.action` outside `verifySignupLong`, `sendResetPwd`, `resetPwdLong` and `passwordChange` with `BadRequest` (`Invalid action`). It runs first, so no lookup or notifier runs.
- `authenticate('jwt')` stays for `passwordChange`.
- `GUEST_EMAIL_ACTIONS` becomes `['sendResetPwd']`.
- `AMBIGUOUS_TOKEN_CODES` drops `verifySignupSetPasswordLong`, and the error-code tests follow.
- **Rejected alternative:** a `BadRequest` that mimics the enumeration-safe `{}` for removed guest actions. Clients don't send them, and a clear rejection is easier to diagnose for external callers.

### Behaviour differences

These are the only intended changes to responses. The characterisation tests (tasks group 1) are updated for each of them in the task that causes it:

1. The removed `authManagement` actions answer `400` (spec).
2. `reactivationToken` no longer appears in `users` `get`/`patch` responses or in `admin/users` write responses (spec).
3. An `admin/users` write with an unknown role or origin id answers `409 Conflict` and writes nothing. Today the user columns are written, the relation error is logged, and the call answers `200`.
4. Sign-up and account activation are atomic (spec: "New accounts get the user role").
5. `admin/bounces` returns the bounced users in the admin's origins, if task 1.3 confirms that it returns `[]` today.
6. External `find`, `update` and `remove` on `users` answer `405` (spec). Today the `authorize` hook answers before the service's `disallow` hooks: `500` for `find`, whose `users:read` condition has no record to check, and `403` for `update` and `remove`, which have no scope. The controller registers only `get`, `create` and `patch` as external methods, so Feathers answers `405` before any hook runs.
7. An admin who is not a superadmin can filter `admin/users` by `roles.id`. Today the `$joinRelation` makes the `id` in the origin scoping ambiguous, and the list answers `500`.

## Risks / Trade-offs

- **[A strategy or FAM sends a query shape the strict `find` doesn't know, and sign-in breaks]** → The four shapes come from the library source at the pinned versions, and the tests run sign-in, every accepted FAM action and the audit job through the real stack. A future library upgrade that changes a query fails those tests with `BadRequest`, not silently.
- **[The JWT `roles` or `params.user` change shape, and authorization or the clients misread roles]** → `toUser`/`toRole` reproduce the Objection serialisation. A test decodes a token issued by sign-in and compares its `roles` with today's.
- **[Credential columns leak through a new read]** → Only the three auth reads use `CREDENTIAL_COLUMNS`. A test asserts the absence of every secret field across the external responses named in the spec.
- **[Unknown role or origin ids now fail admin writes]** → The admin UI only offers ids from `admin/roles` and `admin/origins`. The `409` replaces a silent partial write.
- **[`serviceErrorCodes.test.js` builds the users service on a bare Feathers app without a database]** → The controller factory must not touch `db` until a method runs. The guard hook throws before that.

## Migration Plan

- Normal API release; no schema change, no data migration.
- Smoke checks on `teikei-api-preview`:
  - sign-up, the confirmation link and sign-in in the embed and legacy maps
  - password reset request and reset, and password change
  - editing one's own account
  - reactivation via the email link
  - in the admin: the users list with each filter and role, user edit with roles and admin origins, the bounces list, and account state change
- Rollback is a git revert and redeploy.
