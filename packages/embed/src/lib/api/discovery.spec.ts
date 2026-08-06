import { beforeEach, describe, expect, it, vi } from 'vitest';
import { geocodeLocationId, getAutocompleteSuggestions } from './discovery';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

describe('discovery api', () => {
	beforeEach(() => {
		fetchMock.mockReset();
	});

	it('requests autocomplete suggestions with entries enabled', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => [{ id: 'farm-1', title: 'Farm One', type: 'farm' }]
		});

		await expect(
			getAutocompleteSuggestions({
				text: 'farm',
				locale: 'de-DE',
				withEntries: true
			})
		).resolves.toEqual([{ id: 'farm-1', title: 'Farm One', type: 'farm' }]);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toContain('/autocomplete?entries=true');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({
			text: 'farm',
			locale: 'de-DE'
		});
	});

	it('geocodes a location id', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 'loc-zh',
				latitude: 47.3769,
				longitude: 8.5417
			})
		});

		await expect(geocodeLocationId('loc-zh')).resolves.toEqual({
			id: 'loc-zh',
			latitude: 47.3769,
			longitude: 8.5417
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toContain('/geocoder');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({
			locationid: 'loc-zh'
		});
	});
});
