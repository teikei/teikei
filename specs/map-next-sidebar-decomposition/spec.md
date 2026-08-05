# Spec: MapSidebar Decomposition (map-next)

## Problem Statement

`packages/map-next/src/routes/MapSidebar.svelte` is 1012 lines — roughly 845 lines of
`<script>` and 173 lines of template. It is the single largest hand-written component in
the package and it owns, in one scope:

- hash-route parsing and the derived route kind,
- auth-modal collapse policy (save/restore the user's collapsed preference),
- the my-entries sign-in redirect,
- three separate ownership-id derivations over `myEntries.features`,
- region-filter label resolution and the all-regions sentinel value,
- debounced autocomplete search, its request-race guard, and suggestion selection,
- create / edit / delete for farms, initiatives and depots — including confirm dialogs,
  delete-pending re-entrancy flags, success/failure toasts and post-delete refresh ordering,
- depot mutations initiated from an open farm profile,
- list scroll capture and restore across the detail round-trip,
- the shell-mode / task-level / editor-mode view resolution,
- entry-click handling including the depot → associated-farm resolution and pan dedupe,
- and the whole route-driven `{#if}` template.

The practical cost: 18 pieces of `$state`, 8 `$effect` blocks and ~30 functions share one
scope, so any change requires reading the whole file to know what else reads a given flag.
The existing test file (`src/routes/MapSidebar.svelte.spec.ts`) has to mount the entire
component — with `$app/state`, `$app/navigation`, the auth store, the confirm dialog and
three API modules mocked — to assert on a single navigation call, because none of the logic
is reachable without rendering. Concerns that are conceptually independent (search
debouncing vs. delete confirmation vs. collapse policy) cannot be reasoned about or changed
in isolation.

This spec covers a **behaviour-preserving decomposition**: no user-visible change and no
template restructuring. The contract is that the existing unit spec and the e2e suite stay
green — unmodified — while the component shrinks to a wiring layer, with targeted new unit
specs pinning four invariants that nothing currently asserts.

## Features

Features 1–3 extract pure modules, 4 pushes state down into an existing component, and
5–9 extract stateful factories. They are independent of each other except where noted, and
each lands as its own commit (see "Delivery" under Technical Solution).

### 1. Owned-entry id derivation → `$lib/utils/entry-ownership.ts`

- Description: Replace the three near-identical `$derived.by` blocks
  (`ownedMainEntryIds`, `ownedDepotIds`, `ownedFarmIds`, MapSidebar lines 195–222) with a
  single pure function that walks `myEntries.features` once.
- Acceptance criteria:
  - New module exports `deriveOwnedEntryIds(features: EntryFeature[]): OwnedEntryIds` where
    `OwnedEntryIds = { mainEntries: ReadonlySet<string>; depots: ReadonlySet<string>; farms: ReadonlySet<string> }`.
  - The function is pure: no imports from `$app/*`, `$lib/stores/*` or `svelte/reactivity`.
  - MapSidebar holds one `const owned = $derived(deriveOwnedEntryIds(myEntries?.features ?? []))`
    and reads `owned.mainEntries` / `owned.depots` / `owned.farms`.
  - The sets are plain `Set`, not `SvelteSet`. Nothing mutates them after construction —
    the `$derived` rebuilds them wholesale when `myEntries` changes, so per-element
    reactivity is not needed — and every consumer (`FarmProfile`,
    `FarmDepotsSection`) already types the prop as `ReadonlySet<string>`.
  - `npm run check` passes with no `as` casts introduced at the call sites.

### 2. Route → view-mode resolution → `$lib/utils/sidebar-view.ts`

- Description: Extract the block of view-mode derivations (MapSidebar lines 146–194 and
  251–253) into one pure resolver, so "which of the seven template branches is active" is a
  single testable function instead of 15 interdependent `$derived`s.
- Acceptance criteria:
  - New module exports `resolveSidebarView(input): SidebarView`, where `input` carries
    `page.data` (`detailData`, `contactData`, `editorData`, `depotDetailData`,
    `depotEditorData`, `loadError`) and the navigation target route id, and `SidebarView`
    carries `showDetail`, `showContact`, `showEditor`, `showDepotEditor`, `isNonListMode`,
    `isEditorMode`, `isTaskLevel`, `isFarmEditor`, `isFarmDetail`, `isInitiativeEditor`,
    `isInitiativeDetail`, `isNavigatingToDataRoute`, `shellMode` and `focusedEntry`.
  - `DATA_ROUTE_IDS` moves into this module as a module-level constant.
  - The function is pure: it takes route data as arguments and imports nothing from
    `$app/*`. MapSidebar supplies `page.data` and `navigating.to?.route.id`.
  - The comments explaining _why_ each rule exists (task levels are focused tasks; a failed
    load counts as `'detail'` so the shell expands; profile inline edit reuses the section
    form) travel with the code into the new module.
  - MapSidebar keeps a single `const view = $derived(resolveSidebarView(...))` and the
    template reads `view.showDetail` etc.
  - **New spec** `src/lib/utils/sidebar-view.spec.ts` asserts the branch table: for each of
    the seven template branches (depot editor, farm editor, initiative editor, contact,
    farm detail, initiative detail, list) the resolver returns the expected flag
    combination and `shellMode`. Plus: a `loadError` with no detail data still yields
    `shellMode === 'detail'`; a navigation target in `DATA_ROUTE_IDS` yields
    `isNavigatingToDataRoute`, one outside it does not; `focusedEntry` prefers
    `detailData` over `contactData`.

### 3. Depot mutation feedback → `$lib/utils/depot-feedback.ts`

- Description: `showDepotMutationToast` and `getFirstAssociatedFarmId` (MapSidebar lines
  329–355) are needed by both the delete flow (Feature 8) and the depot-editor-saved
  handler, so they get their own small module rather than being exported off either.
- Acceptance criteria:
  - New module exports `getFirstAssociatedFarmId(depot: DepotFeature): string | null` and
    `showDepotMutationToast(action: 'created' | 'updated' | 'deleted', farmId: string | null)`.
  - The "view associated farm" toast action still navigates to
    `routeBuilders.farm.detail(farmId)` and is omitted when `farmId` is `null`.
  - The three message keys (`editor_depot_saved_created` / `_updated` / `_deleted`) are
    unchanged.
  - Both `$lib/utils/entry-actions.ts` (Feature 8) and MapSidebar's
    `handleDepotEditorSaved` import from this module; neither re-implements it.

### 4. Region-filter labels pushed into `RegionFilters.svelte`

- Description: `ALL_REGIONS_VALUE`, `selectedCountryLabel`, `selectedStateLabel`,
  `stateSelectValue` and `handleStateSelect`'s sentinel mapping (MapSidebar lines 42,
  223–238, 837–843) are display concerns of the region filter itself. Moving them down
  _removes_ props instead of adding them.
