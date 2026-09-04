<script lang="ts" module>
	export interface SearchWidgetProps {
		placeholder?: string;
		apiBaseUrl?: string;
	}
</script>

<script lang="ts">
	import SearchCommand from '$lib/components/domain/map/SearchCommand.svelte';
	import { getAutocompleteSuggestions, type AutocompleteSuggestion } from '$lib/api/discovery';
	import config from '$lib/config/app-configuration';
	import { routeBuilders } from '$lib/utils/routes';

	const MIN_SEARCH_CHARS = 2;
	const SEARCH_DEBOUNCE_MS = 300;

	let { placeholder = 'Search...', apiBaseUrl: _apiBaseUrl = '' }: SearchWidgetProps = $props();

	let searchValue = $state('');
	let suggestions = $state<AutocompleteSuggestion[]>([]);
	let isLoading = $state(false);
	let latestRequestId = 0;

	async function loadSuggestions(query: string) {
		const requestId = ++latestRequestId;
		isLoading = true;

		try {
			const result = await getAutocompleteSuggestions({
				text: query,
				locale: config.displayLocale,
				withEntries: true
			});
			if (requestId === latestRequestId) {
				suggestions = result;
			}
		} catch {
			if (requestId === latestRequestId) {
				suggestions = [];
			}
		} finally {
			if (requestId === latestRequestId) {
				isLoading = false;
			}
		}
	}

	$effect(() => {
		const query = searchValue.trim();
		if (query.length < MIN_SEARCH_CHARS) {
			latestRequestId += 1;
			suggestions = [];
			isLoading = false;
			return;
		}

		isLoading = true;
		const timeout = setTimeout(() => void loadSuggestions(query), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	});

	function handleSelect(suggestion: AutocompleteSuggestion) {
		const routes = {
			location: routeBuilders.discovery.location(suggestion.id),
			farm: routeBuilders.farm.detail(suggestion.id),
			initiative: routeBuilders.initiative.detail(suggestion.id),
			depot: routeBuilders.depotLegacy.detail(suggestion.id)
		};
		window.location.hash = routes[suggestion.type].slice(1);
		searchValue = '';
		suggestions = [];
		latestRequestId += 1;
		isLoading = false;
	}

	const showSuggestions = $derived(searchValue.trim().length >= MIN_SEARCH_CHARS);

	let inputEl = $state<HTMLInputElement | null>(null);
</script>

<div class="teikei-search-widget">
	<SearchCommand
		bind:searchValue
		bind:inputEl
		{suggestions}
		{isLoading}
		open={showSuggestions}
		{placeholder}
		prefix="/karte/"
	/>
</div>

<style>
	.teikei-search-widget {
		font-family: var(--font-family-sans);
	}
</style>
