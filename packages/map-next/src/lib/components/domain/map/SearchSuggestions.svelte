<script lang="ts">
	import type { AutocompleteSuggestion } from '$lib/api/discovery';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		suggestions: AutocompleteSuggestion[];
		isLoading?: boolean;
		onSelect: (suggestion: AutocompleteSuggestion) => void | Promise<void>;
	}

	let { suggestions, isLoading = false, onSelect }: Props = $props();
</script>

<div
	data-testid="search-suggestions"
	class="absolute top-full right-0 left-0 z-[1200] mt-1 rounded-md border border-input bg-background shadow-sm"
>
	{#if isLoading}
		<p class="px-3 py-2 text-sm text-muted-foreground">
			{m.map_sidebar_search_loading()}
		</p>
	{:else if suggestions.length === 0}
		<p class="px-3 py-2 text-sm text-muted-foreground">
			{m.map_sidebar_search_no_results()}
		</p>
	{:else}
		<ul class="max-h-56 overflow-y-auto py-1">
			{#each suggestions as suggestion (`${suggestion.type}-${suggestion.id}`)}
				<li>
					<button
						type="button"
						class="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
						onclick={() => void onSelect(suggestion)}
					>
						<span class="line-clamp-1">{suggestion.title}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
