<script lang="ts">
	import './layout.css';

	let { children } = $props();
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
