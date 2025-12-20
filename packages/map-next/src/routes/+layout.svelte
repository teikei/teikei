<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-container">
	{@render children()}
</div>

<style>
	.app-container {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}
</style>
