<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Search, Wheat, Store, Users } from 'lucide-svelte';
	import type { FeatureCollection, Feature } from 'geojson';
	import type { EntryProperties, EntryType } from '$lib/types/entries';

	interface MapSidebarProps {
		entries?: FeatureCollection;
	}

	let { entries }: MapSidebarProps = $props();

	let searchValue = $state('');

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

	function getEntryIcon(type: EntryType) {
		switch (type) {
			case 'Farm':
				return Wheat;
			case 'Depot':
				return Store;
			case 'Initiative':
				return Users;
		}
	}

	function formatAddress(props: EntryProperties): string {
		const parts = [props.postalcode, props.city].filter(Boolean);
		return parts.join(' ');
	}
</script>

<div class="pointer-events-auto absolute top-2.5 bottom-2.5 left-2.5 z-20 flex shadow">
	<Sidebar.Provider open={true} class="h-full min-h-0">
		<Sidebar.Root
			variant="floating"
			collapsible="none"
			class="h-full w-[400px] rounded-lg border border-sidebar-border"
		>
			<Sidebar.Header>
				<div class="relative">
					<Search
						class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Sidebar.Input placeholder="Search..." bind:value={searchValue} class="pl-8" />
				</div>
			</Sidebar.Header>
			<Sidebar.Content class="overflow-y-auto">
				<Sidebar.Group>
					<Sidebar.GroupLabel>
						Entries ({filteredFeatures.length})
					</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each filteredFeatures as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
								{@const props = feature.properties as EntryProperties}
								{@const Icon = getEntryIcon(props.type)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton size="lg" class="h-auto py-3">
										<div class="flex shrink-0 items-center justify-center">
											<Icon class="size-5" />
										</div>
										<div class="flex min-w-0 flex-col gap-0.5">
											<span class="truncate font-medium">{props.name}</span>
											<span class="truncate text-xs text-muted-foreground">
												{props.type} · {formatAddress(props)}
											</span>
										</div>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{:else}
								<p class="px-2 py-4 text-sm text-muted-foreground">No entries found</p>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			</Sidebar.Content>
		</Sidebar.Root>
	</Sidebar.Provider>
</div>