- Acceptance criteria:
  - `RegionFilters.svelte` takes `selectedState: string | null` and derives
    `stateSelectValue`, `selectedCountryLabel` and `selectedStateLabel` internally from
    `countryOptions` / `stateOptions` / `selectedCountry` / `selectedState`.
  - `ALL_REGIONS_VALUE` becomes a module constant of `RegionFilters.svelte`; the
    `allRegionsValue` prop is removed from both `RegionFilters.svelte` and
    `MapSidebarHeader.svelte`.
  - `RegionFilters` maps the sentinel back to `null` before calling `onStateSelect`, whose
    signature becomes `(stateCode: string | null) => void`, so MapSidebar forwards
    `onStateChange` directly with no adapter.
  - The `stateSelectValue`, `selectedCountryLabel` and `selectedStateLabel` props are
    removed from `MapSidebarHeader.svelte` and from MapSidebar's call site, and
    `MapSidebarHeader`'s own `onStateSelect` prop type widens to
    `(stateCode: string | null) => void` to match.
  - `RegionFilters.stories.svelte` is updated: all three stories currently pass
    `stateSelectValue`, `selectedCountryLabel`, `selectedStateLabel` and `allRegionsValue`
    (lines 41–44, 57–60, 73–76) and must switch to `selectedState`. Storybook still builds
    (`npm run build-storybook`) and the three stories render the same labels as today:
    "Germany"/"Brandenburg", "Germany"/all-regions, "Switzerland"/all-regions.
  - Empty-`stateOptions` and no-selection fallbacks are unchanged: `stateOptions.length === 0`
    → `m.map_sidebar_no_regions_available()`, no `selectedState` →
    `m.map_sidebar_all_regions()`, unknown code → the raw code; unknown country →
    `m.map_sidebar_country_label()`.
  - `e2e/region-browsing.test.ts` passes unchanged.

