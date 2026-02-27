import { describe, expect, it } from 'vitest';
import { getRegionBounds, getRegionOptionsForCountry } from './regions';

describe('regions helpers', () => {
	it('returns predefined region options for a country', () => {
		const options = getRegionOptionsForCountry('CH');
		expect(options).toEqual(
			expect.arrayContaining([
				{ value: 'ZH', label: 'Zuerich' },
				{ value: 'AG', label: 'Aargau' }
			])
		);
	});

	it('returns region bounds by country and region code', () => {
		expect(getRegionBounds('CH', 'ZH')).toEqual([8.5, 47.2, 8.95, 47.65]);
		expect(getRegionBounds('CH', 'UNKNOWN')).toBeNull();
	});
});
