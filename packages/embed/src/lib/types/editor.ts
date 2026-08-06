import type { Badge, Goal, MainEntryType, Product } from '$lib/types/entries';

export type EntryEditorMode = 'create' | 'edit';

export interface EntryEditorData {
	mode: EntryEditorMode;
	entryType: MainEntryType;
	products: Product[];
	goals: Goal[];
	badges: Badge[];
}

export interface DepotFarmOption {
	id: string;
	name: string;
}

export interface DepotEditorData {
	mode: EntryEditorMode;
	/** Farms the current user owns — the default, restricted option source. */
	farmOptions: DepotFarmOption[];
	/** All farms, offered only once the user opts in to connecting a foreign farm. */
	allFarmOptions: DepotFarmOption[];
}
