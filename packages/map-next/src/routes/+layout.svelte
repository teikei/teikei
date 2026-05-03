<script lang="ts">
	import './layout.css';
	import { isInitialized, initializeAuth } from '$lib/stores/auth.svelte';
	import config from '$lib/config/app-configuration';
	import { getDesignTheme } from '$lib/design/themes.js';
	import Map from './Map.svelte';

	let { children, data } = $props();

	$effect(() => {
		if (!isInitialized()) {
			initializeAuth();
		}
	});

	// Ensure entries is always defined and reactive
	const safeEntries = $derived.by(
		() => data?.entries ?? { type: 'FeatureCollection', features: [] }
	);
	const designTheme = getDesignTheme(config.theme);
</script>

<svelte:head></svelte:head>

<div class="app-container" data-theme={designTheme.id}>
	<!-- Always render the map as base layer -->
	<Map entries={safeEntries} />

	<!-- Render children (auth modals, etc.) on top -->
	{@render children()}
</div>

<style>
	.app-container {
		width: 100%;
		min-height: 100%;
		position: relative;
	}
</style>