### 5. Sidebar scope → `$lib/stores/sidebar-scope.svelte.ts`

- Description: Route-kind parsing, the my-entries scope predicate, and the "my-entries
  requires a signed-in user" redirect (MapSidebar lines 102–118, 132–144) form one concern:
  which scope the sidebar is in and what it takes to be allowed there.
- Acceptance criteria:
  - New module exports `createSidebarScope(): SidebarScope` exposing readonly
    `parsedRoute`, `routeKind`, `isMyEntriesScope`, `isUserAuthenticated`,
    `isAuthInitialized` and `isAuthModalRoute`.
  - The factory owns the redirect `$effect` and the `redirectingToSignInForMyEntries`
    latch, including the reset when the route leaves `myentries`, so an unauthenticated
    visit to `#/myentries` still issues exactly one
    `goto(routeBuilders.auth.signInWithRedirect(routeBuilders.myEntries()))`.
  - It reads `page.url.hash` and `authStore` directly (same pattern as
    `createMyEntriesStore`), and is documented as "must be called during component
    initialization".
  - MapSidebar no longer imports `parseHashRoute` / `isAuthRouteHash` / `authStore` for
    scope purposes; it reads `scope.parsedRoute.query.get('farm')` where it needs the depot
    return-farm id.

### 6. Collapse policy → `$lib/stores/sidebar-collapse.svelte.ts`

- Description: The collapsed flag plus the two policies that override it — auth-modal
  collapse with preference restore (lines 115–130) and the forbid-collapse rule for
  non-list modes (lines 259–267) — plus `effectiveCollapsed` (line 257).
- Acceptance criteria:
  - New module exports `createSidebarCollapse(sources): SidebarCollapse` where `sources`
    are getter thunks `{ isAuthModalRoute, isNonListMode, isTaskLevel, isMobile }` (the
    `EditorGuardSources` convention).
  - `SidebarCollapse` exposes `collapsed` (readable and writable), `effectiveCollapsed`,
    and `expand()` for `focusSearch`.
  - Behaviour is unchanged: entering an auth route saves the current value and collapses;
    leaving restores the saved value; a non-list mode force-expands unless the viewport is
    mobile and the level is not a task level.
  - `bind:collapsed` on `SidebarShell` and `MapSidebarHeader` is preserved via Svelte
    function bindings — `bind:collapsed={() => c.collapsed, (v) => (c.collapsed = v)}` —
    so the collapse toggle in the header still works.
  - `e2e/auth-overlay-responsive.test.ts`, `e2e/bottom-sheet.test.ts` and
    `e2e/responsive-shell-footer.test.ts` pass unchanged.

### 7. Search → `$lib/stores/sidebar-search.svelte.ts`

- Description: Search input state, debounced autocomplete loading with its stale-response
  guard, and suggestion selection (MapSidebar lines 85–90, 243–247, 313–319, 562–619,
  805–835).
