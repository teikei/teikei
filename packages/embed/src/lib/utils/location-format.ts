import type { AutocompleteSuggestion } from '$lib/api/discovery';
import * as m from '$lib/paraglide/messages.js';

/**
 * Region kind shown next to a location suggestion, e.g. "Kanton" for the canton
 * of Bern, so it can be told apart from the identically labelled city. Returns
 * an empty string for cities and addresses.
 */
export function formatRegionType(
	suggestion: Pick<AutocompleteSuggestion, 'administrativeAreaType' | 'countryCode'>
): string {
	if (suggestion.administrativeAreaType !== 'state') {
		return '';
	}
	return suggestion.countryCode === 'CHE'
		? m.map_sidebar_search_region_canton()
		: m.map_sidebar_search_region_state();
}
