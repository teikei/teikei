# map-next Code Review Findings

Architecture/code-quality review of `packages/map-next`: modularization, repetition, Svelte reactisms, and overengineering. Findings are prioritized by risk/value; check items off as they're addressed.

## P0 — Bugs / correctness

- [x] **Stale-promise race in cluster rendering** — `src/lib/components/domain/map/SymbolMarkerCluster.svelte:20-45`. `clusterFeaturesPromise` is a `$derived.by(async () => ...)` synced into `$state` via a separate `$effect`, with no guard against an older promise resolving after a newer one and overwriting fresher data. Also missing a `.catch`, risking an unhandled rejection.
- [x] **Untyped auth error breaks sign-in redirect** — `src/lib/api/client.ts:74-76` throws a plain `Error('Authentication required')` instead of a typed `ApiError`. Callers using `load-error.ts`'s `ApiError`-based branching (`error.status === 401`) can't distinguish this from a generic failure, so a missing-auth case silently becomes a generic load error instead of redirecting to sign-in.

## P1 — High-value duplication to consolidate

- [x] **FarmIdentitySection vs InitiativeIdentitySection** (`src/lib/components/domain/farms/sections/FarmIdentitySection.svelte` vs `.../initiatives/sections/InitiativeIdentitySection.svelte`, 67 lines each) — ~97% identical; differ only in properties type and the `markerType` literal. Collapse into one generic component parameterized by entity type. Consolidated into `src/lib/components/domain/entries/sections/IdentitySection.svelte`, parameterized by `markerType: MainEntryType`.
- [x] **FarmDescriptionSection vs InitiativeDescriptionSection** (36 lines each) — byte-for-byte identical apart from the properties type import. Consolidated into `src/lib/components/domain/entries/sections/DescriptionSection.svelte`.
- [x] **FarmBadgesSection vs InitiativeBadgesSection** (72 lines each) — identical apart from `idPrefix` default and properties type (`idPrefix` is already a prop). Consolidated into `src/lib/components/domain/entries/sections/BadgesSection.svelte`, with `idPrefix` now a required prop passed explicitly at each call site (`farm-badge`/`initiative-badge`).
- [ ] **FarmProfile.svelte vs InitiativeProfile.svelte** (318 vs 270 lines) — near line-for-line identical guard/save/cancel/header/footer scaffolding (~150 lines). Consider a shared `MainEntryProfile` shell parameterized by section list, mutation functions, and a header-extras snippet. Deferred (not done in the section-consolidation pass): riskier than the leaf sections — Farm has depot/membership/founded-line/membership-chip extras Initiative doesn't, so the shell needs a real extension-point design (header-extras snippet, per-entity section list, per-entity mutation functions), not a mechanical merge.
- [ ] **EntriesList vs MyEntriesList** — duplicate skeleton-row and empty-state markup that should share a snippet. Deferred: needs a shared skeleton/empty-state snippet extracted without disturbing `MyEntriesList`'s additional farm/depot grouping logic.
- [ ] **EntryContactForm.svelte:17-70** hand-rolls its own state/regex email validation instead of reusing `superForm`/zod like every other form in the app — align with the shared pattern. Deferred: requires introducing a zod schema for the contact form and swapping its state management, not just a markup/prop refactor.

## P2 — Layering fixes

- [x] **route-compat.ts → api layering inversion** — `src/lib/utils/route-compat.ts:1` imports and calls `getAssociatedFarmIdForDepot` from `$lib/api/entry-details`, inverting the intended `api → utils` direction. Move this routing logic out of `utils` (e.g. co-locate with `routes.ts`) or invert the dependency. Fixed by moving `route-compat.ts`/`route-compat.spec.ts` out of `utils/` entirely, to `src/routes/[...legacy]/` — it has exactly one consumer (`[...legacy]/+page.ts`), matching the existing codebase convention of route-local helpers (e.g. `src/routes/users/*/schema.ts`). No more utils→api crossing.
- [x] **`ApiError` imported into utils** — `src/lib/utils/load-error.ts:3` imports `ApiError` from `$lib/api/client` to branch on HTTP status. Consider moving the shared error type to `src/lib/types/` so both api and utils can depend on it without a directional crossing. Fixed: moved the `ApiError` class to `src/lib/types/errors.ts`; both `client.ts` and `load-error.ts` now import it from there.
- [x] **Triple-defined payload shape** — Farm/Initiative/Depot address fields are independently defined in three places: `entry-mutations.ts` interfaces, `editor-form.ts`'s `CommonAddressPayload`, and the zod schemas in `editor-schema.ts`. No single source of truth; easy to drift out of sync. Have `entry-mutations.ts` extend `CommonAddressPayload`. Fixed: `FarmMutationPayload`/`InitiativeMutationPayload`/`DepotMutationPayload` now `extends CommonAddressPayload` instead of redeclaring its fields. (The zod schema in `editor-schema.ts` remains separate by necessity — it validates form _string_ state, a different shape from the typed wire payload — but already funnels through the shared `mapCommonAddressPayload` mapper.)

