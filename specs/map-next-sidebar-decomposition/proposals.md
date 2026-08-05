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
