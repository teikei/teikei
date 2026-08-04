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
