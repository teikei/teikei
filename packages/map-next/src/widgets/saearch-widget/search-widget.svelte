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
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.teikei-search-form {
		display: flex;
		gap: 0.5rem;
	}

	.teikei-search-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	.teikei-search-input:focus {
		outline: none;
		border-color: #10b981;
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
	}

	.teikei-search-button {
		padding: 0.5rem 1rem;
		background-color: #10b981;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 1rem;
		cursor: pointer;
	}

	.teikei-search-button:hover {
		background-color: #059669;
	}
</style>
