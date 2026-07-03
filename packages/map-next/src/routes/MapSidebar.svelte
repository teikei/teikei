<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { SvelteSet } from 'svelte/reactivity';
	import { authStore } from '$lib/stores/auth.svelte';
	import { confirmDialog } from '$lib/stores/confirm-dialog.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { SidebarShell } from '$lib/components/layout';
	import config from '$lib/config/app-configuration';
	import type {
		DepotFeature,
		EntryFeature,
		EntryFeatureCollection,
		MainEntryFeature
	} from '$lib/types/entries';
	import type { RegionOption } from '$lib/utils/regions';
	import {
		EntriesList,
		EntryDetail,
		EntryEditor,
		MyEntriesCreateActions
	} from '$lib/components/domain/entries';
	import { DepotEditor } from '$lib/components/domain/depots';
	import { MapSidebarHeader } from '$lib/components/domain/map';
	import { getAssociatedFarmIdForDepot, getMainEntry } from '$lib/api/entry-details';
	import { getAutocompleteSuggestions, type AutocompleteSuggestion } from '$lib/api/discovery';
	import { deleteDepot, deleteFarm, deleteInitiative } from '$lib/api/entry-mutations';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { mainEntryTypeToResource } from '$lib/utils/main-entries';
	import { isAuthRouteHash, parseHashRoute, routeBuilders } from '$lib/utils/routes';
	import { toastSuccess, toastError } from '$lib/utils/toast';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

	const isMobile = new IsMobile();

	const ALL_REGIONS_VALUE = '__all_regions__';
	const SEARCH_SUGGESTIONS_DEBOUNCE_MS = 300;
	const MIN_SEARCH_CHARS = 2;
	const MAX_VISIBLE_ENTRIES = 200;
	const { displayLocale } = config;

	interface MapSidebarProps {
		entries?: EntryFeatureCollection;
		myEntries?: EntryFeatureCollection;
		isMyEntriesLoading?: boolean;
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
	}

	let {
		entries,
		myEntries,
		isMyEntriesLoading = false,
		onEntryClick,
		onDetailClose,
		countryOptions = [],
		stateOptions = [],
		selectedCountry = '',
		selectedState = null,
		onCountryChange,
		onStateChange,
		onResetView,
		onRefreshMyEntries
	}: MapSidebarProps = $props();

	let searchValue = $state('');
	let searchSuggestions: AutocompleteSuggestion[] = $state([]);
	let isSearchLoading = $state(false);
	let latestSearchRequestId = $state(0);
	let collapsed = $state(false);
	let latestInteractionId = $state(0);
	let isDepotDeletePending = $state(false);
	let isMainEntryDeletePending = $state(false);

	const parsedRoute = $derived(parseHashRoute(page.url.hash));

	// Auto-collapse when auth modal routes are active
	const isAuthModalRoute = $derived(isAuthRouteHash(page.url.hash));
	const routeKind = $derived(parsedRoute.kind);
	const isUserAuthenticated = $derived(authStore.isAuthenticated);
	const isAuthInitialized = $derived(authStore.isInitialized);
	const isMyEntriesScope = $derived(routeKind === 'myentries' && isUserAuthenticated);
	const baseEntries = $derived.by(() =>
		isMyEntriesScope ? (myEntries?.features ?? []) : (entries?.features ?? [])
	);

	// Track previous auth route state to detect transitions
	let wasAuthModalRoute = $state(false);
	// Store the user's preferred collapsed state before auth modal opens
	let collapsedBeforeAuthModal = $state(false);
	let redirectingToSignInForMyEntries = $state(false);

	$effect(() => {
		if (isAuthModalRoute && !wasAuthModalRoute) {
			// Entering auth route - save current state and collapse
			collapsedBeforeAuthModal = collapsed;
			collapsed = true;
		} else if (!isAuthModalRoute && wasAuthModalRoute) {
			// Leaving auth route - restore previous state
			collapsed = collapsedBeforeAuthModal;
		}
		wasAuthModalRoute = isAuthModalRoute;
	});

	$effect(() => {
		if (routeKind !== 'myentries') {
			redirectingToSignInForMyEntries = false;
			return;
		}

		if (!isAuthInitialized || isUserAuthenticated || redirectingToSignInForMyEntries) {
			return;
		}

		redirectingToSignInForMyEntries = true;
		void goto(routeBuilders.auth.signInWithRedirect(routeBuilders.myEntries()));
	});

	// Detail view from route data (loaded by +page.ts)
	const detailData = $derived(page.data.detailData);
	const editorData = $derived(page.data.editorData);
	const depotDetailData = $derived(page.data.depotDetailData);
	const depotEditorData = $derived(page.data.depotEditorData);
	const showDetail = $derived(!!detailData);
	const showEditor = $derived(!!editorData);
	const showDepotEditor = $derived(!!depotEditorData);
	const isNonListMode = $derived(showDetail || showEditor || showDepotEditor);
	const isEditorMode = $derived(showEditor || showDepotEditor);
	const ownedMainEntryIds = $derived.by(() => {
		const ownedIds = new SvelteSet<string>();
		for (const feature of myEntries?.features ?? []) {
			const type = feature.properties?.type;
			if (type === 'Farm' || type === 'Initiative') {
				ownedIds.add(feature.properties.id);
			}
		}
		return ownedIds;
	});
	const selectedCountryLabel = $derived(
		countryOptions.find((option) => option.value === selectedCountry)?.label ??
			m.map_sidebar_country_label()
	);
	const selectedStateLabel = $derived.by(() => {
		if (stateOptions.length === 0) {
			return m.map_sidebar_no_regions_available();
		}

		if (!selectedState) {
			return m.map_sidebar_all_regions();
		}

		return stateOptions.find((option) => option.value === selectedState)?.label ?? selectedState;
	});
	const stateSelectValue = $derived(selectedState ?? ALL_REGIONS_VALUE);
	const showSearchSuggestions = $derived(
		!collapsed && !isMyEntriesScope && searchValue.trim().length >= MIN_SEARCH_CHARS
	);
	const shellMode = $derived<'list' | 'detail' | 'editor'>(
		isEditorMode ? 'editor' : showDetail ? 'detail' : 'list'
	);
	// On mobile the bottom sheet stays mounted at every snap point (so dragging
	// between peek/half/full reveals live content); content is only unmounted for
	// the desktop collapsed card.
	const effectiveCollapsed = $derived(collapsed && !isMobile.current);

	$effect(() => {
		// Keep detail/editor routes reachable: avoid rendering them in the collapsed
		// desktop card. On the mobile bottom sheet a detail view may still snap to
		// peek (map returns to view, selection kept), but editors stay expanded.
		const forbidCollapse = !isMobile.current || isEditorMode;
		if (isNonListMode && collapsed && forbidCollapse) {
			collapsed = false;
		}
	});

	// Track when detail route changes to trigger map pan
	let lastDetailId = $state<string | null>(null);

	$effect(() => {
		if (detailData && detailData.properties.id !== lastDetailId) {
			// Pan from resolved detail data (works for deep-link and redirect loads, too).
			onEntryClick?.(detailData as EntryFeature, { openPopup: true });
			lastDetailId = detailData.properties.id;
		} else if (!detailData) {
			lastDetailId = null;
		}
	});

	// Expose function to open detail view from outside (e.g., map click)
	export function openDetailView(feature: EntryFeature) {
		void handleEntryClick(feature, { triggerPan: false });
	}

	const visibleFeatures = $derived(baseEntries.slice(0, MAX_VISIBLE_ENTRIES));
	const hasCappedEntries = $derived(baseEntries.length > visibleFeatures.length);

	function stopRowActionEvent(event: Event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function getFirstAssociatedFarmId(depot: DepotFeature): string | null {
		return depot.properties.farms?.features?.[0]?.properties?.id ?? null;
	}

	function showDepotMutationToast(
		action: 'created' | 'updated' | 'deleted',
		farmId: string | null
	) {
		const message =
			action === 'created'
				? m.editor_depot_saved_created()
				: action === 'updated'
					? m.editor_depot_saved_updated()
					: m.editor_depot_saved_deleted();

		toastSuccess(
			message,
			farmId
				? {
						action: {
							label: m.editor_depot_view_associated_farm(),
							onClick: () => void goto(routeBuilders.farm.detail(farmId))
						}
					}
				: undefined
		);
	}

	function handleCreateEntry(entryType: 'Farm' | 'Depot' | 'Initiative', event: Event) {
		stopRowActionEvent(event);
		if (entryType === 'Farm') {
			void goto(routeBuilders.farm.create());
			return;
		}
		if (entryType === 'Initiative') {
			void goto(routeBuilders.initiative.create());
			return;
		}

		void goto(routeBuilders.depotLegacy.create());
	}

	function handleEditEntry(feature: EntryFeature, event: Event) {
		stopRowActionEvent(event);
		const type = feature.properties.type;
		if (type === 'Farm') {
			void goto(routeBuilders.farm.edit(feature.properties.id));
			return;
		}
		if (type === 'Initiative') {
			void goto(routeBuilders.initiative.edit(feature.properties.id));
			return;
		}

		void goto(routeBuilders.depotLegacy.edit(feature.properties.id));
	}

	async function handleDeleteEntry(feature: EntryFeature, event: Event) {
		stopRowActionEvent(event);
		if (feature.properties.type === 'Depot') {
			await handleDeleteDepot(feature as DepotFeature);
			return;
		}
		await handleDeleteMainEntry(feature as MainEntryFeature);
	}

	async function handleDeleteDepot(feature: DepotFeature) {
		if (isDepotDeletePending) {
			return;
		}

		const confirmed = await confirmDialog.confirm({
			title: m.editor_depot_delete_confirm(),
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel()
		});
		if (!confirmed) {
			return;
		}

		isDepotDeletePending = true;
		try {
			const farmId = getFirstAssociatedFarmId(feature);
			await deleteDepot(feature.properties.id);
			await goto(routeBuilders.myEntries(), { replaceState: true });
			// Deleting from within #/myentries navigates to the same hash, so the
			// hash-driven owned-entries refresh in createMyEntriesStore won't fire.
			// Trigger it explicitly so the deleted depot disappears immediately.
			await onRefreshMyEntries?.();
			showDepotMutationToast('deleted', farmId);
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete depot ${feature.properties.id}`, error);
			}
			toastError(m.editor_depot_delete_failed());
		} finally {
			isDepotDeletePending = false;
		}
	}

	async function handleDeleteMainEntry(feature: MainEntryFeature) {
		if (isMainEntryDeletePending) {
			return;
		}

		const isFarm = feature.properties.type === 'Farm';
		const name = feature.properties.name;

		let description: string = isFarm
			? m.map_sidebar_delete_farm_confirm_description()
			: m.map_sidebar_delete_initiative_confirm_description();

		// Deleting a farm detaches its depots: the FK cascade removes only the
		// farm↔depot association rows, never the depot records themselves (own or
		// foreign-owned). Surface that consequence when the farm actually has depots.
		if (isFarm) {
			try {
				const farmDetail = await getMainEntry('farms', feature.properties.id);
				const hasDepots =
					farmDetail.properties.type === 'Farm' &&
					(farmDetail.properties.depots?.features.length ?? 0) > 0;
				if (hasDepots) {
					description = `${description} ${m.map_sidebar_delete_farm_confirm_depots_note()}`;
				}
			} catch (error) {
				if (dev) {
					console.warn(`Failed to load depots for farm ${feature.properties.id}`, error);
				}
			}
		}

		const confirmed = await confirmDialog.confirm({
			title: isFarm
				? m.map_sidebar_delete_farm_confirm_title({ name })
				: m.map_sidebar_delete_initiative_confirm_title({ name }),
			description,
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel()
		});
		if (!confirmed) {
			return;
		}

		isMainEntryDeletePending = true;
		try {
			if (isFarm) {
				await deleteFarm(feature.properties.id);
			} else {
				await deleteInitiative(feature.properties.id);
			}
			await goto(routeBuilders.myEntries(), { replaceState: true });
			// Same-hash navigation won't retrigger the owned-entries refresh, so fire
			// it explicitly; invalidateAll re-runs the layout load so the deleted
			// entry also disappears from the map without a full page reload.
			await onRefreshMyEntries?.();
			await invalidateAll();
			toastSuccess(
				isFarm ? m.map_sidebar_delete_farm_success() : m.map_sidebar_delete_initiative_success()
			);
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete ${feature.properties.type} ${feature.properties.id}`, error);
			}
			toastError(
				isFarm ? m.map_sidebar_delete_farm_failed() : m.map_sidebar_delete_initiative_failed()
			);
		} finally {
			isMainEntryDeletePending = false;
		}
	}

	async function loadSearchSuggestions(query: string) {
		const trimmed = query.trim();
		if (trimmed.length < MIN_SEARCH_CHARS) {
			searchSuggestions = [];
			isSearchLoading = false;
			return;
		}

		const requestId = ++latestSearchRequestId;
		isSearchLoading = true;

		try {
			const suggestions = await getAutocompleteSuggestions({
				text: trimmed,
				locale: displayLocale,
				withEntries: true
			});

			if (requestId !== latestSearchRequestId) {
				return;
			}

			searchSuggestions = suggestions;
		} catch (error) {
			if (requestId !== latestSearchRequestId) {
				return;
			}
			searchSuggestions = [];
			if (dev) {
				console.warn('Failed to fetch search suggestions', error);
			}
		} finally {
			if (requestId === latestSearchRequestId) {
				isSearchLoading = false;
			}
		}
	}

	const debouncedSuggestionsSearch = createDebouncedCallback(
		() => void loadSearchSuggestions(searchValue),
		SEARCH_SUGGESTIONS_DEBOUNCE_MS
	);

	$effect(() => {
		const query = searchValue.trim();
		if (query.length < MIN_SEARCH_CHARS) {
			latestSearchRequestId = -1;
			isSearchLoading = false;
			searchSuggestions = [];
			debouncedSuggestionsSearch.cancel();
			return;
		}

		debouncedSuggestionsSearch.trigger();
	});

	async function handleEntryClick(feature: EntryFeature, options: { triggerPan?: boolean } = {}) {
		const interactionId = ++latestInteractionId;
		const props = feature.properties;

		if (isMyEntriesScope) {
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

	function handleCloseDetail() {
		goto(routeBuilders.home());
		onDetailClose?.();
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

	async function handleEditorSaved(savedEntry: MainEntryFeature) {
		if (savedEntry.properties.type === 'Farm') {
			await goto(routeBuilders.farm.detail(savedEntry.properties.id), { replaceState: true });
			return;
		}
		await goto(routeBuilders.initiative.detail(savedEntry.properties.id), { replaceState: true });
	}

	async function handleDepotEditorCancel() {
		await goto(routeBuilders.myEntries(), { replaceState: true });
	}

	async function handleDepotEditorSaved(savedDepot: DepotFeature) {
		const action = depotEditorData?.mode === 'edit' ? 'updated' : 'created';
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

	async function handleSearchSuggestionSelect(suggestion: AutocompleteSuggestion) {
		searchValue = '';
		searchSuggestions = [];
		isSearchLoading = false;
		latestSearchRequestId = -1;
		debouncedSuggestionsSearch.cancel();

		if (suggestion.type === 'location') {
			await goto(routeBuilders.discovery.location(suggestion.id));
			return;
		}

		if (suggestion.type === 'farm') {
			await goto(routeBuilders.farm.detail(suggestion.id));
			return;
		}

		if (suggestion.type === 'initiative') {
			await goto(routeBuilders.initiative.detail(suggestion.id));
			return;
		}

		if (suggestion.type === 'depot') {
			await goto(routeBuilders.depotLegacy.detail(suggestion.id));
		}
	}

	function handleCountrySelect(nextCountryCode: string) {
		onCountryChange?.(nextCountryCode);
	}

	function handleStateSelect(nextStateCode: string) {
		onStateChange?.(nextStateCode === ALL_REGIONS_VALUE ? null : nextStateCode);
	}
</script>

<SidebarShell bind:collapsed mode={shellMode}>
	{#if showDepotEditor && depotEditorData}
		{#key `${depotEditorData.mode}:${depotDetailData?.properties.id ?? 'new'}`}
			<DepotEditor
				editorData={depotEditorData}
				entry={depotDetailData}
				onCancel={handleDepotEditorCancel}
				onSaved={handleDepotEditorSaved}
			/>
		{/key}
	{:else if showEditor && editorData}
		{#key `${editorData.mode}:${editorData.entryType}:${detailData?.properties.id ?? 'new'}`}
			<EntryEditor
				{editorData}
				entry={detailData}
				onCancel={handleEditorCancel}
				onSaved={handleEditorSaved}
			/>
		{/key}
	{:else if showDetail && detailData}
		<!-- Detail View (data loaded by route +page.ts) -->
		{#key `${detailData.properties.type}:${detailData.properties.id}`}
			<EntryDetail
				entry={detailData}
				onClose={handleCloseDetail}
				onEdit={handleEditFromDetail}
				canEdit={ownedMainEntryIds.has(detailData.properties.id)}
			/>
		{/key}
	{:else}
		<MapSidebarHeader
			bind:collapsed
			bind:searchValue
			{isUserAuthenticated}
			{isMyEntriesScope}
			{showSearchSuggestions}
			{isSearchLoading}
			{searchSuggestions}
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{stateSelectValue}
			{selectedCountryLabel}
			{selectedStateLabel}
			allRegionsValue={ALL_REGIONS_VALUE}
			onOpenAllEntriesScope={handleOpenAllEntriesScope}
			onOpenMyEntriesScope={handleOpenMyEntriesScope}
			onSearchSuggestionSelect={handleSearchSuggestionSelect}
			onCountrySelect={handleCountrySelect}
			onStateSelect={handleStateSelect}
		/>
		{#if !effectiveCollapsed}
			<Sidebar.Content class="overflow-y-auto">
				{#if isMyEntriesScope}
					<MyEntriesCreateActions onCreate={handleCreateEntry} />
				{/if}
				<EntriesList
					features={visibleFeatures as EntryFeature[]}
					totalCount={baseEntries.length}
					{hasCappedEntries}
					{isMyEntriesScope}
					isLoading={isMyEntriesLoading}
					onEntryClick={(feature) => void handleEntryClick(feature)}
					onEditEntry={handleEditEntry}
					onDeleteEntry={handleDeleteEntry}
					onRowActionTrigger={stopRowActionEvent}
					{onResetView}
				/>
			</Sidebar.Content>
		{/if}
	{/if}
</SidebarShell>
