import { error } from '@sveltejs/kit';
import { resolveLegacyHashRedirect } from './route-compat';
import { parseHashRoute, routeBuilders } from '$lib/utils/routes';
import { networkSelection } from '$lib/stores/network-selection.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const resolution = await resolveLegacyHashRedirect(url.hash);

	if (!resolution) {
		throw error(404, 'Not found');
	}

	// A `#/depots/:id` deep link resolves to its owning farm's profile; remember the
	// depot so the farm↔depot network emphasizes that depot's connection on arrival.
	// Only when a farm was actually resolved (a depot with no farm redirects home).
	const parsed = parseHashRoute(url.hash);
	if (
		parsed.kind === 'legacy-depot-detail' &&
		parsed.params.id &&
		resolution !== routeBuilders.home()
	) {
		networkSelection.selectDepot(parsed.params.id);
	}

	return {
		redirectTarget: resolution
	};
};
