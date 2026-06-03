<script lang="ts" module>
	export interface SearchWidgetProps {
		placeholder?: string;
		apiBaseUrl?: string;
	}
</script>

<script lang="ts">
	/**
	 * A simple search widget that can be embedded in external pages.
	 * This is a placeholder implementation - extend with actual search functionality.
	 */

	let { placeholder = 'Search...', apiBaseUrl = '' }: SearchWidgetProps = $props();

	let searchQuery = $state('');

	function handleSubmit(event: Event) {
		event.preventDefault();
		// TODO: Implement actual search functionality
		console.log('Search submitted:', searchQuery, 'API:', apiBaseUrl);
	}
</script>

<div class="teikei-search-widget">
	<form onsubmit={handleSubmit} class="teikei-search-form">
		<input type="search" bind:value={searchQuery} {placeholder} class="teikei-search-input" />
		<button type="submit" class="teikei-search-button"> Search </button>
	</form>
</div>

<style>
	.teikei-search-widget {
		font-family: var(--font-family-sans);
	}

	.teikei-search-form {
		display: flex;
		gap: 0.5rem;
	}

	.teikei-search-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-input);
		border-radius: var(--radius-md);
		font-size: 1rem;
	}

	.teikei-search-input:focus {
		outline: none;
		border-color: var(--color-ring);
		box-shadow: 0 0 0 2px color-mix(in oklch, var(--color-ring) 20%, transparent);
	}

	.teikei-search-button {
		padding: 0.5rem 1rem;
		background-color: var(--color-primary);
		color: var(--color-primary-foreground);
		border: none;
		border-radius: var(--radius-md);
		font-size: 1rem;
		cursor: pointer;
	}

	.teikei-search-button:hover {
		background-color: var(--color-primary-hover);
	}
</style>
