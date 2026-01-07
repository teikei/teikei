<script lang="ts">
	import { getMapContext, getSource } from 'svelte-maplibre';
	import type { Feature, Point } from 'geojson';
	import type { EntryProperties } from '$lib/types/entries';
	import type { GeoJSONSource } from 'maplibre-gl';

	interface ClusterMarkerProps {
		feature: Feature<Point, any>;
		markerIcons: Record<string, string>;
	}

	let { feature, markerIcons }: ClusterMarkerProps = $props();

	const mapContext = getMapContext();
	const map = $derived(mapContext.map);
	const source = getSource();

	let clusterFeaturesPromise = $derived.by(async () => {
		if (!map || !source?.value || !feature) {
			return [];
		}

		const clusterId = feature.properties?.cluster_id;
		if (!clusterId) {
			return [];
		}

		const geoSource = map.getSource(source.value) as GeoJSONSource;
		if (!geoSource?.getClusterLeaves) {
			return [];
		}

		const features = ((await geoSource.getClusterLeaves(clusterId, 100, 0)) ?? []) as Feature<
			Point,
			EntryProperties
		>[];

		return features;
	});

	// Use this instead of an await template tag to avoid flickering
	let clusterFeatures: Feature<Point, EntryProperties>[] = $state([]);
	$effect(() => {
		clusterFeaturesPromise.then((f) => (clusterFeatures = f));
	});

	const pointCount = $derived(feature.properties?.point_count);

	// Calculate circle positions for icons
	function getCirclePosition(index: number, total: number): { x: number; y: number } {
		if (index === 0 && total === 1) return { x: 0, y: 0 };

		const radius = 18; // Fixed radius for the circle
		const angle = (index * 2 * Math.PI) / total; // Evenly distribute around the circle

		return {
			x: Math.cos(angle) * radius,
			y: Math.sin(angle) * radius
		};
	}
</script>

<div class="cluster-container">
	{#if clusterFeatures.length > 0}
		{#each clusterFeatures.slice(0, 10) as clusterFeature, i}
			{@const type = clusterFeature.properties?.type?.toLowerCase()}
			{@const icon = markerIcons[type]}
			{@const position = getCirclePosition(i, Math.min(clusterFeatures.length, 10))}
			{#if icon}
				<img
					class="cluster-icon"
					src={icon}
					alt={clusterFeature.properties?.name || type}
					style="transform: translate({position.x}px, {position.y}px);"
				/>
			{/if}
		{/each}
		{#if clusterFeatures.length > 10}
			<span class="cluster-overflow">+{clusterFeatures.length - 10}</span>
		{/if}
	{:else}
		<span class="cluster-count">{pointCount}</span>
	{/if}
</div>

<style>
	.cluster-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 150px;
		height: 150px;
	}

	.cluster-icon {
		position: absolute;
		width: 32px;
		height: 32px;
		left: 50%;
		top: 50%;
		margin-left: -16px;
		margin-top: -16px;
	}

	.cluster-overflow {
		position: absolute;
		bottom: -8px;
		right: -8px;
		font-size: 12px;
		font-weight: bold;
		background: white;
		padding: 2px 6px;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.cluster-count {
		font-weight: bold;
		font-size: 14px;
	}
</style>
