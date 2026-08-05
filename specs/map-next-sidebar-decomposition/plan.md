# Implementation Plan: MapSidebar Decomposition (map-next)

Spec: specs/map-next-sidebar-decomposition/spec.md

Status legend: [ ] todo · [~] in progress · [x] done

All paths are relative to `packages/map-next`. Each feature is one commit that must leave
the tree green on `npm run check`, `npm run lint` and `npm run test:unit -- --run` on its
own — extract, rewire and verify all land together. The full e2e suite runs once at the
baseline (1.1) and once at the end (10.6).

**Factory instantiation order is load-bearing.** Effects run in creation order, so
MapSidebar must instantiate scope (5) → collapse (6) → selection (9) → search (7). The
feature commits land in numeric order, but each rewire task must insert its factory at the
right position in that sequence, not simply append it.

- [x] 1. Owned-entry id derivation → `$lib/utils/entry-ownership.ts` (depends on: none)
  - [x] 1.1 Establish the green baseline before touching anything: activate Node 24
        (`export NVM_DIR="$HOME/.nvm"; source "$NVM_DIR/nvm.sh"; nvm use 24`), run
        `npx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide`,
        then record results for `npm run check` (expect 0 errors), `npm run lint`,
        `npm run test:unit -- --run` and `npm run test:e2e`. Confirm port 4173 is free
        (`lsof -nP -iTCP:4173 -sTCP:LISTEN`) or use a per-workspace port; run map-heavy
        specs with `--workers=1`. Any pre-existing failure is noted now, not blamed on the
        refactor later.
  - [x] 1.2 Take a copy of today's `src/routes/MapSidebar.svelte` outside the repo (e.g.
        `.context/MapSidebar.before.svelte`) for the template diff in task 10.4.
  - [x] 1.3 Create `src/lib/utils/entry-ownership.ts` exporting `OwnedEntryIds`
        (`mainEntries` / `depots` / `farms`, all `ReadonlySet<string>`) and
        `deriveOwnedEntryIds(features)`, walking the feature list once and building plain
        `Set`s. No imports from `$app/*`, `$lib/stores/*` or `svelte/reactivity`.
  - [x] 1.4 Replace the three `$derived.by` blocks in MapSidebar (lines 195–222) with a
        single `const owned = $derived(deriveOwnedEntryIds(myEntries?.features ?? []))`.
  - [x] 1.5 Repoint every read site: `ownedMainEntryIds` → `owned.mainEntries` (lines 290,
        893, 910, 940), `ownedDepotIds` → `owned.depots` (894, 941), `ownedFarmIds` →
        `owned.farms` (370). Drop the now-unused `SvelteSet` import.
  - [x] 1.6 Verify (`check`, `lint`, `test:unit`) with no `as` casts introduced; commit.

- [x] 2. Route → view-mode resolution → `$lib/utils/sidebar-view.ts` (depends on: none)
  - [x] 2.1 Create `src/lib/utils/sidebar-view.ts` with the input and `SidebarView` types,
        `DATA_ROUTE_IDS` as a module constant, and a pure `resolveSidebarView(input)`
        returning `showDetail`, `showContact`, `showEditor`, `showDepotEditor`,
        `isNonListMode`, `isEditorMode`, `isTaskLevel`, `isFarmEditor`, `isFarmDetail`,
        `isInitiativeEditor`, `isInitiativeDetail`, `isNavigatingToDataRoute`, `shellMode`
        and `focusedEntry`. It imports nothing from `$app/*`.
  - [x] 2.2 Carry the explanatory comments across verbatim: task levels are focused tasks;
        a failed load counts as `'detail'` so the shell expands; profile inline edit reuses
        the section form for read/edit/create.
  - [x] 2.3 Rewire MapSidebar to a single `const view = $derived(resolveSidebarView(...))`
        fed from `page.data` and `navigating.to?.route.id`; repoint every script and
        template read (`showDetail` → `view.showDetail`, etc.).
  - [x] 2.4 Write `src/lib/utils/sidebar-view.spec.ts` (node project — plain `.spec.ts`):
        assert the flag combination and `shellMode` for each of the seven template branches
        (depot editor, farm editor, initiative editor, contact, farm detail, initiative
        detail, list); a `loadError` with no detail data still yields
        `shellMode === 'detail'`; a route id inside `DATA_ROUTE_IDS` sets
        `isNavigatingToDataRoute` and one outside it does not; `focusedEntry` prefers
        `detailData` over `contactData`.
  - [x] 2.5 Verify; commit.

