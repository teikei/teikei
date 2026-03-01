import type { MainEntryType } from '$lib/types/entries';

export function entryTypeToPlaceType(type: MainEntryType): 'farms' | 'initiatives' {
	return `${type.toLowerCase()}s` as 'farms' | 'initiatives';
}
