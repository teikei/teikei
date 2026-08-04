# Spec: Localized API error messages in map-next

## Problem Statement

`packages/map-next` displays raw English error strings from the API to end users — most visibly "Invalid login" when sign-in credentials are wrong, but also "User's email is not yet verified.", "Current password is incorrect.", and library noise like "Invalid token. Get for a new one. (authLocalMgnt)". The app is otherwise fully localized (`de-de`, `de-ch`, `de-at`, `fr-ch`), so these strings are a conspicuous break in an otherwise German/French UI.

The cause is a chain of three things. `buildResponseError` (`packages/map-next/src/lib/api/client.ts:31-42`) prefers the server's `message` over the caller's fallback and discards the rest of the Feathers error payload. Every page handler then does `err instanceof Error ? err.message : m.errors_…()` — and since an `ApiError` _is_ an `Error`, the localized branch is dead code. Finally `translateError` (`src/lib/utils/translate-error.ts:3-10`) treats the string as a paraglide message key and falls back to printing it verbatim when there's no match.

The API has no notion of a UI language (it never reads `Accept-Language`; `packages/api/src/locales/*.json` serve email templates only). Rather than duplicate the frontend's four-locale catalog server-side, the API should emit stable machine-readable error codes and let map-next own all user-facing wording.

Audience: all map-next users, signed-in and guest.

## Features

### 1. Machine-readable `data.errorCode` on API errors

- Description: Every error the API returns for a map-next-reachable surface carries a stable identifier at `data.errorCode` in the JSON body. Feathers' `toJSON()` (`@feathersjs/errors/lib/index.js:26`) already serializes `data`, so this is additive and needs no `errorHandler` override in `app.js:106`. The top-level `code` field keeps its Feathers meaning (HTTP status). The human-readable English `message` is **unchanged** — it stays for server logs and for the legacy `packages/map` client.
- Codes are `SCREAMING_SNAKE_CASE` domain identifiers, deliberately _not_ paraglide keys: the API must not know the frontend's message catalog.
- Acceptance criteria:
  - A failed local sign-in returns HTTP 401 with `data.errorCode === 'INVALID_CREDENTIALS'` and `message === 'Invalid login'`.
  - The top-level `code` field still equals the HTTP status on every error response.
  - An error thrown without an assigned code still serializes normally (no crash, no `errorCode` key).
  - Legacy `packages/map` behavior is unchanged — it reads `message`, which is untouched.

### 2. Codes for first-party API errors

- Description: Explicit throws in `packages/api` gain codes. Unknown-email and wrong-password stay a **single** code (`INVALID_CREDENTIALS`) — splitting them enables account enumeration, which is why Feathers merges them.
- Code catalog (source → code → HTTP status):
  - `@feathersjs/authentication-local` default `errorMessage`, configured via `config/default.json` → `INVALID_CREDENTIALS` → 401
  - `services/authentication.js:40` "User's email is not yet verified." → `EMAIL_NOT_VERIFIED` → 400
  - `hooks/user.js:70` "Missing password for verification" → `PASSWORD_REQUIRED` → 401
  - `hooks/user.js:74` "Password incorrect" → `PASSWORD_INCORRECT` → 401
  - `services/userReactivation.js:20` "Invalid reactivation token." → `REACTIVATION_TOKEN_INVALID` → 400
  - `services/userReactivation.js:11` → code per its actual condition
  - `hooks/authorization.js:68,82` → `FORBIDDEN` → 403
  - `hooks/authorization.js:93` (forbidden fields) → `FORBIDDEN_FIELDS` → 403
  - `services/users.js:40` "Access to user info forbidden" → `FORBIDDEN` → 403
  - `services/geocoder.js:19`, `services/reverseGeocoder.js:13` → `GEOCODING_FAILED` (also converts these plain `Error`s into proper Feathers errors, so they stop surfacing as 500s)
- Acceptance criteria:
  - Each code in the catalog is asserted by a test that triggers the real condition and reads `data.errorCode` off the response.
  - Signing in with an unregistered email and signing in with a wrong password produce byte-identical response bodies.
  - `authentication.local.errorMessage` is set through `config/default.json`, not by patching the library.

### 3. Normalization of `feathers-authentication-management` errors

