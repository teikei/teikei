# Proposals

Triage inbox for spec/plan change proposals. `implement` appends, the human triages by
flipping `[open]` to `[applied]` or `[rejected]` (or deleting the entry).

_Entries below were migrated from PR descriptions, which is where proposals were recorded
before `proposals.md` existed. The **Source** line points at the originating PR._

## [open] 3 — Feature 3's contrast criteria and per-theme figures are miscalculated

- **Source:** PR #895
- **Gap:** The criterion "`--sidebar-accent` measures between 1.15:1 and 1.30:1 against
  `--sidebar` in every theme" is unsatisfiable by the tokens the spec itself prescribes:
  they measure **1.64:1** (teikei) and **1.54:1** (client-demo), and client-demo's value is
  pinned by an existing token, so the 1.30 ceiling is unreachable without changing mist-200.
  The stated per-theme figures are also wrong: old olive-100 on cream is 1.08:1, not
  1.035:1, and the foregrounds are olive-900 on cream-200 = 9.3:1 and ink-900 on mist-200 =
  12.2:1 (the spec says ≈12.2 / ≈14.0).
- **Handled:** The tokens were implemented as prescribed and all ratios recomputed from the
  oklch values (oklch → linear sRGB → WCAG luminance, conversion sanity-checked against
  known hexes). Feature 3's plan line was left `[~]` pending this spec fix rather than
  closed against criteria it cannot meet.
- **Proposed change:** Replace those bullets in `spec.md` with:

  > - `teikei`'s `--sidebar-accent` becomes `--base-color-cream-200`: measured **1.64:1**
  >   against `--sidebar`.
  > - `client-demo`'s `--sidebar-accent` becomes the existing `--base-color-mist-200`:
  >   measured **1.54:1** against `--sidebar` (`--base-color-mist-50`).
  > - `--sidebar-accent` measures at least 1.15:1 against `--sidebar` in every theme.
  > - `--sidebar-accent-foreground` is unchanged and stays ≥4.5:1 on the new fill
  >   (olive-900 on cream-200 = 9.3:1; ink-900 on mist-200 = 12.2:1).

## [open] 2 — The `a[href]` cursor selector has no `aria-disabled` exclusion

- **Source:** PR #899
- **Gap:** The prescribed `a[href]` selector lacks the `aria-disabled` exclusion that both
  button branches carry, which is asymmetric with the criterion "A disabled or
  `aria-disabled` control does not show a pointer cursor."
- **Handled:** Implemented as the spec writes it — the gap is latent, not live:
  `ui/button/button.svelte` drops `href` when disabled, so nothing matches today.
- **Proposed change:** Make the third selector `a[href]:not([aria-disabled='true'])` in
  `spec.md` (and in `src/routes/layout.css`).

## [open] 2 — Geocoder suggestions show a pointer while other option lists show an arrow

- **Source:** PR #899
- **Gap:** `forms/GeocoderField.svelte` is explicitly listed under "should show pointer",
  but `Command.Item`/`Select.Item` option lists keep the arrow. The two are semantically the
  same control and will look inconsistent side by side.
- **Handled:** Implemented per the spec, so the PR is conformant; flagged rather than
  silently diverging.
- **Proposed change:** Decide whether the geocoder suggestions should instead adopt
  `cursor-default` to match the other option lists, and update the Feature 2 lists in
  `spec.md` accordingly.

## [open] 1 — Playwright `webServer.timeout` default is too short for build + preview

- **Source:** PR #900 (outside the task's scope)
- **Gap:** `packages/map-next/playwright.config.ts` relies on the default 60s
  `webServer.timeout`, which is shorter than `npm run build && npm run preview` typically
  takes. When it trips, Playwright kills the server but the port can stay occupied,
  producing `ERR_CONNECTION_REFUSED` cascades that read as test failures.
- **Handled:** Not changed in the PR — out of scope for the task.
- **Proposed change:** Add `timeout: 300000` to `webServer` in
  `packages/map-next/playwright.config.ts`.

## [open] 1 — Playwright port 4173 is not per-workspace

- **Source:** PR #900 (outside the task's scope)
- **Gap:** Another Conductor workspace serving its own build on port 4173 caused
  Playwright's default `reuseExistingServer` to silently run the suite against _that_ build.
- **Handled:** Not changed in the PR — out of scope for the task. Worked around manually.
- **Proposed change:** Make the preview port env-configurable, or document the
  `lsof -ti :4173` check in the e2e instructions.

  Also worth knowing (not a proposal): the full e2e suite is flaky under parallel workers —
  12 failures at baseline vs 10 with PR #900's change, non-overlapping sets, all green with
  `--workers=1`.

## [open] 4 — Feature 4 landed without e2e regression coverage

- **Source:** PR #903
- **Gap:** Task 4.4 says "Verify …", and the spec's Additional Notes list
  `e2e/perf-accessibility-sanity.test.ts` as the coverage home for Features 1, 7, 8 and 9 —
  Feature 4 is absent. But Feature 4 fixes exactly the failure mode that is invisible
  without a test: the map→list highlight resolved to a fill nobody could see, and nothing
  would catch it regressing to that state again. Feature 6 is likewise unlisted.
