<script lang="ts">
	import './layout.css';
	import { authStore } from '$lib/stores/auth.svelte';
	import config from '$lib/config/app-configuration';
	import { ConfirmDialog } from '$lib/components/layout';
	import { Toaster } from '$lib/components/ui/sonner';
	import Map from './Map.svelte';

	let { children, data } = $props();

	$effect(() => {
		authStore.ensureInitialized();
	});

	const safeEntries = $derived.by(
		() => data?.entries ?? { type: 'FeatureCollection', features: [] }
	);
</script>

<svelte:head></svelte:head>

<div class="app-container" data-theme={config.theme}>
	<Map entries={safeEntries} />

	{@render children()}

	<ConfirmDialog />

	<Toaster />
</div>

<style>
	.app-container {
		width: 100%;
		min-height: 100%;
		position: relative;
	}
</style>