- Acceptance criteria:
  - New module exports `createSidebarSearch(sources): SidebarSearch` with `sources`
    supplying `isMyEntriesScope`, `collapsed` and `isMobile` as getter thunks.
  - `SidebarSearch` exposes writable `value` and `inputEl`, readable `suggestions`,
    `isLoading`, `isFocused` and `showSuggestions`, and methods `handleFocus`,
    `handleBlur`, `selectSuggestion(suggestion)` and `focusInput()`.
  - `MIN_SEARCH_CHARS` (2) and `SEARCH_SUGGESTIONS_DEBOUNCE_MS` (300) move into the module.
  - The stale-response guard is preserved verbatim: `latestSearchRequestId` is bumped on
    every request, late responses and late errors are dropped, and `isLoading` is only
    cleared by the newest request. Dropping below `MIN_SEARCH_CHARS` sets the id to `-1`,
    clears suggestions and cancels the pending debounce.
  - The "enter the loading state up front" behaviour is preserved — during the 300 ms
    debounce window the panel shows the loading row, never a false empty state.
  - `selectSuggestion` still clears the query, cancels the debounce, calls
    `networkSelection.clear()`, and for a depot suggestion calls
    `networkSelection.selectDepot(id)` _before_ navigating.
  - `showSuggestions` keeps the mobile carve-out: `(!collapsed || isMobile)` and not
    my-entries scope and at least `MIN_SEARCH_CHARS` typed — deliberately not focus-gated,
    so a tap on a suggestion still lands after the input blurs.
  - `bind:searchValue` / `bind:searchInputEl` on `MapSidebarHeader` and `SlimSearchHeader`
    are preserved via function bindings.
  - `e2e/search-discovery.test.ts` and `e2e/network-visualization.test.ts` pass unchanged.
  - **New spec** `src/lib/stores/sidebar-search.svelte.spec.ts` pins the race guard, which
    nothing currently asserts: an out-of-order response from a superseded request does not
    overwrite `suggestions`; a rejection from a superseded request does not clear them and
    does not clear `isLoading`; typing below `MIN_SEARCH_CHARS` mid-flight discards the
    in-flight result; `isLoading` is `true` throughout the debounce window before any
    request is issued. Uses fake timers for the debounce.

### 8. Entry mutations → `$lib/utils/entry-actions.ts`

- Description: The create/edit/delete cluster — `stopRowActionEvent`, `handleCreateEntry`,
  `handleEditEntry`, `handleDeleteEntry`, `handleDeleteDepot`, `handleDeleteMainEntry`,
  `handleDepotDeleteFromProfile` (MapSidebar lines 324–327, 357–507, 530–560), ~200 lines.
