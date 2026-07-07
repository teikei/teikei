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

	const depotFeatures = $derived<Feature<Point, DepotProperties>[]>(
		properties?.depots?.features ?? []
	);

	function formatDepotAddress(depot: DepotProperties): string {
		const line = [depot.postalcode, depot.city].filter(Boolean).join(' ');
		return [depot.address, line].filter(Boolean).join(', ');
	}
</script>

{#if depotFeatures.length > 0 || (isFarmOwner && onAddDepot)}
	<ProfileSection testId="farm-depots">
		<div class="flex items-center justify-between gap-2">
			<Heading level={5}>{m.details_connected_depots()}</Heading>
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
			{#each depotFeatures as depot (depot.properties.id)}
				{@const isOwned = ownedDepotIds.has(depot.properties.id)}
				<li>
					<div
						class="flex flex-col gap-2 rounded-md border p-3"
						data-testid="depot-card"
						data-depot-id={depot.properties.id}
						data-depot-owned={isOwned}
					>
						<button
							type="button"
							class="flex flex-col gap-0.5 text-left"
							data-testid="depot-card-select"
							onclick={() => onDepotSelect?.(depot as DepotFeature)}
						>
							<span class="text-sm font-medium text-foreground">{depot.properties.name}</span>
							{#if formatDepotAddress(depot.properties)}
								<span class="text-sm text-muted-foreground">
									{formatDepotAddress(depot.properties)}
								</span>
							{/if}
							{#if depot.properties.deliveryDays}
								<span class="text-xs text-muted-foreground">
									{m.editor_depot_field_delivery_days()}: {depot.properties.deliveryDays}
								</span>
							{/if}
						</button>
						{#if isOwned}
							<div class="flex items-center gap-2">
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
									variant="outline"
									data-testid="depot-card-delete"
									onclick={() => onDepotDelete?.(depot as DepotFeature)}
								>
									{m.map_sidebar_action_delete()}
								</AppButton>
							</div>
						{:else}
							<span class="text-xs text-muted-foreground" data-testid="depot-card-foreign-hint">
								{m.details_depot_owned_by_other()}
							</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</ProfileSection>
{/if}
