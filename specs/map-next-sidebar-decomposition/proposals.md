# Proposals: MapSidebar Decomposition (map-next)

Open entries are proposals raised while implementing; only a human flips them to
`[applied]` / `[rejected]`.

## [open] 1.3 — `deriveOwnedEntryIds` cannot take `EntryFeature[]`

- **Gap:** Feature 1's acceptance criteria specify
  `deriveOwnedEntryIds(features: EntryFeature[])` while also requiring "no `as` casts
  introduced at the call sites". Those two are mutually exclusive. The call site passes
  `myEntries?.features`, whose element type is `Feature<Point, EntryProperties>` — a single
  object type with a union-typed `properties`. TypeScript does not decompose that into the
  `FarmFeature | DepotFeature | InitiativeFeature` union, because the `type` discriminant
  sits one level down inside `properties` rather than on the feature itself. `svelte-check`
  rejects the call: _"Type 'EntryProperties' is not assignable to type
  'InitiativeProperties'"_. The same mismatch is why `$lib/utils/entry-features.ts`
  already exists, casting with `as` behind a runtime guard.
- **Handled:** The parameter is typed `EntryFeatureCollection['features']` — exactly what
  the call site holds. The function body is unaffected (`properties.type` still narrows the
  union), the return type is unchanged, and `npm run check` reports 0 errors with no cast
  anywhere.
- **Proposed change:** In spec.md Feature 1, change the first acceptance criterion to read
  `deriveOwnedEntryIds(features: EntryFeatureCollection['features']): OwnedEntryIds`.
  Features 8 and 9 pass owned ids around as `ReadonlySet<string>` and are unaffected, but
  if any later feature re-states an `EntryFeature[]` signature for a helper fed from a
  feature collection, it needs the same correction.

## [open] 2.1 — `depotDetailData` is not an input of `resolveSidebarView`

- **Gap:** Feature 2's acceptance criteria list `depotDetailData` among the `page.data`
  fields the resolver input carries. No view-mode derivation reads it: `depotDetailData`
  appears only in the template, as the `{#key}` discriminant and the `entry` prop of
  `DepotEditor`. Declaring it on `SidebarViewInput` would add a field the function never
  reads.
- **Handled:** `SidebarViewInput` carries `detailData`, `contactData`, `editorData`,
  `depotEditorData`, `loadError` and `navigatingToRouteId`. `depotDetailData` stays a plain
  `$derived` in MapSidebar, as the template needs it there regardless.
- **Proposed change:** In spec.md Feature 2, drop `depotDetailData` from the parenthesised
  list of `page.data` fields in the first acceptance criterion, leaving `detailData`,
  `contactData`, `editorData`, `depotEditorData`, `loadError`.

## [open] 4.2 — a direct `onStateChange` forward requires an optional `onStateSelect`

- **Gap:** Feature 4 asks for `onStateSelect: (stateCode: string | null) => void` and, in the
  same criterion, for MapSidebar to forward `onStateChange` "directly with no adapter".
  `MapSidebarProps.onStateChange` is optional (`onStateChange?:`) and Feature 10 requires
  `MapSidebarProps` to stay unchanged, so `onStateSelect={onStateChange}` against a
  _required_ prop is a type error: `((stateCode: string | null) => void) | undefined` is not
  assignable to `(stateCode: string | null) => void`.
- **Handled:** `onStateSelect` is declared `onStateSelect?: (stateCode: string | null) => void`
  on both `RegionFilters.svelte` and `MapSidebarHeader.svelte`, and `RegionFilters` calls it
  as `onStateSelect?.(…)` — which costs one `?` because the sentinel-to-`null` mapping is an
  inline arrow anyway. MapSidebar passes `onStateSelect={onStateChange}` with no adapter.
  Note the asymmetry this leaves: `onCountrySelect` stays required and keeps its
  `handleCountrySelect` wrapper, because Feature 4 does not touch the country path.
- **Proposed change:** In spec.md Feature 4, third acceptance criterion, change the signature
  to `onStateSelect?: (stateCode: string | null) => void` (optional) and note that the
  optionality is what makes the adapter-free forward typecheck. Optionally also fold
  `handleCountrySelect` into the same treatment so the two selects stay symmetric — that is a
  scope increase, not a correction, so it is left undone.

## [open] 4.5 — the "Region Disabled" story can no longer render "All regions"

- **Gap:** Feature 4 requires the three stories to "render the same labels as today:
  Germany/Brandenburg, Germany/all-regions, Switzerland/all-regions". The third story passes
  `stateOptions={[]}`, and the fallback order the same criterion pins says
  `stateOptions.length === 0` → `m.map_sidebar_no_regions_available()` _before_ the
  no-selection check. Today the story only shows "All regions" because it hardcoded
  `selectedStateLabel`, a value MapSidebar would never have produced for an empty option
  list. Once the label is derived inside the component, the two criteria contradict.
- **Handled:** The story keeps `stateOptions={[]}` / `selectedCountry="CH"` /
  `selectedState={null}` and now renders "No regions available" — which is what the real
  sidebar shows for a country with no regions, and what the story's own name ("Region
  Disabled") describes. Stories 1 and 2 render "Germany"/"Brandenburg" and
  "Germany"/"All regions" as specified. `npm run build-storybook` succeeds.
- **Proposed change:** In spec.md Feature 4, fifth acceptance criterion, change the expected
  third-story labels from "Switzerland"/all-regions to "Switzerland"/no-regions-available.

## [open] 5.3 — the scope-first ordering rationale is factually wrong

