# Proposals

Triage inbox for spec/plan change proposals. `implement` appends, the human triages by
flipping `[open]` to `[applied]` or `[rejected]` (or deleting the entry).

_Entries below were migrated from PR descriptions, which is where proposals were recorded
before `proposals.md` existed. The **Source** line points at the originating PR._

## [open] 7.3 — The `search-widget` stub should stay, not be removed

- **Source:** PR #840
- **Gap:** Feature 7 in `spec.md` says _"Remove the placeholder `search-widget`
  (console-log stub) from the widgets build until a real use case exists."_ That turned out
  to be wrong — the stub should stay.
- **Handled:** The removal was reverted; `npm run build:widgets` confirms the search-widget
  still builds as before. Task 7.3 was scoped down to footer/attribution-link verification
  only, and feature 7 was left `[~]` pending this spec fix.
- **Proposed change:** Drop that sentence from the Feature 7 description in `spec.md`
  (currently `spec.md:162`), and correspondingly drop the "and remove the `search-widget`
  stub from the widgets build (`src/widgets/search-widget`, build config)" clause from
  `plan.md` task 7.3.

## [open] 1.3 — Task 1.3 references a `validations.json` that map-next does not have

- **Source:** PR #844
- **Gap:** `plan.md` task 1.3 mentions a `validations.json` file, but per `spec.md`'s
  Technical Solution map-next has no separate `validations.json` — that file belongs only to
  the legacy `packages/map` app.
- **Handled:** Validation messages were resolved through the paraglide `messages/*.json`
  files instead, which is what the PR does.
- **Proposed change:** Drop the `validations.json` mention from `plan.md` task 1.3.
  (Task 3.1 carries the same stale reference.)

## [open] 2 — F2's open API-behavior question is now answered: farm deletion detaches depots

- **Source:** PR #847
- **Gap:** `spec.md`'s Additional Notes (F2/F8) leaves open whether deleting a farm deletes
  or detaches its connected depots, and asks for the actual API behavior to be verified.
- **Handled:** Verified against the new `packages/api` FK constraints: deleting a farm
  cascades on the `farms_depots` join table only, so **all** connected depots are detached,
  never deleted, regardless of ownership. The "never delete foreign-owned depots" rule holds
  by construction and no API change was needed. Editor/dialog copy states that depots are
  _detached_. Covered by a new e2e suite (consequence copy, farm/initiative removal,
  foreign-depot survival, cancel-is-a-no-op).
- **Proposed change:** Add to `spec.md` → Additional Notes:

  > **Resolved (F2):** Deleting a farm removes only the `farms_depots` join rows via
  > `ON DELETE CASCADE` (migration `20260701120000_add_missing_foreign_keys`), so every
  > connected depot is **detached, never deleted** — regardless of ownership. Depot records
  > survive as standalone entries. The "never delete foreign-owned depots" rule is satisfied
  > by construction; no API change was required. Delete authorization is already enforced on
  > `remove` by the authorization hook. Editor/dialog copy therefore states that depots are
  > _detached_ (disconnected), not removed.
