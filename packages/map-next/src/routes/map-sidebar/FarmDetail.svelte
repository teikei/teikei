<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { FarmProperties } from '$lib/types/entries';
	import { translateProduct, translateCategory } from '$lib/utils/translations';
	import BadgesList from './BadgesList.svelte';

	interface FarmDetailProps {
		properties: FarmProperties;
	}

	let { properties }: FarmDetailProps = $props();

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
</script>

<div class="space-y-4">
	<!-- Products by category -->
	{#each categories as category (category)}
		<div class="space-y-1">
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
		<div class="space-y-1">
			<h4 class="text-sm font-semibold">{m.places_farmdescription_additionalinfo()}</h4>
			<p class="text-sm text-muted-foreground">{properties.additionalProductInformation}</p>
		</div>
	{/if}

	<!-- Ecological behavior -->
	{#if properties.actsEcological || properties.economicalBehavior}
		<div class="space-y-1">
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
	{#if properties.depots && properties.depots.features && properties.depots.features.length > 0}
		<div class="space-y-1">
			<h4 class="text-sm font-semibold">{m.details_connected_depots()}</h4>
			<ul class="list-inside list-disc text-sm text-muted-foreground">
				{#each properties.depots.features as depot (depot.properties?.id)}
					<li>{depot.properties?.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Badges -->
	<BadgesList badges={properties.badges} category="associations" />
	<BadgesList badges={properties.badges} category="certifications" />

	<!-- Participation -->
	{#if properties.participation}
		<div class="space-y-1">
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