- Acceptance criteria:
  - New module exports `createEntryActions(sources): EntryActions` with `sources`
    supplying `ownedFarmIds` as a getter thunk and `onRefreshMyEntries` as a callback.
  - The module is a **plain factory in `$lib/utils/`, not a rune store**: the two
    delete-pending flags are re-entrancy guards read only inside the handlers, never in the
    template, so they are ordinary closure `let`s and the file is `.ts`, not `.svelte.ts`.
    (This is the one place the "stateful → `$lib/stores/`" rule does not apply, and it
    matches the module name in the original request.)
  - `EntryActions` exposes `stopRowActionEvent`, `createEntry(type, event)`,
    `editEntry(feature, event)`, `deleteEntry(feature, event)` and
    `deleteDepotFromProfile(depot)`.
  - The depot-create guard is preserved: with zero owned farms, `createEntry('Depot', …)`
    shows `toastInfo(m.map_sidebar_depot_needs_farm())` and does not navigate.
  - The farm-delete depot warning is preserved: before confirming, `getMainEntry('farms', id)`
    is fetched, and if the farm has depots the confirm description is extended with
    `m.map_sidebar_delete_farm_confirm_depots_note()`. A failed fetch logs in dev and
    proceeds with the plain description.
  - The post-delete sequences are preserved **verbatim, including await order**, because
    they encode fixes for same-hash navigation:
    - depot from the list: `deleteDepot` → `goto(myEntries, {replaceState:true})` →
      `await onRefreshMyEntries?.()` → `showDepotMutationToast('deleted', farmId)`, where
      `farmId` is captured _before_ the delete.
    - farm/initiative: `deleteFarm|deleteInitiative` → `goto(myEntries, {replaceState:true})`
      → `await onRefreshMyEntries?.()` → `await invalidateAll()` → success toast.
    - depot from an open farm profile: `deleteDepot` → `await invalidateAll()` →
      `await onRefreshMyEntries?.()` → `toastSuccess(m.editor_depot_saved_deleted())`.
      No `goto` — the profile stays open.
  - All confirm-dialog copy, `confirmVariant: 'destructive'`, both re-entrancy guards, the
    `finally` flag resets, the dev-only `console.warn`s and the error toasts are unchanged.
  - The explanatory comments (FK cascade detaches depots but never deletes them;
    same-hash navigation won't retrigger the owned-entries refresh) travel with the code.
  - `e2e/farm-initiative-delete.test.ts`, `e2e/depot-crud.test.ts` and
    `e2e/depot-on-profile.test.ts` pass unchanged, as does the
    `my-entries depot delete action …` case in `MapSidebar.svelte.spec.ts`.
  - **New spec** `src/lib/utils/entry-actions.spec.ts` pins the await ordering, which
    nothing currently asserts and which encodes real bug fixes. With `goto`,
    `invalidateAll`, `onRefreshMyEntries`, the delete APIs and the toast module mocked,
    assert the recorded call order for all three delete paths exactly as listed above —
    in particular that `onRefreshMyEntries` is awaited _after_ `goto` (same-hash
    navigation does not retrigger the owned-entries refresh) and that the profile-scoped
    depot delete issues **no** `goto`. Also assert: a declined confirm performs no
    mutation; a second call while one is in flight is a no-op; a rejected delete leaves
    the pending flag cleared and fires the error toast; the depot-create guard fires
    `toastInfo` and does not navigate when there are no owned farms; and the farm-delete
    confirm description gains the depots note only when the fetched farm has depots.

### 9. Entry selection → `$lib/stores/entry-selection.svelte.ts`

- Description: Clicking an entry, resolving a depot to its associated farm, the pan-dedupe
  bookkeeping (`lastDetailId`), the detail-focus effect, and list scroll capture/restore
  (MapSidebar lines 95–100, 269–298, 321–322, 621–689).
- Acceptance criteria:
  - New module exports `createEntrySelection(sources): EntrySelection` with `sources`
    supplying `entries`, `isMyEntriesScope` and `focusedEntry` as getter thunks plus the
    `onEntryClick` callback.
  - `EntrySelection` exposes `handleEntryClick(feature, options?)`, writable `listScrollEl`,
    and `requestScrollRestore()` for the "back" path.
  - The interaction-race guard is preserved: `latestInteractionId` is bumped per click and
    a stale depot → farm resolution is discarded.
  - The depot branch is preserved: resolve the associated farm id, pan to the matching
    feature from `entries` if present, set `lastDetailId` to that farm id to suppress the
    duplicate pan when the detail route resolves, then `goto` the farm detail. A depot with
    no associated farm logs in dev and does nothing else.
  - In my-entries scope, clicking only pans (respecting `triggerPan !== false`) and never
    navigates.
  - The focus effect still pans exactly once per newly focused entry, treats
    `detailData ?? contactData` as the focus source so a contact deep link frames the map
    identically, and resets `lastDetailId` when nothing is focused.
  - List scroll behaviour is unchanged: `scrollTop` is captured at the start of every
    `handleEntryClick`, and re-applied only when a restore is pending _and_ the scroll
    element has remounted; "back" restores it, the X close does not.
  - `bind:ref` on `SidebarScrollArea` is preserved via a function binding.
  - `e2e/detail-profile-polish.test.ts`, `e2e/depot-interaction.test.ts` and
    `e2e/legacy-routes.test.ts` pass unchanged, as do the four `openDetailView` /
    row-click cases in `MapSidebar.svelte.spec.ts`.
  - **New spec** `src/lib/stores/entry-selection.svelte.spec.ts` pins the interaction-race
    guard, which nothing currently asserts: a slow depot → farm resolution that returns
    after a newer click is discarded (no pan, no `goto`); a depot whose associated farm is
    absent from `entries` still navigates to the farm detail route but pans nothing; a
    depot with no associated farm neither pans nor navigates; and `lastDetailId` set by
    the depot branch suppresses the duplicate pan when the detail route subsequently
    resolves to that same farm.

### 10. MapSidebar as a wiring layer

- Description: What remains after 1–9 — props, factory instantiation, the route-navigation
  handlers, the two exported imperative methods, and the unchanged template.
- Acceptance criteria:
  - `src/routes/MapSidebar.svelte` is **≤ 460 lines total**, of which the `<script>` block
    is **≤ 290 lines**.
  - Every new module is **≤ 160 lines**.
  - The thin `goto` handlers stay here and are **not** extracted: `handleCloseDetail`,
    `handleDetailBack`, `handleContactBack`, `handleEditFromDetail`, `handleEditorCancel`,
    `handleEditorSaved`, `getDepotReturnFarmId`, `handleDepotEditorCancel`,
    `handleDepotEditorSaved`, `handleDepotSelectFromProfile`, `handleDepotEditFromProfile`,
    `handleAddDepotFromProfile`, `handleOpenAllEntriesScope`, `handleOpenMyEntriesScope`.
    Each is a one-or-two-line route-context delegation; routing them through a resolver
    module would add a hop without removing a call site. Their `replaceState: true` usage
    is unchanged — contact-back and editor cancel/save must not stack history entries.
  - The template (the `detailSearchHeader` snippet and the `{#if}` chain inside
    `SidebarShell`) is structurally unchanged: same branches, same order, same `{#key}`
    expressions, same `data-testid`s. Only the identifiers it reads change.
  - `MapSidebarProps` is unchanged, so `Map.svelte`'s call site needs no edit.
  - `export function openDetailView(feature)` and `export function focusSearch()` remain
    exported from `MapSidebar.svelte` with identical behaviour (Map.svelte calls both via
    `bind:this`). `focusSearch` still no-ops on task levels and in my-entries scope, still
    expands the sidebar, and still focuses on the next animation frame.
  - The cross-cutting effect that redirects an owner away from a contact deep link
    (lines 289–293) stays in MapSidebar — it spans ownership and navigation and is 5 lines.

## Technical Solution

- **Architecture.** MapSidebar becomes a wiring layer: it instantiates a small number of
  factories during component initialization, passes reactive inputs down as getter thunks,
  and renders the same template against the returned objects.

- **Module placement rule.** Pure, state-free helpers go in `$lib/utils/`; factories that
  own `$state` read by the template or register `$effect`s go in `$lib/stores/` as
  `.svelte.ts`. The one deliberate exception is Feature 8 (`$lib/utils/entry-actions.ts`),
  whose only state is non-reactive re-entrancy flags.

- **What deliberately stays in MapSidebar.** Thin `goto` handlers are not extracted
  (Feature 10). A resolver module would turn `void goto(routeBuilders.farm.edit(id))` into
  `void goto(resolveEditFromDetailTarget(detailData))` — the call site remains either way,
  so the net line saving is near zero and the reader gains a hop. Route-context glue is
  what a wiring layer is for. This is why the budget is 460 lines rather than 400.

- **Reactive inputs.** Factories receive reactive dependencies as getter thunks
  (`{ isMobile: () => isMobile.current }`), following `EditorGuardSources` in
  `$lib/utils/editor-guard.svelte.ts`. They never receive snapshots.

- **Effect ownership.** Factories that register `$effect` must be called during component
  initialization, matching `createEditorGuard` and `createMyEntriesStore`. They carry that
  constraint in their doc comment.

- **Two-way bindings across the factory boundary.** `collapsed`, `searchValue`,
  `searchInputEl` and the scroll-area `ref` are `bind:`-ed in the template but will live
  inside factories. Svelte 5 function bindings —
  `bind:collapsed={() => c.collapsed, (v) => (c.collapsed = v)}` — bridge this without
  changing any child component's props. The package is on `svelte ^5.55.9`, well past the
  5.9 introduction of function bindings.

- **Route-context coupling.** `sidebar-scope.svelte.ts` and `entry-selection.svelte.ts`
  import `$app/state` / `$app/navigation` directly (as `createMyEntriesStore` already
  does). The pure modules (Features 1–3) must not — they take route data as arguments.
  Because `MapSidebar.svelte.spec.ts` mocks `$app/state` and `$app/navigation` at module
  scope, extracted modules inherit those mocks transitively and the existing spec keeps
  working without edits.

- **Key decisions.**
  - _Script only, template untouched._ Extracting the seven-branch `{#if}` chain into a
    `SidebarRouteView.svelte` would forward ~25 props through a new seam, trading 173 lines
    of legible markup for prop drilling. The route-driven view switch is legitimately this
    component's job; the entanglement is all in the script.
  - _Push down before extracting._ Feature 4 moves display logic into the component that
    already owns the concern, which removes six props rather than adding a module.

- **Delivery.** One PR, **one commit per feature**, in the order 1 → 10. Each commit must
  leave the tree green on its own (`check`, `lint`, `test:unit`) so the history is
  bisectable; the full e2e suite runs once before the PR is opened and again after the
  final commit. Separate PRs per feature were considered and rejected: ten review cycles
  for a change with no user-visible effect is not a good trade, and per-commit granularity
  already buys the thing that matters — the ability to bisect a regression to one unit.
  A feature's new unit spec (where it has one) lands in that feature's commit, not a
  trailing test commit. Dependencies: Feature 3 must land before 8 (`entry-actions` imports
  `depot-feedback`), Feature 1 before 8 (`entry-actions` reads `owned.farms`), and 10 is by
  definition last. Everything else is order-independent.

- **Testing.** The existing `src/routes/MapSidebar.svelte.spec.ts` and the e2e suite stay
  green **unmodified**. If a test needs editing to pass, that is evidence of a behaviour
  change and the refactor is wrong, not the test — the only permitted exception is a mock
  path that must follow code to a new module, which must be called out explicitly in the
  PR description. No cases are migrated out of `MapSidebar.svelte.spec.ts`; it stays whole
  as the integration net for the duration of the refactor.

  Four new unit specs are added, chosen because each pins an invariant nothing currently
  asserts — not one per module:
  - `src/lib/utils/sidebar-view.spec.ts` — the seven-branch view table (Feature 2).
  - `src/lib/stores/sidebar-search.svelte.spec.ts` — the stale-response race guard (7).
  - `src/lib/utils/entry-actions.spec.ts` — the post-delete await ordering (8).
  - `src/lib/stores/entry-selection.svelte.spec.ts` — the interaction race guard (9).

  Test placement is decided by filename, not by directory: `vite.config.ts` routes
  `src/**/*.svelte.{test,spec}.{js,ts}` to the browser (`client`) project and everything
  else to the node (`server`) project. So `sidebar-view.spec.ts` and `entry-actions.spec.ts`
  run in node with `vi.mock`ed `$app/*`, while `sidebar-search.svelte.spec.ts` and
  `entry-selection.svelte.spec.ts` land in the browser project — which is what they need,
  since both factories use runes. Those two must create their subject inside an
  `$effect.root(...)` (a bare `$effect` outside a component throws `effect_orphan`) and
  flush with `flushSync` / `await tick()` before asserting. Note also that the vitest config
  sets `expect: { requireAssertions: true }`, so every case must assert.

  Deliberately **not** given specs: `entry-ownership` and `depot-feedback` (small enough to
  read, and their consumers are covered), the region push-down (pinned by
  `e2e/region-browsing.test.ts`), `sidebar-collapse` (pinned by the auth-overlay,
  bottom-sheet and responsive-shell e2e specs) and `sidebar-scope` (pinned by
  `e2e/my-entries-scope.test.ts`). Mechanical specs there would be padding.

  Note what these specs do **not** cover: cross-factory `$effect` ordering is a
  MapSidebar-level integration concern, invisible to any module-level unit test. Its
  mitigation is the per-commit verification and bisectable history, not these four files.

- **Verification.** From `packages/map-next`, with Node 24 active
  (`export NVM_DIR="$HOME/.nvm"; source "$NVM_DIR/nvm.sh"; nvm use 24`):
  1. `npx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide`
     (otherwise `check` reports ~55 phantom missing-module errors),
  2. `npm run check` — must report **0 errors** (the current baseline),
  3. `npm run lint`,
  4. `npm run test:unit -- --run`,
  5. `npm run test:e2e` — port 4173 is shared across Conductor workspaces, so confirm
     `lsof -nP -iTCP:4173 -sTCP:LISTEN` is empty first or run against a temporary
     per-workspace port; run map-heavy specs with `--workers=1`.

## Out of Scope

- Splitting the template into sub-components (`SidebarRouteView.svelte` or similar).
- Extracting the thin route-navigation handlers into a resolver module (see Feature 10).
- Any user-visible behaviour change, including copy, timing, toast text and route targets.
- New unit specs beyond the four listed under Testing, any new e2e tests, and any edit to
  existing tests beyond mock paths that must follow moved code.
- `src/routes/Map.svelte` (786 lines) — a separate decomposition candidate.
- Changes to `MapSidebarProps` or to `SidebarShell` / `SidebarScrollArea` / `SearchCommand`
  APIs.
- Renaming or restructuring existing modules (`$lib/utils/routes.ts`,
  `$lib/api/entry-mutations.ts`, `$lib/stores/network-selection.svelte.ts`).
- `packages/map` (the legacy map, being retired).
- Performance work — the derived-set consolidation in Feature 1 is a readability change
  that happens to do one pass instead of three, not an optimisation target.

## Additional Notes

- **Main risk: effect ordering.** Eight `$effect` blocks move into factories. Effects run in
  creation order, so the factories must be instantiated in the same relative order their
  effects appear today: scope (auth redirect) → collapse (auth-modal collapse, then
  forbid-collapse) → selection (detail focus, then scroll restore) → search (debounce
  trigger). The forbid-collapse effect in particular reads state the auth-modal effect
  writes in the same tick. This is the likeliest source of a silent regression, it is not
  covered by any existing assertion, and — importantly — it is **not** covered by the four
  new unit specs either, since it only manifests when the factories run together inside the
  component. If a collapse regression appears, suspect instantiation order first.
- **Residual risk after the delivery and testing revisions.** An earlier draft of this spec
  called for one sweeping commit and no new tests; both were revised, and the compounding
  risk they created is gone. What remains is the coverage that exists: 11 cases in
  `MapSidebar.svelte.spec.ts`, 21 e2e spec files (~10 exercising sidebar behaviour), the
  four new unit specs, and the verbatim-preservation criteria in Features 7, 8 and 9.
- **Line-count targets are budgets, not measurements.** The ≤ 460 / ≤ 290 / ≤ 160 figures
  come from summing the extracted regions against today's file; if a unit lands
  meaningfully over budget, that is a signal the split was wrong, not a reason to compress
  the code. The budget rose from 400 to 460 when Feature 3 (a navigation-resolver module)
  was dropped and its handlers were left in MapSidebar deliberately.
- Line numbers throughout this spec refer to `packages/map-next/src/routes/MapSidebar.svelte`
  as of commit `dfde8ec84`.
