<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { ErrorState } from '$lib/components/layout';
	import { SvelteMap } from 'svelte/reactivity';
	import type {
		DepotFeature,
		EntryFeature,
		FarmFeature,
		MainEntryFeature
	} from '$lib/types/entries';
	import { cn } from '$lib/utils/tailwind';
	import * as m from '$lib/paraglide/messages.js';
	import EntryCard from './EntryCard.svelte';
	import EntryRowActions from './EntryRowActions.svelte';

	interface Props {
		features: EntryFeature[];
		isLoading?: boolean;
		/** The my-entries fetch failed; distinct from a genuinely empty account. */
		hasError?: boolean;
		onRetry?: () => void;
		onEntryClick: (feature: EntryFeature) => void;
		onEditEntry: (feature: EntryFeature, event: Event) => void;
		onDeleteEntry: (feature: EntryFeature, event: Event) => void;
		onRowActionTrigger: (event: Event) => void;
	}

	let {
		features,
		isLoading = false,
		hasError = false,
		onRetry,
		onEntryClick,
		onEditEntry,
		onDeleteEntry,
		onRowActionTrigger
	}: Props = $props();

	const SKELETON_ROW_COUNT = 5;
	const labelId = $props.id();
	const showSkeleton = $derived(isLoading && features.length === 0);

	type FarmNode = {
		kind: 'farm';
		key: string;
		farmName: string;
		isOwnFarm: boolean;
		farm?: FarmFeature;
		depots: DepotFeature[];
	};
	type EntryNode =
		| FarmNode
		| { kind: 'main'; key: string; feature: MainEntryFeature }
		| { kind: 'orphan-depot'; key: string; depot: DepotFeature };

	function depotFarm(depot: DepotFeature) {
		return depot.properties.farms?.features?.[0]?.properties;
	}

	// Depots are grouped under their farm. Own farms and initiatives keep the
	// store's recency order (features arrive pre-sorted by updatedAt); foreign
	// farms hosting the user's depots and orphan depots are appended after.
	const nodes = $derived.by<EntryNode[]>(() => {
		const ordered: EntryNode[] = [];
		const ownFarmNodes = new SvelteMap<string, FarmNode>();

		for (const feature of features) {
			const props = feature.properties;
			if (props.type === 'Farm') {
				const node: FarmNode = {
					kind: 'farm',
					key: `own:${props.id}`,
					farmName: props.name,
					isOwnFarm: true,
					farm: feature as FarmFeature,
					depots: []
				};
				ownFarmNodes.set(props.id, node);
				ordered.push(node);
			} else if (props.type === 'Initiative') {
				ordered.push({
					kind: 'main',
					key: `main:${props.id}`,
					feature: feature as MainEntryFeature
				});
			}
		}

		const foreignNodes = new SvelteMap<string, FarmNode>();
		for (const feature of features) {
			if (feature.properties.type !== 'Depot') {
				continue;
			}
			const depot = feature as DepotFeature;
			const farm = depotFarm(depot);
			if (farm && ownFarmNodes.has(farm.id)) {
				ownFarmNodes.get(farm.id)!.depots.push(depot);
			} else if (farm) {
				let node = foreignNodes.get(farm.id);
				if (!node) {
					node = {
						kind: 'farm',
						key: `foreign:${farm.id}`,
						farmName: farm.name,
						isOwnFarm: false,
						depots: []
					};
					foreignNodes.set(farm.id, node);
					ordered.push(node);
				}
				node.depots.push(depot);
			} else {
				ordered.push({ kind: 'orphan-depot', key: `depot:${depot.properties.id}`, depot });
			}
		}

		return ordered;
	});
</script>

{#snippet entryRow(feature: EntryFeature, indent: boolean)}
	<Sidebar.MenuItem data-testid="entry-item">
		<Sidebar.MenuButton
			size="lg"
			class={cn('h-auto py-3 pr-12 lg:pr-34', indent && 'pl-6')}
			data-testid="entry-row"
			onclick={() => onEntryClick(feature)}
		>
			<EntryCard entry={feature.properties} />
		</Sidebar.MenuButton>
		<EntryRowActions
			{feature}
			onEdit={onEditEntry}
			onDelete={onDeleteEntry}
			onTrigger={onRowActionTrigger}
		/>
	</Sidebar.MenuItem>
{/snippet}

<Sidebar.Group>
	<Sidebar.GroupLabel id={labelId}>
		<div class="flex items-center justify-between gap-2">
			<span>{m.map_sidebar_entries_count({ count: features.length })}</span>
			{#if isLoading}
				<span class="text-xs text-muted-foreground">{m.map_sidebar_loading()}</span>
			{/if}
		</div>
	</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		{#if showSkeleton}
			<Sidebar.Menu data-testid="entries-list" aria-busy="true" aria-labelledby={labelId}>
				{#each Array.from({ length: SKELETON_ROW_COUNT }) as _, index (index)}
					<Sidebar.MenuItem data-testid="entry-skeleton">
						<div class="flex items-start gap-3 px-2 py-3">
							<Skeleton class="size-9 shrink-0 rounded-full" />
							<div class="flex min-w-0 flex-1 flex-col gap-2">
								<Skeleton class="h-4 w-3/4" />
								<Skeleton class="h-3 w-1/2" />
							</div>
						</div>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		{:else if hasError && features.length === 0}
			<ErrorState
				title={m.map_sidebar_my_entries_error()}
				{onRetry}
				testId="my-entries-error-state"
			/>
		{:else if features.length === 0}
			<p class="px-2 py-4 text-sm text-muted-foreground">
				{m.map_sidebar_my_entries_empty()}
			</p>
		{:else}
			<Sidebar.Menu data-testid="entries-list" aria-busy={isLoading} aria-labelledby={labelId}>
				{#each nodes as node (node.key)}
					{#if node.kind === 'main'}
						{@render entryRow(node.feature, false)}
					{:else if node.kind === 'orphan-depot'}
						{@render entryRow(node.depot, false)}
					{:else}
						<div
							class="flex flex-col"
							data-testid="my-entries-farm-group"
							data-own-farm={node.isOwnFarm}
						>
							{#if node.isOwnFarm && node.farm}
								{@render entryRow(node.farm, false)}
							{:else}
								<div
									class="flex flex-col gap-0.5 px-2 pt-3 pb-1"
									data-testid="my-entries-foreign-farm-header"
								>
									<span class="text-sm font-medium text-foreground">{node.farmName}</span>
									<span class="text-xs text-muted-foreground">
										{m.details_depot_owned_by_other()}
									</span>
								</div>
							{/if}
							{#each node.depots as depot (depot.properties.id)}
								{@render entryRow(depot, true)}
							{/each}
						</div>
					{/if}
				{/each}
			</Sidebar.Menu>
		{/if}
	</Sidebar.GroupContent>
</Sidebar.Group>
