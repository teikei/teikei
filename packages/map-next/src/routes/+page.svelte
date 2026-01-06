<script lang="ts">
	import Map from './Map.svelte';

	let { data } = $props();

	// Ensure entries is always defined and reactive in runes mode
	const safeEntries = $derived.by(() => data?.entries ?? { type: 'FeatureCollection', features: [] });
</script>

	<Map entries={safeEntries} />
