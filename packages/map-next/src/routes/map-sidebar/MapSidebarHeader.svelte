<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton, IconButton } from '$lib/components/actions';
	import type { AutocompleteSuggestion } from '$lib/api/discovery';
	import type { RegionOption } from '$lib/utils/regions';
	import * as m from '$lib/paraglide/messages.js';
	import { PanelLeft, PanelLeftClose, Search } from 'lucide-svelte';
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
				<PanelLeft class="size-4" />
			{:else}
				<PanelLeftClose class="size-4" />
			{/if}
		</IconButton>
		<div class="relative flex-1">
			<Search
				class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Sidebar.Input
				placeholder={m.map_sidebar_search_placeholder()}
				aria-label={m.map_sidebar_search_placeholder()}
				bind:value={searchValue}
				class="pl-8"
				disabled={isMyEntriesScope}
			/>
			{#if showSearchSuggestions}
				<SearchSuggestions
					suggestions={searchSuggestions}
					isLoading={isSearchLoading}
					onSelect={onSearchSuggestionSelect}
				/>
			{/if}
		</div>
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
