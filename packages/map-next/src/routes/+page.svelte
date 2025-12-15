<script lang="ts">
	import Map from './Map.svelte';

	let { data } = $props();
</script>

<Map entries={data.entries} />
