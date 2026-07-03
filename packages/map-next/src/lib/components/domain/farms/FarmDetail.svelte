<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { DepotFeature, DepotProperties, FarmProperties } from '$lib/types/entries';
	import { translateProduct, translateCategory } from '$lib/utils/translations';
	import { AppButton } from '$lib/components/actions';
	import BadgesList from '../entries/BadgesList.svelte';
	import type { Feature } from 'geojson';
	import type { Point } from 'geojson';

	interface FarmDetailProps {
		properties: FarmProperties;
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
	}: FarmDetailProps = $props();

	// Group products by category
	const productsByCategory = $derived.by(() => {
		const grouped: Record<string, { name: string }[]> = {};
		for (const product of properties.products || []) {
			if (!grouped[product.category]) {
				grouped[product.category] = [];
			}
			grouped[product.category].push({ name: product.name });
		}
		return grouped;
	});

	const categories = $derived(Object.keys(productsByCategory));

	const depotFeatures = $derived<Feature<Point, DepotProperties>[]>(
		properties.depots?.features ?? []
	);

	function formatDepotAddress(depot: DepotProperties): string {
		const line = [depot.postalcode, depot.city].filter(Boolean).join(' ');
		return [depot.address, line].filter(Boolean).join(', ');
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Products by category -->
	{#each categories as category (category)}
		<div class="flex flex-col gap-1">
			<h4 class="text-sm font-semibold">{translateCategory(category)}</h4>
			<ul class="list-inside list-disc text-sm text-muted-foreground">
				{#each productsByCategory[category] as product (product.name)}
					<li>{translateProduct(product.name)}</li>
				{/each}
			</ul>
		</div>
	{/each}

	<!-- Additional product information -->
	{#if properties.additionalProductInformation}
		<div class="flex flex-col gap-1">
			<h4 class="text-sm font-semibold">{m.places_farmdescription_additionalinfo()}</h4>
			<p class="text-sm text-muted-foreground">{properties.additionalProductInformation}</p>
		</div>
	{/if}

	<!-- Ecological behavior -->
	{#if properties.actsEcological || properties.economicalBehavior}
		<div class="flex flex-col gap-1">
			<h4 class="text-sm font-semibold">{m.places_farmdescription_economicalbehavior()}</h4>
			<ul class="list-inside list-disc text-sm text-muted-foreground">
				{#if properties.actsEcological}
					<li>{m.places_farmdescription_biocertification()}</li>
				{/if}
				{#if properties.economicalBehavior}
					<li>{properties.economicalBehavior}</li>
				{/if}
			</ul>
		</div>
	{/if}

	<!-- Connected depots -->
	{#if depotFeatures.length > 0 || (isFarmOwner && onAddDepot)}
		<div class="flex flex-col gap-2" data-testid="farm-depots">
			<div class="flex items-center justify-between gap-2">
				<h4 class="text-sm font-semibold">{m.details_connected_depots()}</h4>
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
		</div>
	{/if}

	<!-- Badges -->
	<BadgesList badges={properties.badges} category="associations" />
	<BadgesList badges={properties.badges} category="certifications" />

	<!-- Participation -->
	{#if properties.participation}
		<div class="flex flex-col gap-1">
			<h4 class="text-sm font-semibold">{m.places_farmdescription_participation()}</h4>
			<p class="text-sm text-muted-foreground">{properties.participation}</p>
		</div>
	{/if}

	<!-- Maximum members -->
	{#if properties.maximumMembers}
		<p class="text-sm">
			<span class="font-semibold">{m.places_farmdescription_maximummembers()}</span>
			{properties.maximumMembers}
		</p>
	{/if}
</div>
