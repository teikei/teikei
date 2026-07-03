<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { IconButton } from '$lib/components/actions';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import type { AutocompleteSuggestion } from '$lib/api/discovery';
	import * as m from '$lib/paraglide/messages.js';
	import SearchCommand from './SearchCommand.svelte';

	interface Props {
		searchValue?: string;
		suggestions: AutocompleteSuggestion[];
		isLoading?: boolean;
		showSearchSuggestions?: boolean;
		searchInputEl?: HTMLInputElement | null;
		onBack: () => void;
		onSearchSuggestionSelect: (suggestion: AutocompleteSuggestion) => void | Promise<void>;
		onSearchFocus?: () => void;
		onSearchBlur?: () => void;
	}

	let {
		searchValue = $bindable(''),
		suggestions,
		isLoading = false,
		showSearchSuggestions = false,
		searchInputEl = $bindable(null),
		onBack,
		onSearchSuggestionSelect,
		onSearchFocus,
		onSearchBlur
	}: Props = $props();
</script>

<Sidebar.Header class="border-b">
	<div class="flex items-center gap-2">
		<IconButton
			class="shrink-0 max-md:size-11"
			data-testid="detail-search-back"
			label={m.nav_go_back()}
			onclick={onBack}
		>
			<ArrowLeftIcon />
		</IconButton>
		<SearchCommand
			bind:searchValue
			bind:inputEl={searchInputEl}
			{suggestions}
			{isLoading}
			open={showSearchSuggestions}
			onSelect={onSearchSuggestionSelect}
			onFocus={onSearchFocus}
			onBlur={onSearchBlur}
		/>
	</div>
</Sidebar.Header>
