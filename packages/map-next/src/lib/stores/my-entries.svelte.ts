import { page } from '$app/state';
import { dev } from '$app/environment';
import type { EntryFeatureCollection } from '$lib/types/entries';
import { getMyEntries } from '$lib/api/entries';
import { authStore } from '$lib/stores/auth.svelte';

const EMPTY_ENTRIES: EntryFeatureCollection = {
	type: 'FeatureCollection',
	features: []
};

function sortOwnedEntries(ownedEntries: EntryFeatureCollection): EntryFeatureCollection {
	return {
		...ownedEntries,
		features: [...ownedEntries.features].sort((a, b) => {
			const aUpdatedAt = Date.parse(a.properties.updatedAt ?? '');
			const bUpdatedAt = Date.parse(b.properties.updatedAt ?? '');
			if (!Number.isFinite(aUpdatedAt) && !Number.isFinite(bUpdatedAt)) {
				return 0;
			}
			if (!Number.isFinite(aUpdatedAt)) {
				return 1;
			}
			if (!Number.isFinite(bUpdatedAt)) {
				return -1;
			}
			return bUpdatedAt - aUpdatedAt;
		})
	};
}

export interface MyEntriesStore {
	/** Owned farms/initiatives, sorted by most recently updated. */
	readonly entries: EntryFeatureCollection;
	readonly isLoading: boolean;
}

/**
 * Reactive store for the signed-in user's own entries. Refreshes whenever the
 * auth state or route hash changes. Must be created during component
 * initialization (it registers an `$effect`).
 */
export function createMyEntriesStore(): MyEntriesStore {
	let requestId = 0;
	let isLoading = $state(false);
	let entries = $state<EntryFeatureCollection>(EMPTY_ENTRIES);

	async function refresh(): Promise<void> {
		if (!authStore.isInitialized || !authStore.user) {
			requestId += 1;
			isLoading = false;
			entries = EMPTY_ENTRIES;
			return;
		}

		const currentRequestId = ++requestId;
		isLoading = true;
		try {
			const ownedEntries = await getMyEntries();
			if (currentRequestId !== requestId) {
				return;
			}
			entries = sortOwnedEntries(ownedEntries);
		} catch (error) {
			if (currentRequestId !== requestId) {
				return;
			}
			entries = EMPTY_ENTRIES;
			if (dev) {
				console.warn('Failed to fetch my entries', error);
			}
		} finally {
			if (currentRequestId === requestId) {
				isLoading = false;
			}
		}
	}

	$effect(() => {
		// Refresh owned entries on auth and route transitions. Auth state is read
		// reactively inside refresh(); the route hash is the extra trigger.
		page.url.hash;
		void refresh();
	});

	return {
		get entries() {
			return entries;
		},
		get isLoading() {
			return isLoading;
		}
	};
}
