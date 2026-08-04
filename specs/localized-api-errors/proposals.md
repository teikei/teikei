# Proposals: Localized API error messages in map-next

Spec: specs/localized-api-errors/spec.md

Triage status is the marker on each heading — `[open]` until a human flips it to `[applied]` or `[rejected]` (or deletes the entry). `spec.md` is single-writer, so none of these were applied by `implement`.

These four entries were raised across the `implement` runs for this spec, when proposals still lived only in session reports and the PR body. They were migrated here from PR #901's `## Proposals` section and the implementation session transcripts; the wording is theirs, condensed into the current entry format.

## [open] 1.1 — `VALIDATION_FAILED` is asserted in _Out of Scope_ but exists nowhere else

- **Gap:** `spec.md:123` states "Entry save validation gets a `VALIDATION_FAILED` code", but the code appears in no feature catalog (Features 2/3/4) and no plan task attaches it to the Objection `ValidationError` path.
- **Handled:** left out of `packages/api/src/utils/errorCodes.js` rather than shipping an unused constant. Task 8.5 later confirmed the message catalog matches the 17 exported codes exactly, so it is absent from the locale files too.
- **Proposed change:** either add `VALIDATION_FAILED` to Feature 2's code catalog with a task attaching it to the Objection `ValidationError` path, or drop the phrase from _Out of Scope_ (`spec.md:123`).

## [open] 1.4 — Feature 1's first acceptance criterion can only be met by Feature 2

- **Gap:** `spec.md:20` requires "A failed local sign-in returns HTTP 401 with `data.errorCode === 'INVALID_CREDENTIALS'`" under Feature 1, but that is wiring done by tasks 2.1/2.2. Feature 1 ships the `withErrorCode` mechanism only, so it could not close on its own evidence.
- **Handled:** Feature 1 was left `[~]` with the reason recorded in the plan rather than checked off against an unmet criterion; it closed once Feature 2 landed.
- **Proposed change:** move that bullet from Feature 1's criteria to Feature 2's, and replace it in Feature 1 with a mechanism-level criterion:
  > - An error passed through `withErrorCode` serializes with `data.errorCode` set, while its `message` and top-level `code` are unchanged.

## [open] 2.6 — The Feature 2 catalog still lists two codes that were dropped with evidence

- **Gap:** `spec.md:34` (`services/userReactivation.js:11`) and `spec.md:38` (`GEOCODING_FAILED`) were both flagged as unverified-reachability in _Additional Notes_ (`spec.md:133`) and both turned out to be unreachable. `userReactivation.js:11` cannot fire from map-next — `AccountTokenHandler.svelte` only calls `reactivateUser` inside an `if (reactivationToken && userId)` guard. `GEOCODING_FAILED` has no consumer — `reverseGeocoder` is `disallow('external')`, and `geocoder` failures are swallowed by `GeocoderField.svelte` into its own localized message.
- **Handled:** both dropped, with the evidence recorded inline under plan tasks 2.5 and 2.6. `GEOCODING_FAILED` was removed from `errorCodes.js`, `userReactivation.js:11` stays an uncoded programming-error guard, and task 8.5 verified no `errors_code_geocoding_failed` key entered the four locale files.
- **Proposed change:** delete the `services/userReactivation.js:11` line (`spec.md:34`) and the `services/geocoder.js:19`, `services/reverseGeocoder.js:13` line (`spec.md:38`), including its parenthetical "(also converts these plain `Error`s into proper Feathers errors, so they stop surfacing as 500s)". The unverified-reachability note at `spec.md:133` can then be marked resolved.

## [open] 6.4 — Two UI-wide acceptance criteria were filed under API-side features

- **Gap:** `spec.md:70` ("No 500 response message is rendered in the map-next UI under any code path") sits under Feature 4, which is API-only, and `spec.md:79` ("The raw server `message` is never rendered in the UI") sits under Feature 5, which ships the resolver but not the call sites. Neither feature could deliver its own criterion; only Feature 6's call-site migration could.
- **Handled:** Features 4 and 5 were held at `[~]` with the reason recorded in the plan (tasks 4.4 and 5.5) and closed once 6.1–6.4 landed. Both criteria are satisfied now, so this is a wording cleanup and a lesson for future specs, not a blocker.
- **Proposed change:** move both bullets to Feature 6's criteria as a single line:

  > - No call site renders `error.message`; every user-visible error string comes from `resolveApiErrorMessage`, including 500s.

  Feature 5 keeps the resolver-level half: _"`resolveApiErrorMessage` never returns the server's `message`; it remains on `ApiError` for dev logging."_ Feature 4 keeps only its two API-side criteria.
