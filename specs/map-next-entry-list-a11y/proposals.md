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
