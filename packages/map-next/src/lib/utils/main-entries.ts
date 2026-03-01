import type { MainEntryType } from '$lib/types/entries';

export type MainEntryResource = 'farms' | 'initiatives';

export function mainEntryTypeToResource(type: MainEntryType): MainEntryResource {
	return `${type.toLowerCase()}s` as MainEntryResource;
}
