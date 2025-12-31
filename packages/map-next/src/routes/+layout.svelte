<script lang="ts">
	import './layout.css';
	import { isInitialized, initializeAuth } from '$lib/stores/auth.svelte';

	let { children } = $props();

	$effect(() => {
		if (!isInitialized()) {
			initializeAuth();
		}
	});
</script>

<svelte:head></svelte:head>

<div class="app-container">
	{@render children()}
</div>

<style>
	.app-container {
		width: 100%;
		min-height: 100%;
		position: relative;
	}
</style>