## P3 — Cleanup (lower priority, opportunistic)

**Reactisms** (manually tracking a "previous value" in `$state` inside an `$effect` to detect a transition, instead of `$derived`):

- [ ] `src/routes/MapSidebar.svelte:121-131` — `wasAuthModalRoute`/`collapsedBeforeAuthModal` effect-driven transition detection.
- [ ] `src/lib/components/layout/SidebarShell.svelte:39-50` — `previousMode` effect-driven transition detection.
- [ ] `src/lib/components/domain/map/SearchCommand.svelte:55-60` — effect resets `dismissed` on every `searchValue` keystroke; a React-style dependency-array effect translated literally.
- [ ] Consider one shared "previous value" helper rather than three bespoke reimplementations of the same pattern.

**Domain component overengineering**

- [ ] `EntryCreationWizard.svelte` (272 lines) — 3-step wizard with per-step validation gating and a sticky footer that duplicates `EditorSaveBar.svelte` instead of reusing it. Consider a single scrollable form (like the edit-mode profiles) instead of the wizard, or at minimum reuse `EditorSaveBar`.

**Map.svelte / MapSidebar.svelte structure** (both mix several concerns; logic itself is sound, extraction would improve testability):

- [ ] `Map.svelte` — extract camera-controller orchestration (257-365), pre-detail camera snapshot/restore (223-255), viewport-filtered-entries sync (438-514), network fit-bounds (148-188), and keyboard shortcuts (544-567) into separate modules, following the existing `map-focus.ts`/`entries-viewport.ts` extraction pattern.
- [ ] `MapSidebar.svelte` — extract route→view-mode derivation (103-267) into a pure function; consolidate the three near-identical delete-flow implementations (389-421, 423-492, 515-544) into a shared helper.

**api/utils cleanup**

- [ ] Two near-identical translation lookups: `translate-error.ts`'s `translateError` and `translations.ts`'s `translateFromMap` do the same job separately; `translate-error.ts` uses an unsafe `as` cast where `translations.ts` is type-safe. Merge into one.
- [ ] Route-to-resource mapping duplicated 3x: `routes.ts` (`mainEntryDetail`, `entryDetail`) and `main-entries.ts` (`mainEntryTypeToResource`) each independently encode the same Farm/Initiative/Depot → resource-path mapping.
- [ ] Dead code: `isEmbedded()` in `src/lib/utils/portal.ts:45` has zero call sites anywhere in the tree. Remove it (and `getShadowRoot` if it becomes unused too).
- [ ] `src/lib/config/app-configuration.ts` hardcodes country center/zoom (DE/CH/AT + CH-de/CH-fr variants) inline instead of table-driven like `regions.ts`'s `REGION_CATALOG`.
- [ ] Document (or unify) the inconsistent error-handling convention in `src/lib/api/*.ts`: most functions throw `ApiError`/`Error`, but `currentuser.ts:getCurrentUser` and `entry-details.ts:getAssociatedFarmIdForDepot` swallow errors and return `null` — defensible as best-effort lookups, but should be an explicit documented convention.

## Not flagged — verified as fine, don't change

- Class-based singleton stores (`network-selection.svelte.ts`, `hovered-entry.svelte.ts`, `auth.svelte.ts`, `confirm-dialog.svelte.ts`) — each bridges disjoint component subtrees or holds genuinely global state, with documented SPA/hash-router safety rationale.
- The many `$effect`s in `Map.svelte` driving MapLibre camera/listener side effects — legitimate imperative-boundary usage.
- `editor-guard.svelte.ts`, `editor-form.ts`, `client.ts`, `routes.ts`, `redirect.ts`'s allowlist guard — all well-built, centralized, and consistently reused.
- No legacy Svelte 4 patterns (`createEventDispatcher`, `export let`, `<slot>`) found anywhere in the domain/forms component layer — this codebase is otherwise clean, idiomatic Svelte 5.
