import { getDepotAssociatedFarmId } from '$lib/api/places';
import { parseHashRoute, routeBuilders } from '$lib/utils/routes';

export interface LegacyRouteResolution {
	target: string;
	reason:
		| 'auth-edit-account-alias'
		| 'auth-edit-password-alias'
		| 'depot-detail-associated-farm'
		| 'depot-detail-fallback-home'
		| 'depot-edit-fallback-home'
		| 'depot-create-fallback-home';
}

/**
 * Resolves legacy hash routes to modern canonical targets.
 * Returns null when the route is not a recognized legacy alias.
 */
export async function resolveLegacyHashRedirect(
	hash: string
): Promise<LegacyRouteResolution | null> {
	const parsed = parseHashRoute(hash);

	switch (parsed.kind) {
		case 'legacy-auth-edit-account':
			return {
				target: routeBuilders.auth.editAccount(),
				reason: 'auth-edit-account-alias'
			};

		case 'legacy-auth-edit-password':
			return {
				target: routeBuilders.auth.editPassword(),
				reason: 'auth-edit-password-alias'
			};

		case 'legacy-depot-detail': {
			const farmId = parsed.params.id ? await getDepotAssociatedFarmId(parsed.params.id) : null;

			if (farmId) {
				return {
					target: routeBuilders.farm.detail(farmId),
					reason: 'depot-detail-associated-farm'
				};
			}

			return {
				target: routeBuilders.home(),
				reason: 'depot-detail-fallback-home'
			};
		}

		case 'legacy-depot-edit':
			return {
				target: routeBuilders.home(),
				reason: 'depot-edit-fallback-home'
			};

		case 'legacy-depot-create':
			return {
				target: routeBuilders.home(),
				reason: 'depot-create-fallback-home'
			};

		default:
			return null;
	}
}
