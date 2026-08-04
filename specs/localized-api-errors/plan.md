# Implementation Plan: Localized API error messages in map-next

Spec: specs/localized-api-errors/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

Planning decision (resolves an ambiguity in the spec): Feature 1's criterion requires a failed sign-in to keep `message === 'Invalid login'`, while Feature 2's criterion asks for `authentication.local.errorMessage` to be set in `config/default.json`. These reconcile as: pin `errorMessage` to the literal `"Invalid login"` in config — taking ownership of the string from the library default so a Feathers upgrade can't shift it — and attach `INVALID_CREDENTIALS` via an `error` hook on the `authentication` service. The message text does not change.

- [x] 1. Machine-readable `data.errorCode` on API errors (depends on: none)
  - [x] 1.1 Add `packages/api/src/utils/errorCodes.js` exporting the code constants and a `withErrorCode(error, code)` helper that merges `{ errorCode }` into `error.data` without clobbering existing `data` keys
  - [x] 1.2 Unit-test that a coded error's `toJSON()` contains `data.errorCode` and that top-level `code` still equals the HTTP status
  - [x] 1.3 Unit-test that an uncoded error serializes unchanged — no `errorCode` key, no throw
  - [x] 1.4 Confirm the serialized shape is additive: `message` is untouched, so legacy `packages/map` (which reads `message`) is unaffected

- [x] 2. Codes for first-party API errors (depends on: 1)
  - [x] 2.1 Pin `authentication.local.errorMessage` to `"Invalid login"` in `packages/api/config/default.json` (the `authentication.local` block already exists with `usernameField`/`passwordField`)
  - [x] 2.2 Add an `error.create` hook on the `authentication` service attaching `INVALID_CREDENTIALS` to the LocalStrategy `NotAuthenticated`, and `EMAIL_NOT_VERIFIED` to the `BadRequest` thrown at `src/services/authentication.js:40`
  - [x] 2.3 Attach `PASSWORD_REQUIRED` and `PASSWORD_INCORRECT` at `src/hooks/user.js:70,74`
  - [x] 2.4 Attach `FORBIDDEN` at `src/hooks/authorization.js:68,82` and `src/services/users.js:40`; `FORBIDDEN_FIELDS` at `src/hooks/authorization.js:93`
  - [x] 2.5 Attach `REACTIVATION_TOKEN_INVALID` at `src/services/userReactivation.js:20`; first confirm whether `:11` is reachable from map-next (spec flags this as unverified) and either code it or record why it was dropped
        Dropped `:11` ("id and token must be present"): `AccountTokenHandler.svelte:103` only calls `reactivateUser` inside an `if (reactivationToken && userId)` guard, so map-next can never send a request missing either field. It stays an uncoded programming-error guard.
  - [x] 2.6 Confirm whether `src/services/geocoder.js:19` / `src/services/reverseGeocoder.js:13` surface in the map-next UI (spec flags this as unverified); if so convert the plain `Error`s to Feathers errors carrying `GEOCODING_FAILED` so they stop being 500s, otherwise drop the code from the catalog
        Dropped `GEOCODING_FAILED` from the catalog. `reverseGeocoder` is `disallow('external')` (`reverseGeocoder.js:51`), so it is unreachable from any client. `geocoder` is reachable via `geocodeLocationId`, but `GeocoderField.svelte:210-216` catches every failure into a local `geocodeFailed` flag and renders `m.editor_geocoder_resolve_error()` — the server message is never shown, so a code would have no consumer.
  - [x] 2.7 Write tests triggering each real condition and asserting `data.errorCode` off the response
  - [x] 2.8 Write the anti-enumeration test: sign-in with an unregistered email and sign-in with a wrong password produce byte-identical response bodies

- [ ] 3. Normalization of `feathers-authentication-management` errors (depends on: 1)
  - [ ] 3.1 Add a message → code table and a normalization hook to `src/services/authManagement.js`, registered in the existing `error.create` hook array alongside `suppressEnumerationError`
  - [ ] 3.2 Disambiguate the shared string `"Invalid token. Get for a new one. (authLocalMgnt)"` by `ctx.data.action` — `resetPwdLong` → `RESET_TOKEN_INVALID`, `verifySignupLong`/`verifySignupSetPasswordLong` → `VERIFICATION_TOKEN_INVALID`
  - [ ] 3.3 Verify composition with the existing enumeration guard: `sendResetPwd` and `resendVerifySignup` must still return the generic empty result with no code leaked, regardless of hook order
  - [ ] 3.4 Write a test per mapping, plus the two-token disambiguation test and an enumeration-guard regression test
  - [ ] 3.5 Verify an unmapped library message passes through with no `errorCode` (frontend then falls back by status)

