<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Search, PanelLeftClose, PanelLeft, Loader2 } from 'lucide-svelte';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { EntryProperties } from '$lib/types/entries';
	import type { PlaceDetailFeature } from '$lib/types/place-details';
	import EntryCard from '$lib/components/app/EntryCard.svelte';
	import EntryDetail from '$lib/components/app/EntryDetail.svelte';
	import { getPlace, entryTypeToPlaceType } from '$lib/api/places';
	import * as m from '$lib/paraglide/messages.js';

	interface MapSidebarProps {
		entries?: FeatureCollection;
		onEntryClick?: (feature: Feature<Point, EntryProperties>) => void;
		onDetailClose?: () => void;
	}

	let { entries, onEntryClick, onDetailClose }: MapSidebarProps = $props();

	let searchValue = $state('');
	let collapsed = $state(false);

	// Auto-collapse when auth modal routes are active
	const isAuthModalRoute = $derived(
		page.url.hash.includes('/users/signin') ||
			page.url.hash.includes('/users/signup') ||
			page.url.hash.includes('/users/editaccount') ||
			page.url.hash.includes('/users/editpassword') ||
			page.url.hash.includes('/users/recoverpassword') ||
			page.url.hash.includes('/users/resetpassword')
	);

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

	// Detail view state
	let showDetail = $state(false);
	let detailData = $state<PlaceDetailFeature | null>(null);
	let isLoadingDetail = $state(false);
	let detailError = $state<string | null>(null);

	// Expose function to open detail view from outside (e.g., map click)
	export async function openDetailView(feature: Feature<Point, EntryProperties>) {
		await handleEntryClick(feature);
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

	async function handleEntryClick(feature: Feature<Point, EntryProperties>) {
		const props = feature.properties;

		// Only show detail view for Farm and Initiative
		if (props.type !== 'Farm' && props.type !== 'Initiative') {
			// For Depot, just trigger the map click handler without showing detail
			onEntryClick?.(feature);
			return;
		}

		// Trigger map click handler (for panning/popup)
		onEntryClick?.(feature);

		// Start loading detail
		isLoadingDetail = true;
		detailError = null;
		showDetail = true;

		try {
			const placeType = entryTypeToPlaceType(props.type);
			detailData = await getPlace(placeType, props.id);
		} catch (error) {
			console.error('Failed to load place details:', error);
			detailError = m.details_error();
			detailData = null;
		} finally {
			isLoadingDetail = false;
		}
	}

	function handleCloseDetail() {
		showDetail = false;
		detailData = null;
		detailError = null;
		onDetailClose?.();
	}
</script>

<div
	class="pointer-events-auto absolute top-2.5 left-2.5 z-20 flex shadow {collapsed
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
			{#if showDetail}
				<!-- Detail View -->
				{#if isLoadingDetail}
					<div class="flex h-full items-center justify-center p-8">
						<div class="flex items-center gap-2 text-muted-foreground">
							<Loader2 class="size-5 animate-spin" />
							<span>{m.details_loading()}</span>
						</div>
					</div>
				{:else if detailError}
					<div class="flex h-full flex-col items-center justify-center gap-4 p-8">
						<p class="text-sm text-destructive">{detailError}</p>
						<Button variant="outline" size="sm" onclick={handleCloseDetail}>
							{m.nav_go_back()}
						</Button>
					</div>
				{:else if detailData}
					<EntryDetail entry={detailData} onClose={handleCloseDetail} />
				{/if}
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
