<script lang="ts">
	import { getMapContext, getSource } from 'svelte-maplibre';
	import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
	import type { EntryFeature } from '$lib/types/entries';
	import type { GeoJSONSource } from 'maplibre-gl';
	import EntryMarkerButton from './EntryMarkerButton.svelte';

	interface ClusterMarkerProps {
		// Cluster features arrive untyped from svelte-maplibre; we only read `cluster_id`.
		feature: Feature<Geometry, GeoJsonProperties>;
		onMarkerClick: (feature: EntryFeature, options?: { offset?: [number, number] }) => void;
		/** Entry ids to emphasize while a farm↔depot network is open (shared state). */
		highlightedIds?: ReadonlySet<string>;
		/** Hover key of the entry whose profile is open; its marker stays selected. */
		selectedKey?: string | null;
		onMarkerHover?: (feature: EntryFeature, options?: { offset?: [number, number] }) => void;
		onMarkerLeave?: () => void;
	}

	let {
		feature,
		onMarkerClick,
		onMarkerHover,
		onMarkerLeave,
		highlightedIds,
		selectedKey
	}: ClusterMarkerProps = $props();

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

	let clusterFeatures: EntryFeature[] = $state([]);
	$effect(() => {
		const promise = clusterFeaturesPromise;
		promise
			.then((features) => {
				if (promise === clusterFeaturesPromise) {
					clusterFeatures = features;
				}
			})
			.catch(() => {
				if (promise === clusterFeaturesPromise) {
					clusterFeatures = [];
				}
			});
	});

	const ICON_SIZE = 30;
	const MAX_ICONS = 10;
	const iconCount = $derived(Math.min(clusterFeatures.length, MAX_ICONS));

	function spreadRadius(total: number): number {
		return 10 + (10 * total) / 3;
	}

	const backdropSize = $derived(iconCount > 0 ? (spreadRadius(iconCount) + ICON_SIZE / 2) * 2 : 0);
	const pointCount = $derived<number>(Number(feature.properties?.point_count) || 0);
	const pointCountLabel = $derived<string>(
		(feature.properties?.point_count_abbreviated as string | undefined) ?? String(pointCount)
	);

	function getCirclePosition(index: number, total: number): { x: number; y: number } {
		if (index === 0 && total === 1) return { x: 0, y: 0 };

		const radius = spreadRadius(total);
		const angle = (index * 2 * Math.PI) / total;

		return {
			x: Math.cos(angle) * radius,
			y: Math.sin(angle) * radius
		};
	}
</script>

<div class="cluster-container" style="--backdrop-size: {backdropSize}px">
	{#if iconCount > 0}
		{#each clusterFeatures.slice(0, MAX_ICONS) as clusterFeature, i (clusterFeature.properties.id)}
			{@const position = getCirclePosition(i, iconCount)}
			<div
				class="cluster-icon-position"
				style="transform: translate({position.x}px, {position.y}px)"
			>
				<EntryMarkerButton
					entry={clusterFeature}
					onClick={() => onMarkerClick(clusterFeature, { offset: [position.x, position.y] })}
					onHover={() => onMarkerHover?.(clusterFeature, { offset: [position.x, position.y] })}
					onLeave={onMarkerLeave}
					{selectedKey}
				/>
			</div>
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

	.cluster-icon-position {
		position: absolute;
		left: 50%;
		top: 50%;
		margin-left: -22.5px;
		margin-top: -22.5px;
	}
</style>