- [x] 3. Depot mutation feedback → `$lib/utils/depot-feedback.ts` (depends on: none)
  - [x] 3.1 Create `src/lib/utils/depot-feedback.ts` exporting
        `getFirstAssociatedFarmId(depot)` and `showDepotMutationToast(action, farmId)`,
        keeping the three message keys and omitting the "view associated farm" toast action
        when `farmId` is `null`.
  - [x] 3.2 Delete both functions from MapSidebar (lines 329–355) and import them instead;
        `handleDepotEditorSaved` and the depot delete paths both use the module.
  - [x] 3.3 Verify; commit.

- [x] 4. Region-filter labels pushed into `RegionFilters.svelte` (depends on: none)
  - [x] 4.1 In `src/lib/components/domain/map/RegionFilters.svelte`: replace the
        `stateSelectValue` / `selectedCountryLabel` / `selectedStateLabel` /
        `allRegionsValue` props with `selectedState: string | null`, add
        `ALL_REGIONS_VALUE` as a module constant, and derive all three values internally.
        Preserve the fallbacks exactly: empty `stateOptions` →
        `m.map_sidebar_no_regions_available()`, no `selectedState` →
        `m.map_sidebar_all_regions()`, unknown state code → the raw code, unknown country →
        `m.map_sidebar_country_label()`.
  - [x] 4.2 Map the sentinel back to `null` inside `RegionFilters` before calling
        `onStateSelect`, and widen its type to `(stateCode: string | null) => void`.
  - [x] 4.3 In `MapSidebarHeader.svelte`: drop the four forwarded props, pass
        `selectedState` through, and widen its own `onStateSelect` prop type to match.
  - [x] 4.4 In MapSidebar: delete `ALL_REGIONS_VALUE` (line 42), `selectedCountryLabel` /
        `selectedStateLabel` / `stateSelectValue` (lines 223–238) and the `handleStateSelect`
        adapter (841–843); forward `onStateChange` directly to the header.
  - [x] 4.5 Update all three stories in `RegionFilters.stories.svelte` (lines 41–44, 57–60,
        73–76) to pass `selectedState`; confirm `npm run build-storybook` succeeds and the
        stories still render "Germany"/"Brandenburg", "Germany"/all-regions and
        "Switzerland"/all-regions.
  - [x] 4.6 Verify, including `e2e/region-browsing.test.ts`; commit.

- [ ] 5. Sidebar scope → `$lib/stores/sidebar-scope.svelte.ts` (depends on: none)
  - [ ] 5.1 Create `src/lib/stores/sidebar-scope.svelte.ts` exporting `createSidebarScope()`
        with readonly `parsedRoute`, `routeKind`, `isMyEntriesScope`, `isUserAuthenticated`,
        `isAuthInitialized` and `isAuthModalRoute`. It reads `page.url.hash` and `authStore`
        directly, mirroring `createMyEntriesStore`.
  - [ ] 5.2 Move the my-entries sign-in redirect `$effect` and its
        `redirectingToSignInForMyEntries` latch into the factory, including the reset when
        the route leaves `myentries`, so an unauthenticated `#/myentries` visit still issues
        exactly one `goto(routeBuilders.auth.signInWithRedirect(routeBuilders.myEntries()))`.
        Doc-comment the "must be called during component initialization" constraint.
  - [ ] 5.3 Instantiate as the **first** factory in MapSidebar (its redirect effect runs
        before every other moved effect today). Delete the moved state and effect, and
        repoint reads — including `getDepotReturnFarmId` and the two
        `parsedRoute.query.get('farm')` uses in the template (lines 878, 882) — to
        `scope.parsedRoute`. Drop the `parseHashRoute` / `isAuthRouteHash` imports and the
        `authStore` import where it was only serving scope.
  - [ ] 5.4 Verify, including `e2e/my-entries-scope.test.ts`; commit.

