import { describe, expect, it } from 'vitest';
import { mainEntryTypeToResource } from '$lib/utils/main-entries';

describe('mainEntryTypeToResource', () => {
	it('maps main entry types to their API resource paths', () => {
		expect(mainEntryTypeToResource('Farm')).toBe('farms');
		expect(mainEntryTypeToResource('Initiative')).toBe('initiatives');
	});
});
