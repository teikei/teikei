<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Search, PanelLeftClose, PanelLeft } from 'lucide-svelte';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { EntryProperties } from '$lib/types/entries';
	import type { PlaceDetailFeature } from '$lib/types/place-details';
	import EntryCard from '$lib/components/app/EntryCard.svelte';
	import EntryDetail from '$lib/components/app/EntryDetail.svelte';
	import { entryTypeToPlaceType } from '$lib/api/places';
	import { isAuthRouteHash, routeBuilders } from '$lib/utils/routes';

	interface MapSidebarProps {
		entries?: FeatureCollection;
		onEntryClick?: (feature: Feature<Point, EntryProperties>) => void;
		onDetailClose?: () => void;
	}

	let { entries, onEntryClick, onDetailClose }: MapSidebarProps = $props();

	let searchValue = $state('');
	let collapsed = $state(false);

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
	const detailData = $derived(page.data.detailData as PlaceDetailFeature | undefined);
	const showDetail = $derived(!!detailData);

	// Track when detail route changes to trigger map pan
	let lastDetailId = $state<string | null>(null);

	$effect(() => {
		if (detailData && detailData.properties.id !== lastDetailId) {
			// Find the corresponding entry in the entries list and pan the map
			const entry = entries?.features.find(
				(f: Feature) => f.properties?.id === detailData.properties.id
			);
			if (entry) {
				onEntryClick?.(entry as Feature<Point, EntryProperties>);
			}
			lastDetailId = detailData.properties.id;
		} else if (!detailData) {
			lastDetailId = null;
		}
	});

	// Expose function to open detail view from outside (e.g., map click)
	export function openDetailView(feature: Feature<Point, EntryProperties>) {
		handleEntryClick(feature);
	}

	const filteredFeatures = $derived.by(() => {
		if (!entries?.features) return [];
		if (!searchValue.trim()) return entries.features;

		const search = searchValue.toLowerCase();
		return entries.features.filter((feature: Feature) => {
			const props = feature.properties as EntryProperties;
			return (
				props.name?.toLowerCase().includes(search) ||
				props.city?.toLowerCase().includes(search) ||
				props.postalcode?.toLowerCase().includes(search)
			);
		});
	});

	function handleEntryClick(feature: Feature<Point, EntryProperties>) {
		const props = feature.properties;

		// Only navigate to detail for Farm and Initiative
		if (props.type !== 'Farm' && props.type !== 'Initiative') {
			// For Depot, just trigger the map click handler without showing detail
			onEntryClick?.(feature);
			return;
		}

		// Trigger map click handler (for panning/popup)
		onEntryClick?.(feature);

		// Navigate to detail route
		const placeType = entryTypeToPlaceType(props.type);
		goto(routeBuilders.placeDetail(placeType, props.id));
	}

	function handleCloseDetail() {
		goto(routeBuilders.home());
		onDetailClose?.();
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
			class="w-[500px] rounded-lg border border-sidebar-border transition-[height] duration-200 ease-in-out {collapsed
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
							<span class="sr-only">Toggle sidebar</span>
						</Button>
						<div class="relative flex-1">
							<Search
								class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Sidebar.Input placeholder="Search..." bind:value={searchValue} class="pl-8" />
						</div>
					</div>
				</Sidebar.Header>
				{#if !collapsed}
					<Sidebar.Content class="overflow-y-auto">
						<Sidebar.Group>
							<Sidebar.GroupLabel>
								Entries ({filteredFeatures.length})
							</Sidebar.GroupLabel>
							<Sidebar.GroupContent>
								<Sidebar.Menu>
									{#each filteredFeatures as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
										{@const props = feature.properties as EntryProperties}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton
												size="lg"
												class="h-auto py-3"
												onclick={() => handleEntryClick(feature as Feature<Point, EntryProperties>)}
											>
												<EntryCard entry={props} />
											</Sidebar.MenuButton>
										</Sidebar.MenuItem>
									{:else}
										<p class="px-2 py-4 text-sm text-muted-foreground">No entries found</p>
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
