<script lang="ts">
	import { getMapContext, getSource } from 'svelte-maplibre';
	import type { Feature, Point } from 'geojson';
	import type { EntryFeature } from '$lib/types/entries';
	import type { GeoJSONSource } from 'maplibre-gl';
	import { getPlaceIcon } from '$lib/utils/marker-icons';

	interface ClusterMarkerProps {
		feature: Feature<Point, any>;
		onMarkerClick: (feature: EntryFeature) => void;
	}

	let { feature, onMarkerClick }: ClusterMarkerProps = $props();

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

		const features = ((await geoSource.getClusterLeaves(clusterId, 100, 0)) ??
			[]) as EntryFeature[];

		return features;
	});

	// Use this instead of an await template tag to avoid flickering
	let clusterFeatures: EntryFeature[] = $state([]);
	$effect(() => {
		clusterFeaturesPromise.then((f) => (clusterFeatures = f));
	});

	const pointCount = $derived(feature.properties?.point_count);

	// Calculate circle positions for icons
	function getCirclePosition(index: number, total: number): { x: number; y: number } {
		if (index === 0 && total === 1) return { x: 0, y: 0 };

		const radius = 10 + (10 * total) / 3; // Radius increases with number of points
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
			{@const icon = getPlaceIcon(type)}
			{@const position = getCirclePosition(i, Math.min(clusterFeatures.length, 10))}
			<button
				onclick={() => onMarkerClick(clusterFeature, { offset: [position.x, position.y] })}
				class="cluster-icon-button"
			>
				<img
					src={icon}
					class="marker-icon"
					alt={clusterFeature.properties?.name || type}
					style="transform: translate({position.x}px, {position.y}px)"
				/>
			</button>
		{/each}
	{/if}
</div>

<style>
	.cluster-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
	}

	.cluster-icon-button {
		position: absolute;
		width: 30px;
		height: 30px;
		left: 50%;
		top: 50%;
		margin-left: -15px;
		margin-top: -15px;
		cursor: pointer;
	}

	.marker-icon {
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
</style>