- **Gap:** Plan task 5.3 justifies instantiating scope first with "(its redirect effect runs
  before every other moved effect today)". It does not: today the auth-modal collapse effect
  (MapSidebar line 121) is registered _before_ the my-entries redirect (line 133). Putting
  scope first therefore swaps those two, and the swap is live from this commit until
  Feature 6 moves collapse into a store instantiated after scope. The spec's own
  "Additional Notes" call effect ordering the main risk of this refactor, so a wrong
  rationale there is worth correcting rather than carrying forward.
- **Handled:** Instantiated scope first as the plan directs — the resulting order matches the
  end state the spec specifies (scope → collapse → selection → search). The swap is benign:
  the two effects share no state (`collapsed` / `wasAuthModalRoute` vs. the redirect latch)
  and `goto` is async, so neither can observe the other's write within a flush. Verified by
  a throwaway Playwright run (not committed): an unauthenticated `#/myentries` visit still
  issues exactly one `goto` to `#/users/sign-in?redirect=%23%2Fmyentries`.
- **Proposed change:** In plan.md task 5.3, replace the parenthetical with "(the spec's
  target order is scope → collapse → selection → search; this swaps it ahead of the
  auth-modal collapse effect, which is safe because the two share no state)".

## [open] 5.4 — no test covers the my-entries sign-in redirect

- **Gap:** spec.md's Testing section lists `sidebar-scope` under "deliberately not given
  specs" because it is "pinned by `e2e/my-entries-scope.test.ts`". That file's five cases all
  run with a signed-in user; nothing anywhere — unit or e2e — exercises the unauthenticated
  `#/myentries` → sign-in redirect or the single-fire latch, which is the only behaviour the
  factory owns beyond plain derivations. So the one acceptance criterion with real logic
  behind it is protected by review alone.
- **Handled:** Verified manually with a throwaway Playwright test (mocking `/entries` and a
  401 `/authentication`, then asserting the resulting URL and the navigation list); it passes
  on this commit. The file was deleted rather than committed, since spec.md's Out of Scope
  forbids new e2e tests.
- **Proposed change:** Either add a case to `e2e/my-entries-scope.test.ts` asserting that an
  unauthenticated `#/myentries` visit lands on
  `#/users/sign-in?redirect=%23%2Fmyentries` exactly once (which needs the "no new e2e tests"
  line in Out of Scope relaxed for this one case), or amend the Testing section to say
  sidebar-scope is deliberately unpinned and state the residual risk.

## [open] 7.1 — `sidebar-search.svelte.ts` lands at 181 lines, over the ≤ 160 module budget

- **Gap:** Feature 10 sets a ≤ 160-line budget for every new module. `sidebar-search.svelte.ts`
  is 181. The budget was derived by "summing the extracted regions against today's file", which
  counts only the moved code — it does not account for the getter/setter facade the acceptance
  criteria themselves require. Feature 7 asks for two writable properties (`value`, `inputEl`),
  four readable ones and four methods; expressed as an object literal that is ~55 lines, plus a
  17-line `SidebarSearch` interface, none of which existed in MapSidebar. The moved logic is
  ~116 lines (MapSidebar shrank 861 → 745), so the overshoot is entirely structural. The five
  other extracted modules are all well under (29 / 33 / 71 / 73 / 97) because their surfaces are
  narrower; search is the widest by some margin.
- **Handled:** Left at 181 lines. spec.md's own note says an over-budget unit is "a signal the
  split was wrong, not a reason to compress the code", and the split here is exactly the one the
  spec prescribes — the alternative would be deleting the verbatim-preservation comments or
  collapsing the facade, both of which other criteria forbid.
- **Proposed change:** In spec.md Feature 10, second acceptance criterion, change "Every new
  module is **≤ 160 lines**" to "**≤ 160 lines**, except `$lib/stores/sidebar-search.svelte.ts`
  at **≤ 190**, whose wider read/write surface costs ~70 lines of interface and accessor
  boilerplate that the budget did not model." Plan task 10.3 needs the same figure.

## [open] 8.1 — `entry-actions.ts` lands at 223 lines, over the ≤ 160 module budget

- **Gap:** Feature 10 sets a ≤ 160-line budget for every new module, but Feature 8's own
  description already calls its cluster "~200 lines" of moved code. Both cannot hold. The
  measurement bears out the description: MapSidebar shrank 745 → 556, so 189 lines moved
  across, and the module adds ~10 lines of imports, a 12-line `EntryActions` /
  `EntryActionsSources` interface pair and the factory wrapper on top — 223 in total.
  Unlike Feature 7 the overshoot is not facade boilerplate: the surface is five plain
  methods, and the bulk is the two delete flows with their confirm dialogs, guards,
  `finally` resets and the FK-cascade / same-hash-navigation comments that other criteria
  require verbatim.
- **Handled:** Left at 223 lines. spec.md's note says an over-budget unit is "a signal the
  split was wrong, not a reason to compress the code"; the only way under 160 would be to
  split the delete flows into a second module or drop the preserved comments, and the
  criteria in Feature 8 forbid both. The split itself is the one the spec prescribes.
- **Proposed change:** In spec.md Feature 10, second acceptance criterion, fold this into
  the same exception list as 7.1: "**≤ 160 lines**, except `sidebar-search.svelte.ts`
  (**≤ 190**) and `entry-actions.ts` (**≤ 230**), whose extracted regions the budget
  under-counted." Plan task 10.3 needs the same figures. Alternatively, restate the budget
  per Feature — Feature 8's "~200 lines" figure was right all along and 10.3's flat 160 is
  the number that never fitted it.
