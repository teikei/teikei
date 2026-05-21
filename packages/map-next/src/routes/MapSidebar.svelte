<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteSet, SvelteURLSearchParams } from 'svelte/reactivity';
	import { getCurrentUser, isInitialized } from '$lib/stores/auth.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import { AppButton, IconButton } from '$lib/components/actions';
	import config from '$lib/config/app-configuration';
	import { Search, PanelLeftClose, PanelLeft, MoreHorizontal } from 'lucide-svelte';
	import type {
		DepotFeature,
		EntryFeature,
		EntryFeatureCollection,
		EntryProperties,
		MainEntryFeature
	} from '$lib/types/entries';
	import type { RegionOption } from '$lib/utils/regions';
	import EntryCard from './map-sidebar/EntryCard.svelte';
	import EntryDetail from './map-sidebar/EntryDetail.svelte';
	import EntryEditor from './map-sidebar/EntryEditor.svelte';
	import DepotEditor from './map-sidebar/DepotEditor.svelte';
	import { getAssociatedFarmIdForDepot } from '$lib/api/entry-details';
	import { getAutocompleteSuggestions, type AutocompleteSuggestion } from '$lib/api/discovery';
	import { deleteDepot } from '$lib/api/entry-mutations';
	import { MAP_SIDEBAR_WIDTH_PX } from '$lib/config/layout';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { mainEntryTypeToResource } from '$lib/utils/main-entries';
	import { isAuthRouteHash, parseHashRoute, routeBuilders } from '$lib/utils/routes';
	import type { DepotEditorData, EntryEditorData } from '$lib/types/editor';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

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
		onStateChange
	}: MapSidebarProps = $props();

	let searchValue = $state('');
	let searchSuggestions: AutocompleteSuggestion[] = $state([]);
	let isSearchLoading = $state(false);
	let latestSearchRequestId = $state(0);
	let collapsed = $state(false);
	let latestInteractionId = $state(0);
	let isDepotDeletePending = $state(false);

	const parsedRoute = $derived(parseHashRoute(page.url.hash));

	// Auto-collapse when auth modal routes are active
	const isAuthModalRoute = $derived(isAuthRouteHash(page.url.hash));
	const routeKind = $derived(parsedRoute.kind);
	const isUserAuthenticated = $derived(!!getCurrentUser());
	const isAuthInitialized = $derived(isInitialized());
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
	const detailData = $derived(page.data.detailData as MainEntryFeature | undefined);
	const editorData = $derived(page.data.editorData as EntryEditorData | undefined);
	const depotDetailData = $derived(page.data.depotDetailData as DepotFeature | undefined);
	const depotEditorData = $derived(page.data.depotEditorData as DepotEditorData | undefined);
	const showDetail = $derived(!!detailData);
	const showEditor = $derived(!!editorData);
	const showDepotEditor = $derived(!!depotEditorData);
	const isNonListMode = $derived(showDetail || showEditor || showDepotEditor);
	const isEditorMode = $derived(showEditor || showDepotEditor);
	const depotMutationFeedback = $derived.by(() => {
		if (routeKind !== 'myentries') {
			return null;
		}

		const action = parsedRoute.query.get('depotAction');
		if (action !== 'created' && action !== 'updated' && action !== 'deleted') {
			return null;
		}

		return {
			action,
			farmId: parsedRoute.query.get('farmId')
		};
	});
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
	const mobileShellPositionClass = $derived.by(() => {
		if (collapsed) {
			return 'top-auto bottom-2.5 h-auto';
		}
		if (isEditorMode) {
			return 'top-2.5 bottom-2.5';
		}
		return 'bottom-2.5 h-[min(70vh,36rem)]';
	});
	const desktopShellPositionClass = $derived(
		collapsed ? 'md:top-2.5 md:bottom-auto' : 'md:top-2.5 md:bottom-2.5'
	);
	const sidebarRootHeightClass = $derived(collapsed ? 'h-auto' : 'h-full');

	$effect(() => {
		// Keep detail/editor routes reachable: avoid rendering them in collapsed shell mode.
		if (isNonListMode && collapsed) {
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

	const filteredFeatures = $derived.by(() => {
		return baseEntries;
	});
	const visibleFeatures = $derived.by(() => {
		return filteredFeatures.slice(0, MAX_VISIBLE_ENTRIES);
	});
	const hasCappedEntries = $derived(filteredFeatures.length > visibleFeatures.length);

	function stopRowActionEvent(event: Event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function buildMyEntriesDepotFeedbackRoute(
		action: 'created' | 'updated' | 'deleted',
		farmId?: string | null
	): string {
		const params = new SvelteURLSearchParams({ depotAction: action });
		if (farmId) {
			params.set('farmId', farmId);
		}
		return `${routeBuilders.myEntries()}?${params.toString()}`;
	}

	function getFirstAssociatedFarmId(depot: DepotFeature): string | null {
		return depot.properties.farms?.features?.[0]?.properties?.id ?? null;
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
		if (feature.properties.type !== 'Depot') {
			if (dev) {
				console.info(
					`[T10] delete action clicked for ${feature.properties.type}:${feature.properties.id} (execution deferred beyond T12)`
				);
			}
			return;
		}

		if (isDepotDeletePending) {
			return;
		}

		const confirmed = window.confirm(m.editor_depot_delete_confirm());
		if (!confirmed) {
			return;
		}

		isDepotDeletePending = true;
		try {
			await deleteDepot(feature.properties.id);
			await goto(buildMyEntriesDepotFeedbackRoute('deleted'), { replaceState: true });
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete depot ${feature.properties.id}`, error);
			}
		} finally {
			isDepotDeletePending = false;
		}
	}

	function handleDismissDepotFeedback() {
		void goto(routeBuilders.myEntries(), { replaceState: true });
	}

	function handleViewAssociatedFarmFromFeedback(farmId: string | null) {
		if (!farmId) {
			return;
		}
		void goto(routeBuilders.farm.detail(farmId));
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
		await goto(buildMyEntriesDepotFeedbackRoute(action, getFirstAssociatedFarmId(savedDepot)), {
			replaceState: true
		});
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

<div
	style={`--map-sidebar-width: ${MAP_SIDEBAR_WIDTH_PX}px;`}
	class="pointer-events-auto absolute right-2.5 left-2.5 z-1000 flex shadow md:right-auto md:h-auto md:w-[28rem] md:max-w-[calc(100vw-1.25rem)] lg:w-[var(--map-sidebar-width)] {mobileShellPositionClass} {desktopShellPositionClass}"
	data-testid="map-sidebar-shell"
>
	<Sidebar.Provider open={true} class="min-h-0 {sidebarRootHeightClass}">
		<Sidebar.Root
			variant="floating"
			collapsible="none"
			class="w-full rounded-lg border border-sidebar-border transition-[height] duration-200 ease-in-out {sidebarRootHeightClass}"
		>
			{#if showDepotEditor && depotEditorData}
				<DepotEditor
					editorData={depotEditorData}
					entry={depotDetailData}
					onCancel={handleDepotEditorCancel}
					onSaved={handleDepotEditorSaved}
				/>
			{:else if showEditor && editorData}
				<EntryEditor
					{editorData}
					entry={detailData}
					onCancel={handleEditorCancel}
					onSaved={handleEditorSaved}
				/>
			{:else if showDetail && detailData}
				<!-- Detail View (data loaded by route +page.ts) -->
				<EntryDetail
					entry={detailData}
					onClose={handleCloseDetail}
					onEdit={handleEditFromDetail}
					canEdit={ownedMainEntryIds.has(detailData.properties.id)}
				/>
			{:else}
				<!-- List View -->
				<Sidebar.Header>
					{#if !showDetail && isUserAuthenticated}
						<div class="mb-2 grid grid-cols-2 gap-2" data-testid="scope-switch">
							<AppButton
								variant={isMyEntriesScope ? 'outline' : 'default'}
								onclick={handleOpenAllEntriesScope}
								data-testid="scope-all-entries"
							>
								{m.map_sidebar_scope_all_entries()}
							</AppButton>
							<AppButton
								variant={isMyEntriesScope ? 'default' : 'outline'}
								onclick={handleOpenMyEntriesScope}
								data-testid="scope-my-entries"
							>
								{m.map_sidebar_scope_my_entries()}
							</AppButton>
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<IconButton
							class="sixe-shrink-0"
							data-testid="sidebar-collapse-toggle"
							label={m.map_sidebar_toggle()}
							onclick={() => (collapsed = !collapsed)}
						>
							{#if collapsed}
								<PanelLeft class="size-4" />
							{:else}
								<PanelLeftClose class="size-4" />
							{/if}
						</IconButton>
						<div class="relative flex-1">
							<Search
								class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Sidebar.Input
								placeholder={m.map_sidebar_search_placeholder()}
								aria-label={m.map_sidebar_search_placeholder()}
								bind:value={searchValue}
								class="pl-8"
								disabled={isMyEntriesScope}
							/>
							{#if showSearchSuggestions}
								<div
									data-testid="search-suggestions"
									class="absolute top-full right-0 left-0 z-[1200] mt-1 rounded-md border border-input bg-background shadow-sm"
								>
									{#if isSearchLoading}
										<p class="px-3 py-2 text-sm text-muted-foreground">
											{m.map_sidebar_search_loading()}
										</p>
									{:else if searchSuggestions.length === 0}
										<p class="px-3 py-2 text-sm text-muted-foreground">
											{m.map_sidebar_search_no_results()}
										</p>
									{:else}
										<ul class="max-h-56 overflow-y-auto py-1">
											{#each searchSuggestions as suggestion (`${suggestion.type}-${suggestion.id}`)}
												<li>
													<button
														type="button"
														class="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
														onclick={() => void handleSearchSuggestionSelect(suggestion)}
													>
														<span class="line-clamp-1">{suggestion.title}</span>
													</button>
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							{/if}
						</div>
					</div>
					{#if !collapsed && !isMyEntriesScope}
						<div class="mt-2 grid grid-cols-2 gap-2">
							<div class="flex min-w-0 flex-col gap-1">
								<span class="px-1 text-xs text-muted-foreground"
									>{m.map_sidebar_country_label()}</span
								>
								<Select.Root
									type="single"
									value={selectedCountry}
									onValueChange={handleCountrySelect}
								>
									<Select.Trigger id="country-browse-select" class="w-full bg-background">
										{selectedCountryLabel}
									</Select.Trigger>
									<Select.Content class="z-[1200]">
										{#each countryOptions as option (option.value)}
											<Select.Item value={option.value} label={option.label} />
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							<div class="flex min-w-0 flex-col gap-1">
								<span class="px-1 text-xs text-muted-foreground"
									>{m.map_sidebar_region_label()}</span
								>
								<Select.Root
									type="single"
									value={stateSelectValue}
									onValueChange={handleStateSelect}
									disabled={stateOptions.length === 0}
								>
									<Select.Trigger id="region-browse-select" class="w-full bg-background">
										{selectedStateLabel}
									</Select.Trigger>
									<Select.Content class="z-[1200]">
										<Select.Item value={ALL_REGIONS_VALUE} label={m.map_sidebar_all_regions()} />
										{#each stateOptions as option (option.value)}
											<Select.Item value={option.value} label={option.label} />
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					{/if}
				</Sidebar.Header>
				{#if !collapsed}
					<Sidebar.Content class="overflow-y-auto">
						{#if isMyEntriesScope && depotMutationFeedback}
							<div
								class="mx-2 mt-2 rounded-md border border-success-border bg-success-muted p-3 text-sm text-success-foreground"
								data-testid="depot-mutation-feedback"
							>
								<p>
									{depotMutationFeedback.action === 'created'
										? m.editor_depot_saved_created()
										: depotMutationFeedback.action === 'updated'
											? m.editor_depot_saved_updated()
											: m.editor_depot_saved_deleted()}
								</p>
								<div class="mt-2 flex flex-wrap items-center gap-2">
									{#if depotMutationFeedback.farmId}
										<AppButton
											type="button"
											variant="outline"
											data-testid="view-associated-farm-action"
											onclick={() =>
												handleViewAssociatedFarmFromFeedback(depotMutationFeedback.farmId)}
										>
											{m.editor_depot_view_associated_farm()}
										</AppButton>
									{/if}
									<AppButton
										type="button"
										variant="outline"
										data-testid="dismiss-depot-feedback"
										onclick={handleDismissDepotFeedback}
									>
										{m.editor_depot_dismiss_feedback()}
									</AppButton>
								</div>
							</div>
						{/if}
						{#if isMyEntriesScope}
							<div
								class="sticky top-0 z-20 border-b bg-sidebar px-2 pb-2"
								data-testid="my-entries-create-actions"
							>
								<div class="grid grid-cols-3 gap-2 pt-2">
									<AppButton
										type="button"
										variant="outline"
										data-testid="create-farm-action"
										onclick={(event) => handleCreateEntry('Farm', event)}
									>
										{m.map_sidebar_new_farm()}
									</AppButton>
									<AppButton
										type="button"
										variant="outline"
										data-testid="create-depot-action"
										onclick={(event) => handleCreateEntry('Depot', event)}
									>
										{m.map_sidebar_new_depot()}
									</AppButton>
									<AppButton
										type="button"
										variant="outline"
										data-testid="create-initiative-action"
										onclick={(event) => handleCreateEntry('Initiative', event)}
									>
										{m.map_sidebar_new_initiative()}
									</AppButton>
								</div>
							</div>
						{/if}
						<Sidebar.Group>
							<Sidebar.GroupLabel>
								<div class="flex items-center justify-between gap-2">
									<span>{m.map_sidebar_entries()} ({filteredFeatures.length})</span>
									{#if isMyEntriesScope && isMyEntriesLoading}
										<span class="text-xs text-muted-foreground">{m.map_sidebar_loading()}</span>
									{/if}
								</div>
								{#if hasCappedEntries}
									<p class="mt-1 text-xs text-muted-foreground" data-testid="entries-cap-indicator">
										{visibleFeatures.length}/{filteredFeatures.length}
									</p>
								{/if}
							</Sidebar.GroupLabel>
							<Sidebar.GroupContent>
								<Sidebar.Menu
									data-testid="entries-list"
									aria-busy={isMyEntriesScope && isMyEntriesLoading}
								>
									{#each visibleFeatures as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
										{@const props = feature.properties as EntryProperties}
										<Sidebar.MenuItem data-testid="entry-item">
											<Sidebar.MenuButton
												size="lg"
												class="h-auto py-3 {isMyEntriesScope ? 'pr-12 lg:pr-34' : ''}"
												data-testid="entry-row"
												onclick={() => void handleEntryClick(feature as EntryFeature)}
											>
												<EntryCard entry={props} />
											</Sidebar.MenuButton>
											{#if isMyEntriesScope}
												<div
													class="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-1 lg:flex"
													data-testid="entry-row-actions-desktop"
												>
													<AppButton
														type="button"
														variant="outline"
														data-testid="entry-action-edit-inline"
														onclick={(event) => handleEditEntry(feature as EntryFeature, event)}
													>
														{m.map_sidebar_action_edit()}
													</AppButton>
													<AppButton
														type="button"
														variant="outline"
														data-testid="entry-action-delete-inline"
														onclick={(event) => handleDeleteEntry(feature as EntryFeature, event)}
													>
														{m.map_sidebar_action_delete()}
													</AppButton>
												</div>
												<div
													class="absolute top-1/2 right-2 -translate-y-1/2 lg:hidden"
													data-testid="entry-row-actions-mobile"
												>
													<DropdownMenu.Root>
														<DropdownMenu.Trigger>
															<IconButton
																type="button"
																data-testid="entry-actions-overflow-trigger"
																label={m.map_sidebar_row_actions()}
																onclick={(event) => stopRowActionEvent(event)}
															>
																<MoreHorizontal class="size-4" />
															</IconButton>
														</DropdownMenu.Trigger>
														<DropdownMenu.Content align="end" class="z-[1200]">
															<DropdownMenu.Item
																data-testid="entry-action-edit-overflow"
																onclick={(event) => handleEditEntry(feature as EntryFeature, event)}
															>
																{m.map_sidebar_action_edit()}
															</DropdownMenu.Item>
															<DropdownMenu.Item
																data-testid="entry-action-delete-overflow"
																onclick={(event) =>
																	handleDeleteEntry(feature as EntryFeature, event)}
															>
																{m.map_sidebar_action_delete()}
															</DropdownMenu.Item>
														</DropdownMenu.Content>
													</DropdownMenu.Root>
												</div>
											{/if}
										</Sidebar.MenuItem>
									{:else}
										<p class="px-2 py-4 text-sm text-muted-foreground">
											{isMyEntriesScope
												? m.map_sidebar_my_entries_empty()
												: m.map_sidebar_no_entries_found()}
										</p>
									{/each}
								</Sidebar.Menu>
							</Sidebar.GroupContent>
						</Sidebar.Group>
					</Sidebar.Content>
				{/if}
			{/if}
		</Sidebar.Root>
	</Sidebar.Provider>
</div>
