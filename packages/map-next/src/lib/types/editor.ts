import type { Badge, Goal, MainEntryType, Product } from '$lib/types/entries';

export type EntryEditorMode = 'create' | 'edit';

export interface EntryEditorData {
	mode: EntryEditorMode;
	entryType: MainEntryType;
	products: Product[];
	goals: Goal[];
	badges: Badge[];
}