- [ ] 4. Codes for the non-service error surfaces (429, 500) (depends on: 1)
  - [ ] 4.1 Give the `express-rate-limit` limiters in `src/middleware/rateLimit.js` a `handler` emitting a Feathers-shaped JSON body with `data.errorCode === 'RATE_LIMITED'`, HTTP 429, `Content-Type: application/json`
  - [ ] 4.2 Attach `SERVER_ERROR` to 500s in the error pipeline, ensuring the raw message is still logged server-side via `hooks/logError.js` and the `errorHandler` logger
  - [ ] 4.3 Test the 429 response shape by exceeding the auth limit, and the 500 response shape from an induced unexpected exception
  - [ ] 4.4 Check whether anything else consumes the previously plain-text 429 body before landing (spec risk note)

- [ ] 5. Frontend code → message resolution (depends on: 8)
  - [ ] 5.1 Extend `ApiError` in `packages/map-next/src/lib/types/errors.ts` with `errorCode`, `name` and `className`
  - [ ] 5.2 Populate them in `buildResponseError` (`src/lib/api/client.ts:31-42`), reading `data.errorCode` and `className` off the parsed body
  - [ ] 5.3 Add `src/lib/utils/api-error.ts`: the code → paraglide-message lookup table, then a status-class fallback chain giving 401, 403, 404, 409/422, 429 and 5xx each their own distinct message, with the caller's fallback last; an unmapped code is never rendered
  - [ ] 5.4 Unit-test the resolver: known code, unknown code per status class, missing code, unparseable body
  - [ ] 5.5 Extend `src/lib/api/client.spec.ts` to cover `errorCode` parsing and the no-JSON-body path

- [ ] 6. Call-site migration (depends on: 2, 5, 7)
  - [ ] 6.1 Migrate the six user routes: `sign-in/+page.svelte:29`, `sign-up/+page.svelte:36`, `editpassword/+page.svelte:29`, `editaccount/+page.svelte:37`, `resetpassword/+page.svelte:26`, `recoverpassword/+page.svelte:20`
  - [ ] 6.2 Migrate `components/layout/AccountTokenHandler.svelte:109` and `components/domain/entries/EntryContactForm.svelte:90`
  - [ ] 6.3 Migrate the toast sites: `domain/farms/FarmProfile.svelte:160`, `domain/initiatives/InitiativeProfile.svelte:138`, `domain/depots/DepotEditor.svelte:139`
  - [ ] 6.4 Grep-verify no remaining `err.message` / `error.message` is assigned to user-visible state in `packages/map-next/src` (tests excluded); keep it available for dev logging only
  - [ ] 6.5 Verify against a locally running API that a wrong-password sign-in shows the localized message, and that each migrated site still shows a localized message when the API returns no code

- [ ] 7. `FormErrorAlert` stops re-translating localized text (depends on: none)
  - [ ] 7.1 Change `src/lib/components/forms/FormErrorAlert.svelte` to render its `error` prop as-is instead of piping it through `translateErrorsToArray` (which splits on commas and drops the separator)
  - [ ] 7.2 Confirm `translateErrors` stays in use for `FormInput`, `FormSelect`, `FormTextarea`, `GeocoderField` and `DepotEditor`, where the values really are validation keys from `editor-schema.ts`
  - [ ] 7.3 Test that a localized message containing a comma renders verbatim, and that zod validation keys still resolve in `FormInput`
  - [ ] 7.4 Update `FormErrorAlert.stories.svelte` if its args still assume key-shaped input

- [ ] 8. Message catalog (depends on: none)
  - [ ] 8.1 Add the `errors_*` keys for every code in the spec's Feature 2/3/4 catalog to `packages/map-next/messages/de-de.json`, wording the credentials case so it does not distinguish unknown-email from wrong-password
  - [ ] 8.2 Add the status-class fallback keys (401, 403, 404, 409/422, 429, 5xx) — 403 and 5xx must read distinctly, not as one generic error
  - [ ] 8.3 Propagate all new keys to `de-ch.json`, `de-at.json` and `fr-ch.json`
  - [ ] 8.4 Verify `npm run check` passes in `packages/map-next` (paraglide compiles, no missing-key type errors)
  - [ ] 8.5 Reconcile the catalog once 2–4 have landed — remove keys for any code dropped in 2.5/2.6, add keys for any code introduced
