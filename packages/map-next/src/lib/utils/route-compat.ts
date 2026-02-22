import { getDepotAssociatedFarmId } from '$lib/utils/places';
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
			const farmId = parsed.params.id ? await getDepotAssociatedFarmId(parsed.params.id) : null;

			if (farmId) {
				return routeBuilders.farm.detail(farmId);
			}

			return routeBuilders.home();
		}

		case 'legacy-depot-edit':
			return routeBuilders.home();

		case 'legacy-depot-create':
			return routeBuilders.home();

		default:
			return null;
	}
}
