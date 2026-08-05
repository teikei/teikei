import { dev } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { getMainEntry } from '$lib/api/entry-details';
import { deleteDepot, deleteFarm, deleteInitiative } from '$lib/api/entry-mutations';
import { confirmDialog } from '$lib/stores/confirm-dialog.svelte';
import type { DepotFeature, EntryFeature, MainEntryFeature } from '$lib/types/entries';
import { getFirstAssociatedFarmId, showDepotMutationToast } from '$lib/utils/depot-feedback';
import { routeBuilders } from '$lib/utils/routes';
import { toastError, toastInfo, toastSuccess } from '$lib/utils/toast';
import * as m from '$lib/paraglide/messages.js';

export interface EntryActionsSources {
	ownedFarmIds: () => ReadonlySet<string>;
	onRefreshMyEntries?: () => void | Promise<void>;
}

export interface EntryActions {
	stopRowActionEvent(event: Event): void;
	createEntry(entryType: 'Farm' | 'Depot' | 'Initiative', event: Event): void;
	editEntry(feature: EntryFeature, event: Event): void;
	deleteEntry(feature: EntryFeature, event: Event): Promise<void>;
	deleteDepotFromProfile(depot: DepotFeature): Promise<void>;
}

/**
 * Create / edit / delete for farms, initiatives and depots, including the
 * confirm dialogs, the delete-pending re-entrancy guards and the post-delete
 * refresh ordering. The guards are read only inside these handlers, never by a
 * template, so they are plain closure state rather than runes.
 */
export function createEntryActions(sources: EntryActionsSources): EntryActions {
	let isDepotDeletePending = false;
	let isMainEntryDeletePending = false;

	function stopRowActionEvent(event: Event) {
		event.preventDefault();
		event.stopPropagation();
	}

	async function handleDeleteDepot(feature: DepotFeature) {
		if (isDepotDeletePending) {
			return;
		}

		const confirmed = await confirmDialog.confirm({
			title: m.editor_depot_delete_confirm(),
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel(),
			confirmVariant: 'destructive'
		});
		if (!confirmed) {
			return;
		}

		isDepotDeletePending = true;
		try {
			const farmId = getFirstAssociatedFarmId(feature);
			await deleteDepot(feature.properties.id);
			await goto(routeBuilders.myEntries(), { replaceState: true });
			// Deleting from within #/myentries navigates to the same hash, so the
			// hash-driven owned-entries refresh in createMyEntriesStore won't fire.
			// Trigger it explicitly so the deleted depot disappears immediately.
			await sources.onRefreshMyEntries?.();
			showDepotMutationToast('deleted', farmId);
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete depot ${feature.properties.id}`, error);
			}
			toastError(m.editor_depot_delete_failed());
		} finally {
			isDepotDeletePending = false;
		}
	}

	async function handleDeleteMainEntry(feature: MainEntryFeature) {
		if (isMainEntryDeletePending) {
			return;
		}

		const isFarm = feature.properties.type === 'Farm';
		const name = feature.properties.name;

		let description: string = isFarm
			? m.map_sidebar_delete_farm_confirm_description()
			: m.map_sidebar_delete_initiative_confirm_description();

		// Deleting a farm detaches its depots: the FK cascade removes only the
		// farm↔depot association rows, never the depot records themselves (own or
		// foreign-owned). Surface that consequence when the farm actually has depots.
		if (isFarm) {
			try {
				const farmDetail = await getMainEntry('farms', feature.properties.id);
				const hasDepots =
					farmDetail.properties.type === 'Farm' &&
					(farmDetail.properties.depots?.features.length ?? 0) > 0;
				if (hasDepots) {
					description = `${description} ${m.map_sidebar_delete_farm_confirm_depots_note()}`;
				}
			} catch (error) {
				if (dev) {
					console.warn(`Failed to load depots for farm ${feature.properties.id}`, error);
				}
			}
		}

		const confirmed = await confirmDialog.confirm({
			title: isFarm
				? m.map_sidebar_delete_farm_confirm_title({ name })
				: m.map_sidebar_delete_initiative_confirm_title({ name }),
			description,
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel(),
			confirmVariant: 'destructive'
		});
		if (!confirmed) {
			return;
		}

		isMainEntryDeletePending = true;
		try {
			if (isFarm) {
				await deleteFarm(feature.properties.id);
			} else {
				await deleteInitiative(feature.properties.id);
			}
			await goto(routeBuilders.myEntries(), { replaceState: true });
			// Same-hash navigation won't retrigger the owned-entries refresh, so fire
			// it explicitly; invalidateAll re-runs the layout load so the deleted
			// entry also disappears from the map without a full page reload.
			await sources.onRefreshMyEntries?.();
			await invalidateAll();
			toastSuccess(
				isFarm ? m.map_sidebar_delete_farm_success() : m.map_sidebar_delete_initiative_success()
			);
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete ${feature.properties.type} ${feature.properties.id}`, error);
			}
			toastError(
				isFarm ? m.map_sidebar_delete_farm_failed() : m.map_sidebar_delete_initiative_failed()
			);
		} finally {
			isMainEntryDeletePending = false;
		}
	}

	return {
		stopRowActionEvent,
		createEntry(entryType, event) {
			stopRowActionEvent(event);
			if (entryType === 'Farm') {
				void goto(routeBuilders.farm.create());
				return;
			}
			if (entryType === 'Initiative') {
				void goto(routeBuilders.initiative.create());
				return;
			}

			// A new depot always attaches to one of the user's own farms; point users
			// with no farms at creating a farm first (legacy parity).
			if (sources.ownedFarmIds().size === 0) {
				toastInfo(m.map_sidebar_depot_needs_farm());
				return;
			}

			void goto(routeBuilders.depotLegacy.create());
		},
		editEntry(feature, event) {
			stopRowActionEvent(event);
			const type = feature.properties.type;
			if (type === 'Farm') {
				void goto(routeBuilders.farm.edit(feature.properties.id));
				return;
			}
			if (type === 'Initiative') {
				void goto(routeBuilders.initiative.edit(feature.properties.id));
				return;
			}

			void goto(routeBuilders.depotLegacy.edit(feature.properties.id));
		},
		async deleteEntry(feature, event) {
			stopRowActionEvent(event);
			if (feature.properties.type === 'Depot') {
				await handleDeleteDepot(feature as DepotFeature);
				return;
			}
			await handleDeleteMainEntry(feature as MainEntryFeature);
		},
		async deleteDepotFromProfile(depot) {
			if (isDepotDeletePending) {
				return;
			}

			const confirmed = await confirmDialog.confirm({
				title: m.editor_depot_delete_confirm(),
				confirmLabel: m.map_sidebar_action_delete(),
				cancelLabel: m.editor_cancel(),
				confirmVariant: 'destructive'
			});
			if (!confirmed) {
				return;
			}

			isDepotDeletePending = true;
			try {
				await deleteDepot(depot.properties.id);
				// Reload the open farm profile so the deleted depot card disappears.
				await invalidateAll();
				await sources.onRefreshMyEntries?.();
				toastSuccess(m.editor_depot_saved_deleted());
			} catch (error) {
				if (dev) {
					console.warn(`Failed to delete depot ${depot.properties.id}`, error);
				}
				toastError(m.editor_depot_delete_failed());
			} finally {
				isDepotDeletePending = false;
			}
		}
	};
}