- **Handled:** Verified in a real browser with a throwaway Playwright probe — row at rest
  `rgba(0,0,0,0)`, pointer hover `oklch(0.88 0.008 170.4)`, map-marker hover the identical
  value, inner card transparent. The probe was then deleted to keep the diff in scope. It
  costs ~35s and needs six "Zoom in" clicks to clear the marker `minzoom` of 9.5. (Feature
  9 did get coverage in this PR, since the spec already designates a home for it.)
- **Proposed change:** In `spec.md` "Additional Notes", change
  "`e2e/perf-accessibility-sanity.test.ts` is the natural home for regression coverage of
  Features 1, 7, 8, and 9." to "… of Features 1, 4, 6, 7, 8, and 9." — then the probe can be
  re-added as a permanent test.

## [open] 6 — Pointer hover and keyboard focus share one hover slot

- **Source:** PR #903
- **Gap:** Feature 6 says focusing a row emphasizes the corresponding marker, but the spec
  says nothing about what happens when pointer hover and keyboard focus compete. They write
  the same single-valued `hoveredEntry` store, so the last event wins: Tab to row 3 (marker
  3 emphasized), then sweep the mouse across row 5 and off the list — `mouseleave` on row 5
  clears the key and nothing is emphasized, even though row 3 still holds focus and shows
  its ring. It recovers only on the next focus or hover event.
- **Handled:** Accepted as-is. Separating the two would mean tracking focus independently of
  hover in `hovered-entry.svelte.ts` and deciding a precedence rule — well beyond what
  Feature 6 asks for, and the mixed mouse-and-keyboard sequence that triggers it is rare.
- **Proposed change:** Add to Feature 6's acceptance criteria, or to "Additional Notes":
  "Pointer hover and keyboard focus write the same single-valued hover state, so the most
  recent of the two wins; moving the mouse over and off the list drops the highlight of a
  row that still has focus. This is an accepted limitation — the highlight is an aid, not a
  status, and it restores on the next focus or hover."

## [open] 9 — Feature 9's "per-frame flicker" and "no aria-live region today" are both wrong

- **Source:** PR #903
- **Gap:** Two factual claims in the spec do not hold. (a) Feature 9 says debouncing "also
  removes the current per-frame flicker" — but `sidebarEntries` is only recomputed on
  `moveend`/`zoomend`, already debounced at `BBOX_SYNC_DEBOUNCE_MS = 100`
  (`src/routes/Map.svelte:55,487`), so the count never updated per frame. Measured: one
  continuous pan gesture produces exactly one viewport sync. (b) Additional Notes say "The
  app has no `aria-live` region today" — the toast container renders
  `<section aria-live="polite" aria-label="Notifications alt+T">`, so Feature 9 is the first
  region _authored in this codebase_, not the first in the DOM.
- **Handled:** Implemented as specified; the debounce still earns its place, just for a
  different reason — it coalesces the several `moveend`/`zoomend` settles a burst of
  gestures or a wheel-zoom produces, each of which would otherwise announce separately. The
  stale rationale is still repeated in the code comment at `EntriesList.svelte:56-60` and
  should be reworded when this entry is triaged.
- **Proposed change:** In Feature 9, replace "This is an accepted, intentional behavior
  change — it also removes the current per-frame flicker." with "This is an accepted,
  intentional behavior change. The upstream viewport sync is already debounced at 100ms and
  only runs on `moveend`/`zoomend`, so this debounce is not about per-frame updates — it
  coalesces the separate settles a burst of gestures or a wheel-zoom produces." In
  Additional Notes, replace "The app has no `aria-live` region today, so Feature 9
  establishes the pattern for the codebase." with "The only `aria-live` region today is the
  toast container's own; Feature 9 is the first authored in this codebase."

## [open] 9 — The double-announcement check cannot leave an automated artifact

- **Source:** PR #903
- **Gap:** Task 9.4 asks to verify that the count element being both a live region and (via
  its `Sidebar.GroupLabel` ancestor) the `aria-labelledby` target of the `<ul>` does not
  cause a double announcement. Whether a screen reader re-announces a container's changed
  accessible name is not observable from Playwright or the accessibility tree — it needs a
  real NVDA/JAWS/VoiceOver pass.
- **Handled:** Verified everything that _is_ observable, and landed it as e2e coverage: the
  count carries `aria-live="polite"`, the identical DOM node survives the capped↔uncapped
  switch, the `<ul>`'s accessible name still equals the visible text, and the my-entries
  count has no live region. Measured separately: one continuous pan produces exactly one
  viewport sync and one text mutation. The live region was left on the visible count element
  — the spec's fallback (a visually-hidden sibling) was not applied, since AT does not
  normally announce name changes on unfocused containers.
- **Proposed change:** Either downgrade 9.4's second clause to a manual QA item outside the
  plan, or add to Feature 9's acceptance criteria: "The live region stays on the visible
  count element. Whether nesting it inside the `aria-labelledby` target double-announces is
  a screen-reader QA question, not an automated check; if a real AT pass shows double
  announcement, move it to a visually-hidden sibling."
