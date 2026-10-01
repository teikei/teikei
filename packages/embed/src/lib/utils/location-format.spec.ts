import { describe, expect, it } from 'vitest';
import { formatRegionType } from './location-format';

describe('formatRegionType', () => {
	it('labels Swiss states as Kanton and other states as Bundesland', () => {
		expect(formatRegionType({ administrativeAreaType: 'state', countryCode: 'CHE' })).toBe(
			'Kanton'
		);
		expect(formatRegionType({ administrativeAreaType: 'state', countryCode: 'DEU' })).toBe(
			'Bundesland'
		);
	});

	it('returns an empty string for cities and addresses', () => {
		expect(formatRegionType({ countryCode: 'CHE' })).toBe('');
	});
});
