<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { AppButton } from '$lib/components/actions';
	import { Heading } from '$lib/components/typography';
	import type { DepotFeature, DepotProperties, FarmProperties } from '$lib/types/entries';
	import type { Feature, Point } from 'geojson';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

	interface Props {
		properties?: FarmProperties;
		/** Ids of depots owned by the signed-in user (drives edit/delete affordances). */
		ownedDepotIds?: ReadonlySet<string>;
		/** Whether the signed-in user owns this farm (drives "add pickup location"). */
		isFarmOwner?: boolean;
		onDepotSelect?: (depot: DepotFeature) => void;
		onDepotEdit?: (depot: DepotFeature) => void;
		onDepotDelete?: (depot: DepotFeature) => void;
		onAddDepot?: () => void;
	}

	let {
		properties,
		ownedDepotIds = new Set<string>(),
		isFarmOwner = false,
		onDepotSelect,
		onDepotEdit,
		onDepotDelete,
		onAddDepot
	}: Props = $props();

	/** Collapse the list once it grows past this many rows. */
	const DEPOT_COLLAPSE_LIMIT = 5;

	const depotFeatures = $derived<Feature<Point, DepotProperties>[]>(
		properties?.depots?.features ?? []
	);

	let expanded = $state(false);

	const canCollapse = $derived(depotFeatures.length > DEPOT_COLLAPSE_LIMIT);
	const visibleDepots = $derived(
		canCollapse && !expanded ? depotFeatures.slice(0, DEPOT_COLLAPSE_LIMIT) : depotFeatures
	);

	function formatDepotPlace(depot: DepotProperties): string {
		return [depot.postalcode, depot.city].filter(Boolean).join(' ');
	}
</script>

{#if depotFeatures.length > 0 || (isFarmOwner && onAddDepot)}
	<ProfileSection testId="farm-depots">
		<div class="flex items-center justify-between gap-2">
			<Heading level={5}>
				{depotFeatures.length > 0
					? m.details_connected_depots_count({ count: depotFeatures.length })
					: m.details_connected_depots()}
			</Heading>
			{#if isFarmOwner && onAddDepot}
				<AppButton
					type="button"
					variant="outline"
					data-testid="farm-add-depot"
					onclick={onAddDepot}
				>
					{m.farm_detail_add_depot()}
				</AppButton>
			{/if}
		</div>
		<ul class="flex flex-col gap-2">
			{#each visibleDepots as depot (depot.properties.id)}
				{@const isOwned = ownedDepotIds.has(depot.properties.id)}
				<li>
					<div
						class="flex items-center justify-between gap-3 rounded-md border p-3"
						data-testid="depot-card"
						data-depot-id={depot.properties.id}
						data-depot-owned={isOwned}
					>
						<button
							type="button"
							class="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
							data-testid="depot-card-select"
							onclick={() => onDepotSelect?.(depot as DepotFeature)}
						>
							<span class="truncate text-sm font-medium text-foreground">
								{depot.properties.name}
							</span>
							{#if formatDepotPlace(depot.properties)}
								<span class="truncate text-sm text-muted-foreground">
									{formatDepotPlace(depot.properties)}
								</span>
							{/if}
						</button>
						{#if isOwned}
							<div class="flex shrink-0 items-center gap-2">
								<AppButton
									type="button"
									variant="outline"
									data-testid="depot-card-edit"
									onclick={() => onDepotEdit?.(depot as DepotFeature)}
								>
									{m.map_sidebar_action_edit()}
								</AppButton>
								<AppButton
									type="button"
									variant="destructive"
									data-testid="depot-card-delete"
									onclick={() => onDepotDelete?.(depot as DepotFeature)}
								>
									{m.map_sidebar_action_delete()}
								</AppButton>
							</div>
						{:else if isFarmOwner}
							<span
								class="shrink-0 text-xs text-muted-foreground"
								data-testid="depot-card-foreign-hint"
							>
								{m.details_depot_owned_by_other()}
							</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		{#if canCollapse}
			<AppButton
				type="button"
				variant="ghost"
				data-testid="farm-depots-toggle"
				aria-expanded={expanded}
				onclick={() => (expanded = !expanded)}
			>
				{expanded
					? m.details_depots_show_less()
					: m.details_depots_show_all({ count: depotFeatures.length })}
			</AppButton>
		{/if}
	</ProfileSection>
{/if}
