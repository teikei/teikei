<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import type { AutocompleteSuggestion, AutocompleteSuggestionType } from '$lib/api/discovery';
	import { cn } from '$lib/utils/tailwind';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		searchValue?: string;
		suggestions: AutocompleteSuggestion[];
		isLoading?: boolean;
		/** Parent-controlled visibility of the results panel (query length gate). */
		open?: boolean;
		disabled?: boolean;
		placeholder?: string;
		/** Bound so higher layers can focus the input (keyboard shortcut, mobile). */
		inputEl?: HTMLInputElement | null;
		onSelect: (suggestion: AutocompleteSuggestion) => void | Promise<void>;
		onFocus?: () => void;
		onBlur?: () => void;
	}

	let {
		searchValue = $bindable(''),
		suggestions,
		isLoading = false,
		open = false,
		disabled = false,
		placeholder = m.map_sidebar_search_placeholder(),
		inputEl = $bindable(null),
		onSelect,
		onFocus,
		onBlur
	}: Props = $props();

	// Grouped, icon-labelled sections in a fixed order (Locations first, matching
	// the Google-Maps model of geography-then-entries).
	const GROUPS: { type: AutocompleteSuggestionType; heading: () => string }[] = [
		{ type: 'location', heading: m.map_sidebar_search_group_locations },
		{ type: 'farm', heading: m.map_sidebar_search_group_farms },
		{ type: 'depot', heading: m.map_sidebar_search_group_depots },
		{ type: 'initiative', heading: m.map_sidebar_search_group_initiatives }
	];

	const grouped = $derived(
		GROUPS.map((group) => ({
			...group,
			items: suggestions.filter((suggestion) => suggestion.type === group.type)
		})).filter((group) => group.items.length > 0)
	);

	// Escape hides the panel but keeps the query (legacy/Google-Maps behavior);
	// any query edit re-opens it.
	let dismissed = $state(false);
	$effect(() => {
		// Re-open whenever the query changes.
		void searchValue;
		dismissed = false;
	});

	const panelOpen = $derived(open && !dismissed);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && panelOpen) {
			event.preventDefault();
			event.stopPropagation();
			dismissed = true;
		}
	}
</script>

<Command.Root shouldFilter={false} class="relative w-full overflow-visible bg-transparent">
	<Command.Input
		bind:value={searchValue}
		bind:ref={inputEl}
		{placeholder}
		{disabled}
		aria-label={placeholder}
		wrapperClass="h-9 rounded-4xl border border-transparent bg-input/50 max-md:h-11 focus-within:border-ring"
		onkeydown={handleKeydown}
		onfocus={onFocus}
		onblur={onBlur}
	/>
	{#if panelOpen}
		<Command.List
			data-testid="search-suggestions"
			class={cn(
				'absolute top-full right-0 left-0 z-[var(--z-map-overlay)] mt-1',
				'rounded-xl border border-input bg-background shadow-md'
			)}
		>
			{#if isLoading}
				<Command.Loading class="px-3 py-2 text-sm text-muted-foreground">
					{m.map_sidebar_search_loading()}
				</Command.Loading>
			{:else if grouped.length === 0}
				<Command.Empty
					forceMount
					data-testid="search-empty"
					class="px-3 py-6 text-center text-sm text-muted-foreground"
				>
					{m.map_sidebar_search_empty({ query: searchValue.trim() })}
				</Command.Empty>
			{:else}
				{#each grouped as group (group.type)}
					<Command.Group heading={group.heading()}>
						{#each group.items as suggestion (`${suggestion.type}-${suggestion.id}`)}
							<Command.Item
								value={`${suggestion.type}-${suggestion.id}`}
								onSelect={() => void onSelect(suggestion)}
								onpointerdown={(event) => event.preventDefault()}
							>
								{#if group.type === 'location'}
									<MapPinIcon />
								{:else}
									<img
										class="size-4 shrink-0 object-contain"
										src={getPlaceIcon(group.type)}
										alt=""
									/>
								{/if}
								<span class="line-clamp-1">{suggestion.title}</span>
							</Command.Item>
						{/each}
					</Command.Group>
				{/each}
			{/if}
		</Command.List>
	{/if}
</Command.Root>
