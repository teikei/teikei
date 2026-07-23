<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import * as m from '$lib/paraglide/messages.js';
	import { AppButton } from '$lib/components/actions';
	import { Heading, Paragraph } from '$lib/components/typography';
	import * as Accordion from '$lib/components/ui/accordion';
	import { safeHttpUrl } from '$lib/utils/url';
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
		{#if depotFeatures.length > 0}
			<Accordion.Root type="multiple">
				{#each depotFeatures as depot (depot.properties.id)}
					{@const isOwned = ownedDepotIds.has(depot.properties.id)}
					{@const place = formatDepotPlace(depot.properties)}
					{@const websiteUrl = safeHttpUrl(depot.properties.url)}
					<Accordion.Item
						value={depot.properties.id}
						data-testid="depot-card"
						data-depot-id={depot.properties.id}
						data-depot-owned={isOwned}
						class="flex flex-col"
					>
						<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pr-4">
							<Accordion.Trigger level={6} class="min-w-0 gap-2 p-4">
								<span class="flex min-w-0 flex-col gap-0.5 text-left">
									<span class="truncate text-sm font-medium text-foreground">
										{depot.properties.name}
									</span>
									{#if place}
										<span class="truncate text-sm text-muted-foreground">
											{place}
										</span>
									{/if}
								</span>
							</Accordion.Trigger>
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
						<Accordion.Content class="flex flex-col gap-2">
							{#if depot.properties.description}
								<Paragraph size="small" class="whitespace-pre-line">
									{depot.properties.description}
								</Paragraph>
							{/if}
							{#if websiteUrl}
								<a
									href={websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
									data-testid="depot-card-website"
								>
									{websiteUrl}
									<ExternalLinkIcon class="size-3" />
								</a>
							{/if}
							{#if depot.properties.deliveryDays}
								<Paragraph size="small">
									<span class="font-medium text-foreground">
										{m.editor_depot_field_delivery_days()}:
									</span>
									{depot.properties.deliveryDays}
								</Paragraph>
							{/if}
							<button
								type="button"
								class="self-start text-sm text-primary hover:underline"
								data-testid="depot-card-select"
								onclick={() => onDepotSelect?.(depot as DepotFeature)}
							>
								{m.details_depot_view_on_map()}
							</button>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{/if}
	</ProfileSection>
{/if}