- Description: The library throws fixed English messages that map-next surfaces during password reset, password change, and account confirmation. An app-level hook on the `authManagement` service maps them to codes so third-party wording never reaches the client and a library upgrade can't silently regress the UI.
- Mapping:
  - "User not found." → `USER_NOT_FOUND`
  - "User is already verified." / "User is already verified & not awaiting changes." → `USER_ALREADY_VERIFIED`
  - "User is not verified." → `USER_NOT_VERIFIED`
  - "Verification token has expired." → `VERIFICATION_TOKEN_EXPIRED`
  - "Password reset token has expired." → `RESET_TOKEN_EXPIRED`
  - "Current password is incorrect." → `CURRENT_PASSWORD_INCORRECT`
  - "Password is incorrect." (identity change) → `PASSWORD_INCORRECT`
  - "Reset Token is incorrect. (authLocalMgnt)" → `RESET_TOKEN_INVALID`
  - "Invalid token. Get for a new one. (authLocalMgnt)" → **ambiguous**: emitted by both `reset-password.js:91` and `verify-signup*.js`. Disambiguate by the requested `action` on the hook context — `resetPwdLong` → `RESET_TOKEN_INVALID`, `verifySignupLong`/`verifySignupSetPasswordLong` → `VERIFICATION_TOKEN_INVALID`.
- Acceptance criteria:
  - Each mapping is covered by a test that asserts the resulting `data.errorCode`.
  - A `resetPwdLong` with a bad token and a `verifySignupLong` with a bad token yield different codes despite sharing a message.
  - An unmapped library message passes through without an `errorCode` (and the frontend then falls back by status — Feature 5).

### 4. Codes for the non-service error surfaces (429, 500)

- Description: Two surfaces don't go through Feathers service errors at all today.
  - **429 rate limit** (`middleware/rateLimit.js`): `express-rate-limit` returns a plain-text body, so map-next's `response.json()` throws and the user sees the caller's hardcoded English fallback. The limiters get a `handler` that emits a Feathers-shaped JSON body with `errorCode: 'RATE_LIMITED'` and HTTP 429.
  - **500 GeneralError**: `errorHandler` (`@feathersjs/express/lib/handlers.js`) wraps any non-Feathers `Error` into a `GeneralError` **carrying the original message** — so internals like "missing html template for …" reach the client. 500s get `errorCode: 'SERVER_ERROR'`, and the frontend never renders the server's 500 message.
- Acceptance criteria:
  - Exceeding the auth rate limit returns HTTP 429 with `Content-Type: application/json` and `data.errorCode === 'RATE_LIMITED'`.
  - An unexpected server exception returns 500 with `data.errorCode === 'SERVER_ERROR'`; the raw message is still logged server-side.
  - No 500 response message is rendered in the map-next UI under any code path.

### 5. Frontend code → message resolution

- Description: `ApiError` (`src/lib/types/errors.ts`) gains `errorCode`, `name` and `className` from the response body; `buildResponseError` populates them. A new resolver module maps a code to a paraglide message, with a **status-class fallback chain** for codes it doesn't know: 401, 403, 404, 409/422, 429 and 5xx each resolve to their own distinct localized message — no single generic bucket. The caller's own message is the last resort. An unmapped code is never rendered.
- Acceptance criteria:
  - A 401 `INVALID_CREDENTIALS` renders the localized invalid-credentials message in the active locale.
  - An unknown code with status 403 renders the localized 403 message; with status 500, the localized 500 message; the two differ.
  - A response with no JSON body (network/proxy failure) resolves to the localized 5xx or connection message, never an English literal.
  - The raw server `message` is never rendered in the UI; it remains available on `ApiError` for `console.warn`/dev logging.
  - Unit tests cover: known code, unknown code per status class, missing code, unparseable body.

### 6. Call-site migration

- Description: Replace the `err instanceof Error ? err.message : m.errors_…()` pattern at every site with the resolver, keeping each site's existing message as the final fallback:
  - `routes/users/sign-in/+page.svelte:29`, `sign-up/+page.svelte:36`, `editpassword/+page.svelte:29`, `editaccount/+page.svelte:37`, `resetpassword/+page.svelte:26`, `recoverpassword/+page.svelte:20`
  - `components/layout/AccountTokenHandler.svelte:109`
  - `components/domain/entries/EntryContactForm.svelte:90`
  - `components/domain/farms/FarmProfile.svelte:159`, `initiatives/InitiativeProfile.svelte:137`, `depots/DepotEditor.svelte:138`
