# Proposals: Entry List Accessibility & Interaction Affordances (map-next)

Spec: specs/map-next-entry-list-a11y/spec.md · Plan: specs/map-next-entry-list-a11y/plan.md

Appended by `implement`, triaged by the human. Only the human flips `[open]` to
`[applied]` / `[rejected]`.

## [open] 4.4 — Feature 4 landed without e2e regression coverage

- **Gap:** Task 4.4 says "Verify …", and the spec's Additional Notes list
  `e2e/perf-accessibility-sanity.test.ts` as the coverage home for Features 1, 7, 8 and 9 —
  Feature 4 is deliberately absent. But Feature 4 fixes exactly the failure mode that is
  invisible without a test: the map→list highlight resolved to a fill nobody could see, and
  nothing would catch it regressing to that state again.
- **Handled:** Verified in a real browser with a throwaway Playwright probe — row at rest
  `rgba(0,0,0,0)`, pointer hover `oklch(0.88 0.008 170.4)`, map-marker hover the identical
  value, inner card transparent. The probe was then deleted to keep the diff in scope. It
  costs ~35s and needs six "Zoom in" clicks to clear the marker `minzoom` of 9.5.
- **Proposed change:** In spec.md "Additional Notes", change
  "`e2e/perf-accessibility-sanity.test.ts` is the natural home for regression coverage of
  Features 1, 7, 8, and 9." to "… of Features 1, 4, 6, 7, 8, and 9." — then the probe can be
  re-added as a permanent test. Note the suite already has a pre-existing flake under
  parallel load (`e2e/bbox-follow.test.ts`, reproduced on a clean tree), which more
  zoom-driven tests will aggravate.

## [open] 6.2 — Pointer hover and keyboard focus share one hover slot

- **Gap:** Feature 6 says focusing a row emphasizes the corresponding marker, but the spec
  says nothing about what happens when pointer hover and keyboard focus compete. They write
  the same single-valued `hoveredEntry` store, so the last event wins: Tab to row 3 (marker 3
  emphasized), then sweep the mouse across row 5 and off the list — `mouseleave` on row 5
  clears the key and nothing is emphasized, even though row 3 still holds focus and shows its
  ring. It recovers only on the next focus or hover event.
- **Handled:** Accepted as-is. Separating the two would mean tracking focus independently of
  hover in `hovered-entry.svelte.ts` and deciding a precedence rule — well beyond what
  Feature 6 asks for, and the mixed mouse-and-keyboard sequence that triggers it is rare.
- **Proposed change:** Add to Feature 6's acceptance criteria, or to "Additional Notes":
  "Pointer hover and keyboard focus write the same single-valued hover state, so the most
  recent of the two wins; moving the mouse over and off the list drops the highlight of a row
  that still has focus. This is an accepted limitation — the highlight is an aid, not a
  status, and it restores on the next focus or hover."

## [open] 9.2 — Feature 9's "per-frame flicker" and "no aria-live region today" are both wrong

- **Gap:** Two factual claims in the spec do not hold. (a) Feature 9 says debouncing "also
  removes the current per-frame flicker" — but `sidebarEntries` is only recomputed on
  `moveend`/`zoomend`, already debounced at `BBOX_SYNC_DEBOUNCE_MS = 100`
  (`src/routes/Map.svelte:55,487`), so the count never updated per frame. Measured: one
  continuous pan gesture produces exactly one viewport sync. (b) Additional Notes say "The
  app has no `aria-live` region today" — the toast container renders
  `<section aria-live="polite" aria-label="Notifications alt+T">`, so Feature 9 is the first
  region _authored in this codebase_, not the first in the DOM.
- **Handled:** Implemented as specified; the debounce still earns its place, just for a
  different reason — it coalesces the several `moveend`/`zoomend` settles a burst of gestures
  or a wheel-zoom produces, each of which would otherwise announce separately. The
  implementation comment states this reason rather than the spec's.
- **Proposed change:** In Feature 9, replace "This is an accepted, intentional behavior
  change — it also removes the current per-frame flicker." with "This is an accepted,
  intentional behavior change. The upstream viewport sync is already debounced at 100ms and
  only runs on `moveend`/`zoomend`, so this debounce is not about per-frame updates — it
  coalesces the separate settles a burst of gestures or a wheel-zoom produces." In Additional
  Notes, replace "The app has no `aria-live` region today, so Feature 9 establishes the
  pattern for the codebase." with "The only `aria-live` region today is the toast container's
  own; Feature 9 is the first authored in this codebase."

## [open] 9.4 — The double-announcement check cannot leave an automated artifact

- **Gap:** Task 9.4 asks to verify that the count element being both a live region and (via
  its `Sidebar.GroupLabel` ancestor) the `aria-labelledby` target of the `<ul>` does not cause
  a double announcement. Whether a screen reader re-announces a container's changed accessible
  name is not observable from Playwright or the accessibility tree — it needs a real NVDA/JAWS
  /VoiceOver pass.
- **Handled:** Verified everything that _is_ observable: one continuous pan produces exactly
  one viewport sync and one text mutation; the capped↔uncapped switch reuses the identical DOM
  node (marked the element, zoomed past the 200 cap, confirmed the mark survived); the `<ul>`'s
  accessible name still equals the visible text in both variants. The live region was left on
  the visible count element — the spec's fallback (a visually-hidden sibling) was not applied,
  since AT does not normally announce name changes on unfocused containers.
- **Proposed change:** Either downgrade 9.4's second clause to a manual QA item outside the
  plan, or add to Feature 9's acceptance criteria: "The live region stays on the visible count
  element. Whether nesting it inside the `aria-labelledby` target double-announces is a
  screen-reader QA question, not an automated check; if a real AT pass shows double
  announcement, move it to a visually-hidden sibling."
