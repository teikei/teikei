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