- [ ] 6. Collapse policy → `$lib/stores/sidebar-collapse.svelte.ts` (depends on: none)
  - [ ] 6.1 Create `src/lib/stores/sidebar-collapse.svelte.ts` exporting
        `createSidebarCollapse(sources)` where `sources` are getter thunks
        `{ isAuthModalRoute, isNonListMode, isTaskLevel, isMobile }`, exposing readable and
        writable `collapsed`, readable `effectiveCollapsed`, and `expand()`.
  - [ ] 6.2 Move both policy effects in, preserving order and semantics: entering an auth
        route saves the current value and collapses, leaving restores the saved value; a
        non-list mode force-expands unless the viewport is mobile and the level is not a
        task level.
  - [ ] 6.3 Instantiate **after** scope in MapSidebar; delete `collapsed`,
        `wasAuthModalRoute`, `collapsedBeforeAuthModal` and `effectiveCollapsed`.
  - [ ] 6.4 Convert both `bind:collapsed` sites (`SidebarShell`, `MapSidebarHeader`) to
        Svelte function bindings so the header toggle still writes through; point
        `focusSearch`'s expand at `expand()`.
  - [ ] 6.5 Verify, including `e2e/auth-overlay-responsive.test.ts`,
        `e2e/bottom-sheet.test.ts` and `e2e/responsive-shell-footer.test.ts`; commit.

- [ ] 7. Search → `$lib/stores/sidebar-search.svelte.ts` (depends on: none)
  - [ ] 7.1 Create `src/lib/stores/sidebar-search.svelte.ts` exporting
        `createSidebarSearch(sources)` with `sources` supplying `isMyEntriesScope`,
        `collapsed` and `isMobile` as getter thunks. Expose writable `value` and `inputEl`,
        readable `suggestions` / `isLoading` / `isFocused` / `showSuggestions`, and
        `handleFocus`, `handleBlur`, `selectSuggestion`, `focusInput`. Move
        `MIN_SEARCH_CHARS` (2) and `SEARCH_SUGGESTIONS_DEBOUNCE_MS` (300) in.
  - [ ] 7.2 Preserve the stale-response guard verbatim: bump `latestSearchRequestId` per
        request, drop late responses _and_ late errors, clear `isLoading` only from the
        newest request, and on dropping below `MIN_SEARCH_CHARS` set the id to `-1`, clear
        suggestions and cancel the pending debounce. Keep the "enter the loading state up
        front" behaviour so the debounce window shows the loading row, never a false empty
        state.
  - [ ] 7.3 Preserve `selectSuggestion`: clear the query, cancel the debounce, call
        `networkSelection.clear()`, and for a depot suggestion call
        `networkSelection.selectDepot(id)` _before_ navigating. Keep `showSuggestions`'s
        mobile carve-out (`(!collapsed || isMobile)`, not my-entries scope, at least
        `MIN_SEARCH_CHARS` typed) and its deliberate lack of focus-gating.
  - [ ] 7.4 Instantiate **last** of the four factories in MapSidebar (its debounce effect
        runs after the others today); delete the moved state, `loadSearchSuggestions`, the
        debounce effect and the focus/blur/select handlers.
  - [ ] 7.5 Convert `bind:searchValue` and `bind:searchInputEl` on both `MapSidebarHeader`
        and `SlimSearchHeader` to function bindings; repoint `showSearchSuggestions` and
        delegate `focusSearch` to `focusInput()`.
  - [ ] 7.6 Write `src/lib/stores/sidebar-search.svelte.spec.ts` — named `.svelte.spec.ts`
        so it runs in the browser project; build the subject inside `$effect.root(...)` and
        flush with `flushSync` / `await tick()`; use fake timers for the debounce. Assert:
        an out-of-order response from a superseded request does not overwrite `suggestions`;
        a rejection from a superseded request neither clears them nor clears `isLoading`;
        typing below `MIN_SEARCH_CHARS` mid-flight discards the in-flight result; and
        `isLoading` is `true` throughout the debounce window before any request is issued.
  - [ ] 7.7 Verify, including `e2e/search-discovery.test.ts` and
        `e2e/network-visualization.test.ts`; commit.

