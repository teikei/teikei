<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { AppButton, IconButton } from '$lib/components/actions';
	import type { AutocompleteSuggestion } from '$lib/api/discovery';
	import type { RegionOption } from '$lib/utils/regions';
	import * as m from '$lib/paraglide/messages.js';
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import PanelLeftCloseIcon from '@lucide/svelte/icons/panel-left-close';
	import SearchIcon from '@lucide/svelte/icons/search';
	import RegionFilters from './RegionFilters.svelte';
	import SearchSuggestions from './SearchSuggestions.svelte';

	interface Props {
		collapsed?: boolean;
		searchValue?: string;
		isUserAuthenticated?: boolean;
		isMyEntriesScope?: boolean;
		showSearchSuggestions?: boolean;
		isSearchLoading?: boolean;
		searchSuggestions: AutocompleteSuggestion[];
		countryOptions: RegionOption[];
		stateOptions: RegionOption[];
		selectedCountry: string;
		stateSelectValue: string;
		selectedCountryLabel: string;
		selectedStateLabel: string;
		allRegionsValue: string;
		onOpenAllEntriesScope: () => void;
		onOpenMyEntriesScope: () => void;
		onSearchSuggestionSelect: (suggestion: AutocompleteSuggestion) => void | Promise<void>;
		onCountrySelect: (countryCode: string) => void;
		onStateSelect: (stateCode: string) => void;
	}

	let {
		collapsed = $bindable(false),
		searchValue = $bindable(''),
		isUserAuthenticated = false,
		isMyEntriesScope = false,
		showSearchSuggestions = false,
		isSearchLoading = false,
		searchSuggestions,
		countryOptions,
		stateOptions,
		selectedCountry,
		stateSelectValue,
		selectedCountryLabel,
		selectedStateLabel,
		allRegionsValue,
		onOpenAllEntriesScope,
		onOpenMyEntriesScope,
		onSearchSuggestionSelect,
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
			class="shrink-0"
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
		<InputGroup.Root class="flex-1">
			<InputGroup.Addon>
				<SearchIcon />
			</InputGroup.Addon>
			<InputGroup.Input
				placeholder={m.map_sidebar_search_placeholder()}
				aria-label={m.map_sidebar_search_placeholder()}
				bind:value={searchValue}
				disabled={isMyEntriesScope}
			/>
			{#if showSearchSuggestions}
				<SearchSuggestions
					suggestions={searchSuggestions}
					isLoading={isSearchLoading}
					onSelect={onSearchSuggestionSelect}
				/>
			{/if}
		</InputGroup.Root>
	</div>
	{#if !collapsed && !isMyEntriesScope}
		<RegionFilters
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{stateSelectValue}
			{selectedCountryLabel}
			{selectedStateLabel}
			{allRegionsValue}
			{onCountrySelect}
			{onStateSelect}
		/>
	{/if}
</Sidebar.Header>
