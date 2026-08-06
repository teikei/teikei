import { getAssociatedFarmIdForDepot } from '$lib/api/entry-details';
import { parseHashRoute, routeBuilders } from '$lib/utils/routes';

/**
 * Resolves legacy hash routes to modern canonical targets.
 * Returns null when the route is not a recognized legacy alias.
 */
export async function resolveLegacyHashRedirect(hash: string): Promise<string | null> {
	const parsed = parseHashRoute(hash);

	switch (parsed.kind) {
		case 'legacy-auth-edit-account':
			return routeBuilders.auth.editAccount();

		case 'legacy-auth-edit-password':
			return routeBuilders.auth.editPassword();

		case 'legacy-depot-detail': {
			// `#/depots/:id` has no concrete route, so it lands here and resolves to
			// the owning farm's profile (Feature 8: depots live on the farm profile).
			const farmId = parsed.params.id ? await getAssociatedFarmIdForDepot(parsed.params.id) : null;

			if (farmId) {
				return routeBuilders.farm.detail(farmId);
			}

			return routeBuilders.home();
		}

		// `#/depots/new` (farm-selection-first create) and `#/depots/:id/edit`
		// (depot editor) are handled by concrete routes and never reach this
		// catch-all resolver, so they are not treated as redirect aliases here.
		case 'legacy-depot-edit':
		case 'legacy-depot-create':
		default:
			return null;
	}
}
