# Proposals

Triage inbox for spec/plan change proposals. `implement` appends, the human triages by
flipping `[open]` to `[applied]` or `[rejected]` (or deleting the entry).

_Entries below were migrated from PR descriptions, which is where proposals were recorded
before `proposals.md` existed. The **Source** line points at the originating PR._

## [open] 4 — Wizard × Feature 4 interaction: the interim heading fix is throwaway

- **Source:** PR #867
- **Gap:** The still-live creation wizard shares the section components that now carry
  Feature 4's canonical headings, so the two heading systems stack. The spec does not
  acknowledge this overlap between Feature 4 and Feature 9.
- **Handled:** Interim fix — the wizard step title renders only on the identity step.
- **Proposed change:** Add a note to `spec.md` under Feature 9: "Until the wizard is
  removed, its step-title heading duplicates the canonical section headings introduced by
  Feature 4; the interim fix is throwaway."

## [open] 4 — Badges heading mislabels certification-only entries

- **Source:** PR #867 (review finding, skipped by decision)
- **Gap:** Feature 4's "one term per section" rule chose "Verbände und Netzwerke", which
  mislabels entries whose badges are all certifications.
- **Handled:** Left as-is — the PR is conformant with the spec as written; flagged rather
  than silently diverging.
- **Proposed change:** If revisited, add the criterion: "An entry whose badges are all
  certifications is headed appropriately (e.g. 'Zertifizierungen' as the sole heading)."

## [open] 11.3 — Runtime verification of shadow-DOM + standalone portal modes is unrunnable here

- **Source:** PR #869
- **Gap:** Task 11.3 requires runtime verification in both embedded shadow-DOM and
  standalone modes, but that workspace could not run the app (`@sveltejs/kit`/`vite`/
  `svelte-kit` absent, Node v26 breaks the svelte toolchain).
- **Handled:** Task 11.3 left unchecked and Feature 11 left `[~]` in progress rather than
  claiming unverified completion. Code reviewed clean at high effort: the `to`-prop
  precedence preserves any caller-supplied target and `to={undefined}` is equivalent to
  omitting it, so standalone `document.body` portaling is unchanged.
- **Proposed change:** Verify in a full environment with `npm run dev` plus the embed demo —
  confirm select/dropdown content lands in `#teikei-portal-container` in the shadow root and
  that the "Solawi seit (Jahr)" select opens anchored with internal scroll, then re-check
  standalone mode. Then close 11.3 and Feature 11.

## [applied] 12.6 — Map-focus offset hardcodes the 500px sidebar width

- **Source:** PR #871 (approved in-session, folded into Feature 12)
- **Gap:** `currentFocusOffset()` in `routes/Map.svelte` hardcodes the 500px
  `MAP_SIDEBAR_WIDTH_PX`, so with Feature 10's new 680px editor a point centered while the
  editor is open sits left-of-center in the reduced pane (the marker stays visible — low
  severity). No plan task covered this.
- **Handled:** Not fixed inside PR #871; instead folded into Feature 12's polish sweep as a
  new task rather than widening that PR's scope.
- **Proposed change:** Add task 12.6 to `plan.md` — make the offset mode-aware via
  `getSidebarFocusOffset`'s existing `sidebarWidth` param. _(Applied: task 12.6 exists in
  `plan.md` and is complete.)_
