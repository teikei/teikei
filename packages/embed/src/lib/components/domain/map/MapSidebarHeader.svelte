<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton, IconButton } from '$lib/components/actions';
	import type { AutocompleteSuggestion } from '$lib/api/discovery';
	import type { RegionOption } from '$lib/utils/regions';
	import * as m from '$lib/paraglide/messages.js';
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import PanelLeftCloseIcon from '@lucide/svelte/icons/panel-left-close';
	import RegionFilters from './RegionFilters.svelte';
	import SearchCommand from './SearchCommand.svelte';

	interface Props {
		collapsed?: boolean;
		searchValue?: string;
		isUserAuthenticated?: boolean;
		isMyEntriesScope?: boolean;
		showSearchSuggestions?: boolean;
		isSearchLoading?: boolean;
		searchSuggestions: AutocompleteSuggestion[];
		searchInputEl?: HTMLInputElement | null;
		countryOptions: RegionOption[];
		stateOptions: RegionOption[];
		selectedCountry: string;
		selectedState: string | null;
		onOpenAllEntriesScope: () => void;
		onOpenMyEntriesScope: () => void;
		onSearchSuggestionSelect: (suggestion: AutocompleteSuggestion) => void | Promise<void>;
		onSearchFocus?: () => void;
		onSearchBlur?: () => void;
		onCountrySelect: (countryCode: string) => void;
		onStateSelect?: (stateCode: string | null) => void;
	}

	let {
		collapsed = $bindable(false),
		searchValue = $bindable(''),
		isUserAuthenticated = false,
		isMyEntriesScope = false,
		showSearchSuggestions = false,
		isSearchLoading = false,
		searchSuggestions,
		searchInputEl = $bindable(null),
		countryOptions,
		stateOptions,
		selectedCountry,
		selectedState,
		onOpenAllEntriesScope,
		onOpenMyEntriesScope,
		onSearchSuggestionSelect,
		onSearchFocus,
		onSearchBlur,
		onCountrySelect,
		onStateSelect
	}: Props = $props();
</script>

<Sidebar.Header>
	{#if isUserAuthenticated}
		<div class="mb-2 grid grid-cols-2 gap-2" data-testid="scope-switch">
			<AppButton
				variant={isMyEntriesScope ? 'outline' : 'default'}
				onclick={onOpenAllEntriesScope}
				data-testid="scope-all-entries"
			>
				{m.map_sidebar_scope_all_entries()}
			</AppButton>
			<AppButton
				variant={isMyEntriesScope ? 'default' : 'outline'}
				onclick={onOpenMyEntriesScope}
				data-testid="scope-my-entries"
			>
				{m.map_sidebar_scope_my_entries()}
			</AppButton>
		</div>
	{/if}
	<div class="flex items-center gap-2">
		<IconButton
			class="shrink-0 max-md:size-11"
			data-testid="sidebar-collapse-toggle"
			label={m.map_sidebar_toggle()}
			onclick={() => (collapsed = !collapsed)}
		>
			{#if collapsed}
				<PanelLeftIcon />
			{:else}
				<PanelLeftCloseIcon />
			{/if}
		</IconButton>
		<SearchCommand
			bind:searchValue
			bind:inputEl={searchInputEl}
			suggestions={searchSuggestions}
			isLoading={isSearchLoading}
			open={showSearchSuggestions}
			disabled={isMyEntriesScope}
			onSelect={onSearchSuggestionSelect}
			onFocus={onSearchFocus}
			onBlur={onSearchBlur}
		/>
	</div>
	{#if !collapsed && !isMyEntriesScope}
		<RegionFilters
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{selectedState}
			{onCountrySelect}
			{onStateSelect}
		/>
	{/if}
</Sidebar.Header>
