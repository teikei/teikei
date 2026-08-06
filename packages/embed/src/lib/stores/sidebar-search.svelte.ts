import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { getAutocompleteSuggestions, type AutocompleteSuggestion } from '$lib/api/discovery';
import config from '$lib/config/app-configuration';
import { networkSelection } from '$lib/stores/network-selection.svelte';
import { createDebouncedCallback } from '$lib/utils/debounce';
import { routeBuilders } from '$lib/utils/routes';

const SEARCH_SUGGESTIONS_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 2;
const { displayLocale } = config;

export interface SidebarSearchSources {
	isMyEntriesScope: () => boolean;
	collapsed: () => boolean;
	isMobile: () => boolean;
}

export interface SidebarSearch {
	value: string;
	inputEl: HTMLInputElement | null;
	readonly suggestions: AutocompleteSuggestion[];
	readonly isLoading: boolean;
	readonly isFocused: boolean;
	readonly showSuggestions: boolean;
	handleFocus(): void;
	handleBlur(): void;
	selectSuggestion(suggestion: AutocompleteSuggestion): Promise<void>;
	focusInput(): void;
}

/**
 * The search input, its debounced autocomplete loading with the stale-response
 * guard, and suggestion selection. Must be called during component
 * initialization (it registers an `$effect`).
 */
export function createSidebarSearch(sources: SidebarSearchSources): SidebarSearch {
	let value = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);
	let suggestions: AutocompleteSuggestion[] = $state([]);
	let isLoading = $state(false);
	let isFocused = $state(false);
	let latestRequestId = $state(0);

	// On mobile the search input stays reachable at the peek snap (collapsed), and
	// focusing it lifts the sheet to full (raiseToFull); keep the panel available
	// there regardless of `collapsed`. Not focus-gated, so a tap on a suggestion
	// (which blurs the input first) still lands.
	const showSuggestions = $derived(
		(!sources.collapsed() || sources.isMobile()) &&
			!sources.isMyEntriesScope() &&
			value.trim().length >= MIN_SEARCH_CHARS
	);

	async function loadSuggestions(query: string) {
		const trimmed = query.trim();
		if (trimmed.length < MIN_SEARCH_CHARS) {
			suggestions = [];
			isLoading = false;
			return;
		}

		const requestId = ++latestRequestId;
		isLoading = true;

		try {
			const result = await getAutocompleteSuggestions({
				text: trimmed,
				locale: displayLocale,
				withEntries: true
			});

			if (requestId !== latestRequestId) {
				return;
			}

			suggestions = result;
		} catch (error) {
			if (requestId !== latestRequestId) {
				return;
			}
			suggestions = [];
			if (dev) {
				console.warn('Failed to fetch search suggestions', error);
			}
		} finally {
			if (requestId === latestRequestId) {
				isLoading = false;
			}
		}
	}

	const debouncedSuggestionsSearch = createDebouncedCallback(
		() => void loadSuggestions(value),
		SEARCH_SUGGESTIONS_DEBOUNCE_MS
	);

	$effect(() => {
		const query = value.trim();
		if (query.length < MIN_SEARCH_CHARS) {
			latestRequestId = -1;
			isLoading = false;
			suggestions = [];
			debouncedSuggestionsSearch.cancel();
			return;
		}

		// Enter the loading state up front so the panel shows the loading row
		// (not a false "no results" empty state) during the debounce window.
		isLoading = true;
		debouncedSuggestionsSearch.trigger();
	});

	return {
		get value() {
			return value;
		},
		set value(next: string) {
			value = next;
		},
		get inputEl() {
			return inputEl;
		},
		set inputEl(next: HTMLInputElement | null) {
			inputEl = next;
		},
		get suggestions() {
			return suggestions;
		},
		get isLoading() {
			return isLoading;
		},
		get isFocused() {
			return isFocused;
		},
		get showSuggestions() {
			return showSuggestions;
		},
		handleFocus() {
			isFocused = true;
		},
		handleBlur() {
			isFocused = false;
		},
		async selectSuggestion(suggestion: AutocompleteSuggestion) {
			value = '';
			suggestions = [];
			isLoading = false;
			latestRequestId = -1;
			debouncedSuggestionsSearch.cancel();
			// Selecting from a search over an open profile replaces it; drop any depot
			// emphasis from the profile we are leaving (the depot branch re-sets it).
			networkSelection.clear();

			if (suggestion.type === 'location') {
				await goto(routeBuilders.discovery.location(suggestion.id));
				return;
			}

			if (suggestion.type === 'farm') {
				await goto(routeBuilders.farm.detail(suggestion.id));
				return;
			}

			if (suggestion.type === 'initiative') {
				await goto(routeBuilders.initiative.detail(suggestion.id));
				return;
			}

			if (suggestion.type === 'depot') {
				// Emphasize this depot's connection once its owning farm profile resolves.
				networkSelection.selectDepot(suggestion.id);
				await goto(routeBuilders.depotLegacy.detail(suggestion.id));
			}
		},
		focusInput() {
			// The input may be (re)mounting after expanding; focus on the next frame.
			requestAnimationFrame(() => inputEl?.focus());
		}
	};
}