- [ ] 8. Entry mutations → `$lib/utils/entry-actions.ts` (depends on: 1, 3)
  - [ ] 8.1 Create `src/lib/utils/entry-actions.ts` as a **plain factory** —
        `createEntryActions(sources)` with `ownedFarmIds` as a getter thunk and
        `onRefreshMyEntries` as a callback. The two delete-pending flags are ordinary
        closure `let`s, not `$state`; the file is `.ts`, not `.svelte.ts`. Expose
        `stopRowActionEvent`, `createEntry`, `editEntry`, `deleteEntry` and
        `deleteDepotFromProfile`. Import `getFirstAssociatedFarmId` /
        `showDepotMutationToast` from `$lib/utils/depot-feedback`.
  - [ ] 8.2 Move the six handlers across (MapSidebar lines 324–327, 357–507, 530–560)
        preserving the post-delete await order exactly:
        depot-from-list = `deleteDepot` → `goto(myEntries, {replaceState:true})` →
        `await onRefreshMyEntries?.()` → `showDepotMutationToast('deleted', farmId)` with
        `farmId` captured _before_ the delete;
        farm/initiative = delete → `goto(myEntries, {replaceState:true})` →
        `await onRefreshMyEntries?.()` → `await invalidateAll()` → success toast;
        depot-from-profile = `deleteDepot` → `await invalidateAll()` →
        `await onRefreshMyEntries?.()` → `toastSuccess(...)` with **no** `goto`.
  - [ ] 8.3 Preserve the two guards and all feedback: zero owned farms →
        `toastInfo(m.map_sidebar_depot_needs_farm())` with no navigation; farm delete
        pre-fetches `getMainEntry('farms', id)` and appends
        `m.map_sidebar_delete_farm_confirm_depots_note()` only when the farm has depots,
        falling back to the plain description (with a dev warn) on fetch failure. Keep all
        confirm copy, `confirmVariant: 'destructive'`, both re-entrancy guards, the
        `finally` resets, the dev-only `console.warn`s and the error toasts. The FK-cascade
        and same-hash-navigation comments travel with the code.
  - [ ] 8.4 Rewire MapSidebar: instantiate with `ownedFarmIds: () => owned.farms` and
        `onRefreshMyEntries`; repoint the `onCreate` / `onEditEntry` / `onDeleteEntry` /
        `onRowActionTrigger` props on `MyEntriesCreateActions`, `MyEntriesList` and
        `EntriesList`, and `onDepotDelete` on both `FarmProfile` instances.
  - [ ] 8.5 Write `src/lib/utils/entry-actions.spec.ts` (node project). With `goto`,
        `invalidateAll`, `onRefreshMyEntries`, the delete APIs and the toast module mocked,
        assert the recorded call _order_ for all three delete paths — in particular that
        `onRefreshMyEntries` is awaited after `goto`, and that the profile-scoped delete
        issues no `goto`. Also assert: a declined confirm performs no mutation; a second
        call while one is in flight is a no-op; a rejected delete leaves the pending flag
        cleared and fires the error toast; the depot-create guard fires `toastInfo` without
        navigating; and the depots note appears only when the fetched farm has depots.
  - [ ] 8.6 Verify, including `e2e/farm-initiative-delete.test.ts`, `e2e/depot-crud.test.ts`
        and `e2e/depot-on-profile.test.ts`, and the `my-entries depot delete action …` case
        in `MapSidebar.svelte.spec.ts`; commit.

