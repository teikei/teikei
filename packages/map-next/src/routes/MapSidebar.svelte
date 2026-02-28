<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button/index.js';
	import config from '$lib/config/app-configuration';
	import { Search, PanelLeftClose, PanelLeft } from 'lucide-svelte';
	import type {
		EntryFeature,
		EntryFeatureCollection,
		EntryProperties,
		MainEntryFeature
	} from '$lib/types/entries';
	import type { RegionOption } from '$lib/utils/regions';
	import EntryCard from '$lib/components/app/EntryCard.svelte';
	import EntryDetail from '$lib/components/app/EntryDetail.svelte';
	import {
		getAutocompleteSuggestions,
		type AutocompleteSuggestion
	} from '$lib/api/discovery';
	import { MAP_SIDEBAR_WIDTH_PX } from '$lib/config/layout';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { entryTypeToPlaceType, getDepotAssociatedFarmId } from '$lib/utils/places';
	import { isAuthRouteHash, routeBuilders } from '$lib/utils/routes';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

	const ALL_REGIONS_VALUE = '__all_regions__';
	const SEARCH_SUGGESTIONS_DEBOUNCE_MS = 300;
	const MIN_SEARCH_CHARS = 2;
	const { displayLocale } = config;

	interface MapSidebarProps {
		entries?: EntryFeatureCollection;
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

	// Auto-collapse when auth modal routes are active
	const isAuthModalRoute = $derived(isAuthRouteHash(page.url.hash));

	// Track previous auth route state to detect transitions
	let wasAuthModalRoute = $state(false);
	// Store the user's preferred collapsed state before auth modal opens
	let collapsedBeforeAuthModal = $state(false);

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

	// Detail view from route data (loaded by +page.ts)
	const detailData = $derived(page.data.detailData as MainEntryFeature | undefined);
	const showDetail = $derived(!!detailData);
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
	const showSearchSuggestions = $derived(!collapsed && searchValue.trim().length >= MIN_SEARCH_CHARS);

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
		if (!entries?.features) return [];
		return entries.features;
	});

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

		if (props.type === 'Depot') {
			try {
				const farmId = await getDepotAssociatedFarmId(props.id);
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
		const placeType = entryTypeToPlaceType(props.type);
		await goto(routeBuilders.placeDetail(placeType, props.id));
	}

	function handleCloseDetail() {
		goto(routeBuilders.home());
		onDetailClose?.();
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
	class="pointer-events-auto absolute top-2.5 left-2.5 z-1000 flex shadow {collapsed
		? ''
		: 'bottom-2.5'}"
>
	<Sidebar.Provider open={true} class="min-h-0 {collapsed ? 'h-auto' : 'h-full'}">
		<Sidebar.Root
			variant="floating"
			collapsible="none"
			style={`width: ${MAP_SIDEBAR_WIDTH_PX}px;`}
			class="rounded-lg border border-sidebar-border transition-[height] duration-200 ease-in-out {collapsed
				? 'h-auto'
				: 'h-full'}"
		>
			{#if showDetail && detailData}
				<!-- Detail View (data loaded by route +page.ts) -->
				<EntryDetail entry={detailData} onClose={handleCloseDetail} />
			{:else}
				<!-- List View -->
				<Sidebar.Header>
					<div class="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							class="size-8 shrink-0"
							onclick={() => (collapsed = !collapsed)}
						>
							{#if collapsed}
								<PanelLeft class="size-4" />
							{:else}
								<PanelLeftClose class="size-4" />
							{/if}
							<span class="sr-only">{m.map_sidebar_toggle()}</span>
						</Button>
						<div class="relative flex-1">
							<Search
								class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Sidebar.Input
								placeholder={m.map_sidebar_search_placeholder()}
								bind:value={searchValue}
								class="pl-8"
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
					{#if !collapsed}
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
						<Sidebar.Group>
							<Sidebar.GroupLabel>
								<div class="flex items-center justify-between gap-2">
									<span>{m.map_sidebar_entries()} ({filteredFeatures.length})</span>
								</div>
							</Sidebar.GroupLabel>
							<Sidebar.GroupContent>
								<Sidebar.Menu>
									{#each filteredFeatures as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
										{@const props = feature.properties as EntryProperties}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton
												size="lg"
												class="h-auto py-3"
												onclick={() => void handleEntryClick(feature as EntryFeature)}
											>
												<EntryCard entry={props} />
											</Sidebar.MenuButton>
										</Sidebar.MenuItem>
									{:else}
										<p class="px-2 py-4 text-sm text-muted-foreground">
											{m.map_sidebar_no_entries_found()}
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