- Acceptance criteria:
  - No remaining occurrence of `error.message` / `err.message` being assigned to user-visible state in `packages/map-next/src` (test files excluded).
  - Each migrated site still shows _some_ localized message when the API returns an error with no code.

### 7. `FormErrorAlert` stops re-translating localized text

- Description: `FormErrorAlert.svelte` currently pipes its `error` prop through `translateErrorsToArray`, which **splits the string on commas** and treats each fragment as a paraglide key. Once the prop carries already-localized prose, any message containing a comma is silently split into fragments and re-joined without the separator. The alert must render already-resolved text as-is; `translateErrors` stays in use for the form-field components (`FormInput`, `FormSelect`, `FormTextarea`, `GeocoderField`, `DepotEditor`), where the values genuinely are validation keys from `editor-schema.ts`.
- Acceptance criteria:
  - A localized message containing a comma renders verbatim in `FormErrorAlert`, commas intact.
  - Zod validation keys still resolve to localized text in `FormInput` and friends (existing behavior unregressed).

### 8. Message catalog

- Description: New `errors_*` keys added to all four locale files: `messages/de-de.json`, `de-ch.json`, `de-at.json`, `fr-ch.json`. Wording for the credentials case must not distinguish unknown-email from wrong-password.
- Acceptance criteria:
  - Every code in the Feature 2/3/4 catalog plus every status-class fallback has a key present in all four files.
  - `npm run check` in `packages/map-next` passes (paraglide compiles, no missing-key type errors).

## Technical Solution

- **Architecture**: The API stays language-agnostic and emits identifiers; map-next owns 100% of user-facing wording. Codes travel in `data.errorCode`, which stock Feathers already serializes — no `errorHandler` override, no changes to the shape legacy `packages/map` depends on.
- **API side**: a small shared helper for attaching codes to thrown Feathers errors; `authentication.local.errorMessage` set via `config/default.json`; one normalization hook for `feathers-authentication-management`; a JSON `handler` for the `express-rate-limit` limiters; a 500 catch-all in the error pipeline.
- **Frontend side**: `ApiError` carries `errorCode`/`name`/`className`; one resolver module holds the code → paraglide-message lookup and the status-class fallback chain; call sites become one-liners.
- **Key decisions**:
  - `data.errorCode` over a top-level field — Feathers `toJSON()` drops unknown top-level properties, so a top-level field would need a custom JSON formatter for no real gain.
  - English `message` preserved — server logs stay readable and legacy `packages/map` is unaffected, making this a non-breaking API change.
  - Domain codes, not paraglide keys — the API doesn't know the frontend catalog, and codes stay valid if map-next reorganizes its messages.
  - 403 and 5xx get distinct localized messages rather than collapsing into one generic error, so "you're not allowed to do that" and "something broke on our end" stay distinguishable to the user.
  - Unknown-email and wrong-password remain one code (anti-enumeration).

## Out of Scope

- Server-side localization (`Accept-Language`, API-side message catalogs) — explicitly rejected; the API's `src/locales/*.json` stay email-only.
- `packages/map` (legacy) — being retired; it keeps reading `message` and is unaffected.
- Per-field validation message localization for Objection/DB `ValidationError`s. Entry save validation gets a `VALIDATION_FAILED` code and the existing `errors` object passes through untouched; map-next already validates these fields client-side with zod.
- Changing any English `message` text.
- Rotating the committed JWT secret (tracked separately as an ops action).

## Additional Notes

- Risk: the auth-management mapping is string-based against a third-party library. Tests asserting each mapping are the guard — a library upgrade that reworks messages will fail them loudly rather than regress the UI silently.
- The rate-limit change alters a currently plain-text response to JSON. Worth checking whether anything else consumes 429 bodies.
- `hooks/logError.js` (around-all) already logs errors; codes should not change what's logged.
- Assumption: `packages/api` has thin test coverage for error paths (`src/__test__` holds only `foreignKeys.test.js`), so Feature 2/3/4 criteria mean writing new tests, not extending existing ones.
- Unverified during spec drafting: whether `services/userReactivation.js:11` and the two geocoder throws actually reach the map-next UI. Their codes are specified on the assumption they can; confirm during planning and drop them from the catalog if they can't.
