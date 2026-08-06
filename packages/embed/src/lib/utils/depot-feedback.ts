import { goto } from '$app/navigation';
import type { DepotFeature } from '$lib/types/entries';
import { routeBuilders } from '$lib/utils/routes';
import { toastSuccess } from '$lib/utils/toast';
import * as m from '$lib/paraglide/messages.js';

export function getFirstAssociatedFarmId(depot: DepotFeature): string | null {
	return depot.properties.farms?.features?.[0]?.properties?.id ?? null;
}

export function showDepotMutationToast(
	action: 'created' | 'updated' | 'deleted',
	farmId: string | null
) {
	const message =
		action === 'created'
			? m.editor_depot_saved_created()
			: action === 'updated'
				? m.editor_depot_saved_updated()
				: m.editor_depot_saved_deleted();

	toastSuccess(
		message,
		farmId
			? {
					action: {
						label: m.editor_depot_view_associated_farm(),
						onClick: () => void goto(routeBuilders.farm.detail(farmId))
					}
				}
			: undefined
	);
}
