/**
 * Tracks which depot (if any) the user reached the current farm profile through,
 * so the farm↔depot network visualization can emphasize that depot's connection.
 *
 * The selection is set the moment a depot is chosen (marker click, search result,
 * or legacy deep link) and survives the subsequent navigation to the owning farm's
 * profile, where the resolved `detailData` no longer carries the depot identity.
 * `NetworkLayer` only honours a selection that belongs to the open farm's depots,
 * so a stale id from a previous farm is ignored automatically.
 *
 * Safe as a module-level singleton because the app is fully client-side
 * (`router.type: 'hash'`), so there is no SSR request state to leak.
 */
class NetworkSelectionStore {
	selectedDepotId = $state<string | null>(null);

	selectDepot(depotId: string) {
		this.selectedDepotId = depotId;
	}

	clear() {
		this.selectedDepotId = null;
	}
}

export const networkSelection = new NetworkSelectionStore();
