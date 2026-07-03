<script lang="ts">
	import './layout.css';
	import { authStore } from '$lib/stores/auth.svelte';
	import config from '$lib/config/app-configuration';
	import { ConfirmDialog } from '$lib/components/layout';
	import { Toaster } from '$lib/components/ui/sonner';
	import Map from './Map.svelte';

	let { children, data } = $props();

	$effect(() => {
		if (!authStore.isInitialized) {
			authStore.initialize();
		}
	});

	// Ensure entries is always defined and reactive
	const safeEntries = $derived.by(
		() => data?.entries ?? { type: 'FeatureCollection', features: [] }
	);
</script>

<svelte:head></svelte:head>

<div class="app-container" data-theme={config.theme}>
	<!-- Always render the map as base layer -->
	<Map entries={safeEntries} />

	<!-- Render children (auth modals, etc.) on top -->
	{@render children()}

	<!-- Global confirmation dialog (replaces window.confirm) -->
	<ConfirmDialog />

	<!-- Global toast feedback -->
	<Toaster />
</div>

<style>
	.app-container {
		width: 100%;
		min-height: 100%;
		position: relative;
	}
</style>
