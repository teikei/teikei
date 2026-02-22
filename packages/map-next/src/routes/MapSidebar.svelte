<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Search, PanelLeftClose, PanelLeft } from 'lucide-svelte';
	import type {
		EntryFeature,
		EntryFeatureCollection,
		EntryProperties,
		MainEntryFeature
	} from '$lib/types/entries';
	import EntryCard from '$lib/components/app/EntryCard.svelte';
	import EntryDetail from '$lib/components/app/EntryDetail.svelte';
	import { MAP_SIDEBAR_WIDTH_PX } from '$lib/config/layout';
	import { entryTypeToPlaceType, getDepotAssociatedFarmId } from '$lib/utils/places';
	import { isAuthRouteHash, routeBuilders } from '$lib/utils/routes';
	import { dev } from '$app/environment';

	interface MapSidebarProps {
		entries?: EntryFeatureCollection;
		onEntryClick?: (feature: EntryFeature) => void;
		onDetailClose?: () => void;
	}

	let { entries, onEntryClick, onDetailClose }: MapSidebarProps = $props();

	let searchValue = $state('');
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

	// Track when detail route changes to trigger map pan
	let lastDetailId = $state<string | null>(null);

	$effect(() => {
		if (detailData && detailData.properties.id !== lastDetailId) {
			// Pan from resolved detail data (works for deep-link and redirect loads, too).
			onEntryClick?.(detailData as EntryFeature);
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
		if (!searchValue.trim()) return entries.features;

		const search = searchValue.toLowerCase();
		return entries.features.filter((feature) => {
			const props = feature.properties as EntryProperties;
			return (
				props.name?.toLowerCase().includes(search) ||
				props.city?.toLowerCase().includes(search) ||
				props.postalcode?.toLowerCase().includes(search)
			);
		});
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
						onEntryClick?.(associatedFarmFeature as EntryFeature);
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
			onEntryClick?.(feature);
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
												onclick={() => void handleEntryClick(feature as EntryFeature)}
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