- [ ] 9. Entry selection → `$lib/stores/entry-selection.svelte.ts` (depends on: none)
  - [ ] 9.1 Create `src/lib/stores/entry-selection.svelte.ts` exporting
        `createEntrySelection(sources)` with `entries`, `isMyEntriesScope` and
        `focusedEntry` as getter thunks plus the `onEntryClick` callback. Expose
        `handleEntryClick(feature, options?)`, writable `listScrollEl` and
        `requestScrollRestore()`.
  - [ ] 9.2 Move `handleEntryClick`, the `lastDetailId` bookkeeping, `latestInteractionId`,
        the detail-focus effect and the scroll capture/restore effect in. Preserve: the
        per-click interaction id that discards a stale depot → farm resolution; the depot
        branch (resolve farm id, pan the matching feature from `entries` when present, set
        `lastDetailId` to suppress the duplicate pan, then `goto` the farm detail; a depot
        with no farm logs in dev and does nothing else); my-entries scope panning only and
        never navigating, respecting `triggerPan !== false`; the focus effect panning once
        per newly focused entry with `detailData ?? contactData` as the source and resetting
        `lastDetailId` when nothing is focused; and `scrollTop` captured at the start of
        every `handleEntryClick`, re-applied only when a restore is pending _and_ the
        element has remounted.
  - [ ] 9.3 Instantiate **after collapse and before search** in MapSidebar; convert
        `bind:ref` on `SidebarScrollArea` to a function binding; have `handleDetailBack`
        call `requestScrollRestore()` and `openDetailView` delegate to `handleEntryClick`
        with `triggerPan: false`.
  - [ ] 9.4 Write `src/lib/stores/entry-selection.svelte.spec.ts` — `.svelte.spec.ts` so it
        runs in the browser project, subject built inside `$effect.root(...)`. Assert: a
        slow depot → farm resolution returning after a newer click is discarded (no pan, no
        `goto`); a depot whose farm is absent from `entries` still navigates but pans
        nothing; a depot with no associated farm neither pans nor navigates; and
        `lastDetailId` set by the depot branch suppresses the duplicate pan when the detail
        route later resolves to that same farm.
  - [ ] 9.5 Verify, including `e2e/detail-profile-polish.test.ts`,
        `e2e/depot-interaction.test.ts` and `e2e/legacy-routes.test.ts`, and the four
        `openDetailView` / row-click cases in `MapSidebar.svelte.spec.ts`; commit.

- [ ] 10. MapSidebar as a wiring layer (depends on: 1, 2, 3, 4, 5, 6, 7, 8, 9)
  - [ ] 10.1 Confirm the factories are instantiated scope → collapse → selection → search,
        and add a short comment at the instantiation site recording that the order is
        load-bearing because effects run in creation order.
  - [ ] 10.2 Confirm the 14 thin `goto` handlers are still present and unextracted
        (`handleCloseDetail`, `handleDetailBack`, `handleContactBack`,
        `handleEditFromDetail`, `handleEditorCancel`, `handleEditorSaved`,
        `getDepotReturnFarmId`, `handleDepotEditorCancel`, `handleDepotEditorSaved`,
        `handleDepotSelectFromProfile`, `handleDepotEditFromProfile`,
        `handleAddDepotFromProfile`, `handleOpenAllEntriesScope`,
        `handleOpenMyEntriesScope`) with their `replaceState: true` usage unchanged, and
        that the contact-owner redirect effect (lines 289–293) stayed in MapSidebar.
  - [ ] 10.3 Measure the budgets: `MapSidebar.svelte` ≤ 460 lines total with a `<script>`
        block ≤ 290 lines, and every new module ≤ 160 lines. A unit meaningfully over
        budget is a signal the split was wrong — raise it rather than compressing the code.
  - [ ] 10.4 Diff the template against the copy from task 1.2 to confirm it is structurally
        unchanged: same branches in the same order, same `{#key}` expressions, same
        `data-testid`s, only identifiers differing.
  - [ ] 10.5 Confirm `MapSidebarProps` is unchanged and `src/routes/Map.svelte` has no diff,
        and that `openDetailView` and `focusSearch` are still exported and behave
        identically — `focusSearch` no-ops on task levels and in my-entries scope, expands
        the sidebar, and focuses on the next animation frame.
  - [ ] 10.6 Run the full sweep against the 1.1 baseline: `check` (0 errors), `lint`,
        `test:unit -- --run` (existing suites plus the four new specs), `build-storybook`,
        and the full `test:e2e`.
  - [ ] 10.7 Confirm the contract held: `git diff` against the merge base shows **no**
        changes to `src/routes/MapSidebar.svelte.spec.ts` or `e2e/`. If a mock path had to
        follow moved code, list it explicitly in the PR description as the one permitted
        exception.
  - [ ] 10.8 Confirm each of the ten commits is individually green (`git rebase --exec` or
        equivalent spot-check) so the history is bisectable; open the PR against `preview`.
