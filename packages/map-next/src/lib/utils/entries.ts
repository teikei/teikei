import { Wheat, Store, Users } from 'lucide-svelte';
import type { EntryType } from '$lib/types/entries';

export function getEntryIcon(type: EntryType) {
	switch (type) {
		case 'Farm':
			return Wheat;
		case 'Depot':
			return Store;
		case 'Initiative':
			return Users;
	}
}
