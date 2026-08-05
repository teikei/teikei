<script lang="ts">
	import { navigating, page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { ErrorState, SidebarScrollArea, SidebarShell } from '$lib/components/layout';
	import type {
		DepotFeature,
		EntryFeature,
		EntryFeatureCollection,
		MainEntryFeature
	} from '$lib/types/entries';
	import type { RegionOption } from '$lib/utils/regions';
	import {
		EntriesList,
		EntryContactView,
		MyEntriesCreateActions,
		MyEntriesList,
		ProfileSkeleton
	} from '$lib/components/domain/entries';
	import { DepotEditor } from '$lib/components/domain/depots';
	import { FarmProfile } from '$lib/components/domain/farms';
	import { InitiativeProfile } from '$lib/components/domain/initiatives';
	import { MapSidebarHeader, SlimSearchHeader } from '$lib/components/domain/map';
	import { getAssociatedFarmIdForDepot } from '$lib/api/entry-details';
	import { networkSelection } from '$lib/stores/network-selection.svelte';
	import { createSidebarCollapse } from '$lib/stores/sidebar-collapse.svelte';
	import { createSidebarScope } from '$lib/stores/sidebar-scope.svelte';
	import { createSidebarSearch } from '$lib/stores/sidebar-search.svelte';
	import { getFirstAssociatedFarmId, showDepotMutationToast } from '$lib/utils/depot-feedback';
	import { createEntryActions } from '$lib/utils/entry-actions';
	import { deriveOwnedEntryIds } from '$lib/utils/entry-ownership';
	import { mainEntryTypeToResource } from '$lib/utils/main-entries';
	import { routeBuilders } from '$lib/utils/routes';
	import { resolveSidebarView } from '$lib/utils/sidebar-view';
	import type { LoadErrorKind } from '$lib/utils/load-error';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

	const isMobile = new IsMobile();

	const MAX_VISIBLE_ENTRIES = 200;

	interface MapSidebarProps {
		entries?: EntryFeatureCollection;
		myEntries?: EntryFeatureCollection;
		isMyEntriesLoading?: boolean;
		myEntriesError?: boolean;
		onEntryClick?: (feature: EntryFeature, options?: { openPopup?: boolean }) => void;
		onDetailClose?: () => void;
		countryOptions?: RegionOption[];
		stateOptions?: RegionOption[];
		selectedCountry?: string;
		selectedState?: string | null;
		onCountryChange?: (countryCode: string) => void;
		onStateChange?: (stateCode: string | null) => void;
		onResetView?: () => void;
		onRefreshMyEntries?: () => void | Promise<void>;
		/** Restore the pre-detail map viewport when going "back" (F12.3). */
		onRestoreDetailView?: () => void;
	}

	let {
		entries,
		myEntries,
		isMyEntriesLoading = false,
		myEntriesError = false,
		onEntryClick,
		onDetailClose,
		countryOptions = [],
		stateOptions = [],
		selectedCountry = '',
		selectedState = null,
		onCountryChange,
		onStateChange,
		onResetView,
		onRefreshMyEntries,
		onRestoreDetailView
	}: MapSidebarProps = $props();

	let latestInteractionId = $state(0);
	// List scroll restore (F12.3): captured when a detail opens, re-applied when
	// the list remounts after a "back". The list content is unmounted while a
	// detail is open, so scrollTop would otherwise be lost.
	let listScrollEl = $state<HTMLElement | null>(null);
	let savedListScrollTop = $state(0);
	let pendingScrollRestore = $state(false);

	const scope = createSidebarScope();
	const baseEntries = $derived.by(() =>
		scope.isMyEntriesScope ? (myEntries?.features ?? []) : (entries?.features ?? [])
	);

	// Detail view from route data (loaded by +page.ts)
	const detailData = $derived(page.data.detailData);
	const contactData = $derived(page.data.contactData);
	const editorData = $derived(page.data.editorData);
	const depotDetailData = $derived(page.data.depotDetailData);
	const depotEditorData = $derived(page.data.depotEditorData);
	// Loaders catch fetch failures (via loadCatching) and return this kind so
	// the drawer shows a designed error state instead of SvelteKit's error page
	// (14.2). 'not-found' gets its own copy and no retry; 'unavailable' offers one.
	const loadError = $derived(page.data.loadError as LoadErrorKind | undefined);
	const view = $derived(
		resolveSidebarView({
			detailData,
			contactData,
			editorData,
			depotEditorData,
			loadError,
			navigatingToRouteId: navigating.to?.route.id
		})
	);
	const owned = $derived(deriveOwnedEntryIds(myEntries?.features ?? []));
	const collapse = createSidebarCollapse({
		isAuthModalRoute: () => scope.isAuthModalRoute,
		isNonListMode: () => view.isNonListMode,
		isTaskLevel: () => view.isTaskLevel,
		isMobile: () => isMobile.current
	});
	const search = createSidebarSearch({
		isMyEntriesScope: () => scope.isMyEntriesScope,
		collapsed: () => collapse.collapsed,
		isMobile: () => isMobile.current
	});
	const entryActions = createEntryActions({
		ownedFarmIds: () => owned.farms,
		onRefreshMyEntries: () => onRefreshMyEntries?.()
	});

	// Track when detail route changes to trigger map pan
	let lastDetailId = $state<string | null>(null);

	$effect(() => {
		const focusedEntry = view.focusedEntry;
		if (focusedEntry && focusedEntry.properties.id !== lastDetailId) {
			// Pan from resolved detail data (works for deep-link and redirect loads, too).
			onEntryClick?.(focusedEntry as EntryFeature, { openPopup: true });
			lastDetailId = focusedEntry.properties.id;
		} else if (!focusedEntry) {
			lastDetailId = null;
		}
	});

	// Owners get edit affordances instead of a contact CTA, so a contact deep link
	// for an entry they own redirects to its profile. Ownership resolves async (the
	// myEntries load), so this also closes the view if it opened before it resolved.
	$effect(() => {
		if (contactData && owned.mainEntries.has(contactData.properties.id)) {
			handleContactBack();
		}
	});

	// Expose function to open detail view from outside (e.g., map click)
	export function openDetailView(feature: EntryFeature) {
		void handleEntryClick(feature, { triggerPan: false });
	}

	// Expose search focusing for the app-root keyboard shortcut (`/` and ⌘K).
	// Task levels deliberately hide the search, so this is a no-op there.
	export function focusSearch() {
		// No search surface on task levels, and the input is disabled in my-entries
		// scope — focusing a disabled input is a silent no-op, so bail.
		if (view.isTaskLevel || scope.isMyEntriesScope) {
			return;
		}
		collapse.expand();
		search.focusInput();
	}

	const visibleFeatures = $derived(baseEntries.slice(0, MAX_VISIBLE_ENTRIES));
	const hasCappedEntries = $derived(baseEntries.length > visibleFeatures.length);

	function handleDepotSelectFromProfile(depot: DepotFeature) {
		onEntryClick?.(depot as EntryFeature, { openPopup: true });
	}

	function handleDepotEditFromProfile(depot: DepotFeature) {
		const farmId = detailData?.properties.id;
		if (farmId) {
			void goto(routeBuilders.depot.editForFarm(depot.properties.id, farmId));
			return;
		}
		void goto(routeBuilders.depotLegacy.edit(depot.properties.id));
	}

	function handleAddDepotFromProfile() {
		const farmId = detailData?.properties.id;
		if (!farmId) {
			return;
		}
		void goto(routeBuilders.depot.createForFarm(farmId));
	}

	async function handleEntryClick(feature: EntryFeature, options: { triggerPan?: boolean } = {}) {
		const interactionId = ++latestInteractionId;
		const props = feature.properties;

		// Remember where the list was scrolled so "back" can restore it (F12.3).
		savedListScrollTop = listScrollEl?.scrollTop ?? 0;

		if (scope.isMyEntriesScope) {
			if (options.triggerPan !== false) {
				onEntryClick?.(feature, { openPopup: true });
			}
			return;
		}

		if (props.type === 'Depot') {
			try {
				const farmId = await getAssociatedFarmIdForDepot(props.id);
				// Ignore stale async results when a newer interaction has happened.
				if (interactionId !== latestInteractionId) {
					return;
				}

				if (farmId) {
					const associatedFarmFeature = entries?.features.find(
						(candidate) =>
							candidate.properties?.type === 'Farm' && candidate.properties?.id === farmId
					);

					if (associatedFarmFeature) {
						onEntryClick?.(associatedFarmFeature as EntryFeature, { openPopup: true });
						// Prevent duplicate pan when the detail route data resolves for this farm.
						lastDetailId = farmId;
					}
					await goto(routeBuilders.farm.detail(farmId));
					return;
				}

				if (dev) {
					console.warn(`No associated farm found for depot ${props.id}`);
				}
			} catch (error) {
				if (dev) {
					console.warn(`Failed to resolve associated farm for depot ${props.id}`, error);
				}
			}
			return;
		}

		// Trigger map click handler (for panning/popup) when requested.
		if (options.triggerPan !== false) {
			onEntryClick?.(feature, { openPopup: true });
		}

		// Prevent duplicate panning when route data for this same entry arrives.
		lastDetailId = props.id;

		// Navigate to detail route for farm/initiative.
		const mainEntryResource = mainEntryTypeToResource(props.type);
		await goto(routeBuilders.mainEntryDetail(mainEntryResource, props.id));
	}

	// Re-apply the captured list scroll once the list content remounts after a
	// "back". Runs when both the restore is pending and the element is bound.
	$effect(() => {
		if (pendingScrollRestore && listScrollEl) {
			listScrollEl.scrollTop = savedListScrollTop;
			pendingScrollRestore = false;
		}
	});

	function handleCloseDetail() {
		// Closing the profile (route leave) is the lifecycle boundary for depot
		// emphasis — clear here, not on popup close, so dismissing only the map
		// popup keeps the selected depot highlighted while the profile stays open.
		networkSelection.clear();
		goto(routeBuilders.home());
		onDetailClose?.();
	}

	// "Back" (slim persistent header) returns to the list as it was: restore the
	// pre-detail map viewport and the list scroll position, unlike the plain close
	// (X) which leaves the map where the detail framed it (F12.3).
	function handleDetailBack() {
		if (savedListScrollTop > 0) {
			pendingScrollRestore = true;
		}
		onRestoreDetailView?.();
		handleCloseDetail();
	}

	// Back from the contact view (and a successful send) returns to the profile.
	// `replaceState` (as in `handleEditorCancel`) drops the contact entry rather
	// than stacking a second profile entry on top of it, so returning here twice
	// never buries the list under a pile of history.
	function handleContactBack() {
		if (!contactData) {
			return;
		}
		void goto(routeBuilders.entryDetail(contactData.properties.type, contactData.properties.id), {
			replaceState: true
		});
	}

	function handleEditFromDetail() {
		if (!detailData) {
			return;
		}
		if (detailData.properties.type === 'Farm') {
			void goto(routeBuilders.farm.edit(detailData.properties.id));
			return;
		}
		if (detailData.properties.type === 'Initiative') {
			void goto(routeBuilders.initiative.edit(detailData.properties.id));
		}
	}

	async function handleEditorCancel() {
		if (!editorData) {
			return;
		}

		if (editorData.mode === 'create') {
			await goto(routeBuilders.myEntries(), { replaceState: true });
			return;
		}

		if (detailData?.properties.type === 'Farm') {
			await goto(routeBuilders.farm.detail(detailData.properties.id), { replaceState: true });
			return;
		}
		if (detailData?.properties.type === 'Initiative') {
			await goto(routeBuilders.initiative.detail(detailData.properties.id), { replaceState: true });
			return;
		}

		await goto(routeBuilders.home(), { replaceState: true });
	}

	// Both saving an edit and creating a new entry land on the read profile
	// (Feature 9): creation reuses the same section form as editing, so the owner
	// has already filled the whole form — no separate edit-mode refinement step.
	async function handleEditorSaved(savedEntry: MainEntryFeature) {
		if (savedEntry.properties.type === 'Farm') {
			await goto(routeBuilders.farm.detail(savedEntry.properties.id), { replaceState: true });
			return;
		}
		await goto(routeBuilders.initiative.detail(savedEntry.properties.id), { replaceState: true });
	}

	function getDepotReturnFarmId(): string | null {
		return scope.parsedRoute.query.get('farm');
	}

	async function handleDepotEditorCancel() {
		const returnFarmId = getDepotReturnFarmId();
		if (returnFarmId) {
			await goto(routeBuilders.farm.detail(returnFarmId), { replaceState: true });
			return;
		}
		await goto(routeBuilders.myEntries(), { replaceState: true });
	}

	async function handleDepotEditorSaved(savedDepot: DepotFeature) {
		const action = depotEditorData?.mode === 'edit' ? 'updated' : 'created';
		const returnFarmId = getDepotReturnFarmId();
		if (returnFarmId) {
			// Returning to the originating farm profile: no redundant "show farm" action.
			await goto(routeBuilders.farm.detail(returnFarmId), { replaceState: true });
			showDepotMutationToast(action, null);
			return;
		}
		const farmId = getFirstAssociatedFarmId(savedDepot);
		await goto(routeBuilders.myEntries(), { replaceState: true });
		showDepotMutationToast(action, farmId);
	}

	function handleOpenAllEntriesScope() {
		void goto(routeBuilders.home());
	}

	function handleOpenMyEntriesScope() {
		void goto(routeBuilders.myEntries());
	}

	function handleCountrySelect(nextCountryCode: string) {
		onCountryChange?.(nextCountryCode);
	}
</script>

<!-- Slim persistent header keeps search reachable from an open profile; selecting
     a result replaces the profile (handleSearchSuggestionSelect navigates). Task
     levels — editors, creation forms, the contact form — render no search
     (F10 focused-task rule; see "Sidebar navigation" in packages/map-next/README.md). -->
{#snippet detailSearchHeader()}
	<SlimSearchHeader
		bind:searchValue={() => search.value, (value) => (search.value = value)}
		bind:searchInputEl={() => search.inputEl, (value) => (search.inputEl = value)}
		suggestions={search.suggestions}
		isLoading={search.isLoading}
		showSearchSuggestions={search.showSuggestions}
		onBack={handleDetailBack}
		onSearchSuggestionSelect={search.selectSuggestion}
		onSearchFocus={search.handleFocus}
		onSearchBlur={search.handleBlur}
	/>
{/snippet}

<SidebarShell
	bind:collapsed={() => collapse.collapsed, (value) => (collapse.collapsed = value)}
	mode={view.shellMode}
	raiseToFull={isMobile.current && search.isFocused}
>
	{#if view.isNavigatingToDataRoute}
		<ProfileSkeleton />
	{:else if loadError === 'not-found'}
		{@render detailSearchHeader()}
		<ErrorState
			title={m.errors_not_found_title()}
			description={m.errors_not_found_description()}
			testId="detail-error-state"
		/>
	{:else if loadError}
		{@render detailSearchHeader()}
		<ErrorState onRetry={() => void invalidateAll()} testId="detail-error-state" />
	{:else if view.showDepotEditor && depotEditorData}
		{#key `${depotEditorData.mode}:${depotDetailData?.properties.id ?? 'new'}:${scope.parsedRoute.query.get('farm') ?? ''}`}
			<DepotEditor
				editorData={depotEditorData}
				entry={depotDetailData}
				presetFarmId={scope.parsedRoute.query.get('farm')}
				onCancel={handleDepotEditorCancel}
				onSaved={handleDepotEditorSaved}
			/>
		{/key}
	{:else if view.isFarmEditor && editorData}
		{#key `farm-edit:${detailData?.properties.id ?? 'new'}`}
			<FarmProfile
				entry={detailData}
				mode="edit"
				{editorData}
				canEdit={detailData ? owned.mainEntries.has(detailData.properties.id) : false}
				ownedDepotIds={owned.depots}
				onClose={handleCloseDetail}
				onCancel={handleEditorCancel}
				onSaved={handleEditorSaved}
				onDepotSelect={handleDepotSelectFromProfile}
				onDepotEdit={handleDepotEditFromProfile}
				onDepotDelete={entryActions.deleteDepotFromProfile}
				onAddDepot={handleAddDepotFromProfile}
			/>
		{/key}
	{:else if view.isInitiativeEditor && editorData}
		{#key `initiative-edit:${detailData?.properties.id ?? 'new'}`}
			<InitiativeProfile
				entry={detailData}
				mode="edit"
				{editorData}
				canEdit={detailData ? owned.mainEntries.has(detailData.properties.id) : false}
				onClose={handleCloseDetail}
				onCancel={handleEditorCancel}
				onSaved={handleEditorSaved}
			/>
		{/key}
	{:else if view.showContact && contactData}
		{#if !scope.isAuthInitialized}
			<!-- The form snapshots its prefill props at mount and never re-syncs, so a
			     contact deep link must wait for the session before mounting it —
			     otherwise a signed-in sender gets empty name/email fields. -->
			<ProfileSkeleton />
		{:else}
			{#key `contact:${contactData.properties.id}`}
				<EntryContactView
					entryId={contactData.properties.id}
					entryType={contactData.properties.type}
					entryName={contactData.properties.name}
					initialName={authStore.user?.name ?? ''}
					initialEmail={authStore.user?.email ?? ''}
					onBack={handleContactBack}
				/>
			{/key}
		{/if}
	{:else if view.isFarmDetail && detailData}
		{@render detailSearchHeader()}
		{#key `farm:${detailData.properties.id}`}
			<FarmProfile
				entry={detailData}
				mode="read"
				canEdit={owned.mainEntries.has(detailData.properties.id)}
				ownedDepotIds={owned.depots}
				onClose={handleCloseDetail}
				onEdit={handleEditFromDetail}
				onDepotSelect={handleDepotSelectFromProfile}
				onDepotEdit={handleDepotEditFromProfile}
				onDepotDelete={entryActions.deleteDepotFromProfile}
				onAddDepot={handleAddDepotFromProfile}
			/>
		{/key}
	{:else if view.isInitiativeDetail && detailData}
		{@render detailSearchHeader()}
		{#key `initiative:${detailData.properties.id}`}
			<InitiativeProfile
				entry={detailData}
				mode="read"
				canEdit={owned.mainEntries.has(detailData.properties.id)}
				onClose={handleCloseDetail}
				onEdit={handleEditFromDetail}
			/>
		{/key}
	{:else}
		<MapSidebarHeader
			bind:collapsed={() => collapse.collapsed, (value) => (collapse.collapsed = value)}
			bind:searchValue={() => search.value, (value) => (search.value = value)}
			bind:searchInputEl={() => search.inputEl, (value) => (search.inputEl = value)}
			isUserAuthenticated={scope.isUserAuthenticated}
			isMyEntriesScope={scope.isMyEntriesScope}
			showSearchSuggestions={search.showSuggestions}
			isSearchLoading={search.isLoading}
			searchSuggestions={search.suggestions}
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{selectedState}
			onOpenAllEntriesScope={handleOpenAllEntriesScope}
			onOpenMyEntriesScope={handleOpenMyEntriesScope}
			onSearchSuggestionSelect={search.selectSuggestion}
			onSearchFocus={search.handleFocus}
			onSearchBlur={search.handleBlur}
			onCountrySelect={handleCountrySelect}
			onStateSelect={onStateChange}
		/>
		{#if !collapse.effectiveCollapsed}
			<SidebarScrollArea bind:ref={listScrollEl}>
				{#if scope.isMyEntriesScope}
					<MyEntriesCreateActions onCreate={entryActions.createEntry} />
					<MyEntriesList
						features={baseEntries as EntryFeature[]}
						isLoading={isMyEntriesLoading}
						hasError={myEntriesError}
						onRetry={() => void onRefreshMyEntries?.()}
						onEntryClick={(feature) => void handleEntryClick(feature)}
						onEditEntry={entryActions.editEntry}
						onDeleteEntry={entryActions.deleteEntry}
						onRowActionTrigger={entryActions.stopRowActionEvent}
					/>
				{:else}
					<EntriesList
						features={visibleFeatures as EntryFeature[]}
						totalCount={baseEntries.length}
						{hasCappedEntries}
						isMyEntriesScope={scope.isMyEntriesScope}
						isLoading={isMyEntriesLoading}
						onEntryClick={(feature) => void handleEntryClick(feature)}
						onEditEntry={entryActions.editEntry}
						onDeleteEntry={entryActions.deleteEntry}
						onRowActionTrigger={entryActions.stopRowActionEvent}
						{onResetView}
					/>
				{/if}
			</SidebarScrollArea>
		{/if}
	{/if}
</SidebarShell>
