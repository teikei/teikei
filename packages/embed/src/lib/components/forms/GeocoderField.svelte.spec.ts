import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmptyCommonForm, type CommonFormState } from '$lib/utils/editor-form';
import type { AutocompleteSuggestion, GeocoderLocationResponse } from '$lib/api/discovery';
// Provides the `--map-*` custom properties the preview map reads from `:root`.
import '$lib/design/theme-vars.css';

const getAutocompleteSuggestionsMock = vi.hoisted(() =>
	vi.fn<
		(params: {
			text: string;
			locale?: string;
			withEntries?: boolean;
		}) => Promise<AutocompleteSuggestion[]>
	>(async () => [])
);
const geocodeLocationIdMock = vi.hoisted(() =>
	vi.fn<(locationId: string) => Promise<GeocoderLocationResponse>>(async () => {
		throw new Error('geocodeLocationId not mocked for this test');
	})
);

vi.mock('$lib/api/discovery', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/api/discovery')>();
	return {
		...actual,
		getAutocompleteSuggestions: getAutocompleteSuggestionsMock,
		geocodeLocationId: geocodeLocationIdMock
	};
});

import GeocoderField from './GeocoderField.svelte';

const ADDRESS_FIELD_KEYS: (keyof CommonFormState)[] = [
	'address',
	'street',
	'housenumber',
	'postalcode',
	'city',
	'state',
	'country',
	'latitude',
	'longitude'
];

function fields(overrides: Partial<CommonFormState> = {}): CommonFormState {
	return { ...createEmptyCommonForm(), ...overrides };
}

describe('GeocoderField', () => {
	beforeEach(() => {
		getAutocompleteSuggestionsMock.mockReset().mockResolvedValue([]);
		geocodeLocationIdMock.mockReset();
	});

	it('shows the stored "address, city" label for an existing location and leaves it untouched', async () => {
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields({
					address: 'Hofweg 1',
					city: 'Templin',
					latitude: '53.12',
					longitude: '13.51'
				}),
				onFieldChange
			}
		});

		await expect.element(view.getByTestId('geocoder')).toHaveValue('Hofweg 1, Templin');
		expect(onFieldChange).not.toHaveBeenCalled();
		expect(getAutocompleteSuggestionsMock).not.toHaveBeenCalled();
	});

	it('does not search below the minimum character count', async () => {
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields(),
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('B');
		await new Promise((resolve) => setTimeout(resolve, 350));

		expect(getAutocompleteSuggestionsMock).not.toHaveBeenCalled();
	});

	it('fetches location-only suggestions after the debounce delay', async () => {
		getAutocompleteSuggestionsMock.mockResolvedValue([
			{ id: 'loc-1', title: 'Berlin, Germany', type: 'location' }
		]);
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields(),
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('Berlin');

		await expect.poll(() => getAutocompleteSuggestionsMock.mock.calls.length).toBe(1);
		expect(getAutocompleteSuggestionsMock).toHaveBeenCalledWith(
			expect.objectContaining({ text: 'Berlin', withEntries: false })
		);
		await expect.element(view.getByText('Berlin, Germany')).toBeVisible();
	});

	it('selecting a suggestion geocodes it and writes every address/coordinate field', async () => {
		getAutocompleteSuggestionsMock.mockResolvedValue([
			{ id: 'loc-1', title: 'Berlin, Germany', type: 'location' }
		]);
		geocodeLocationIdMock.mockResolvedValue({
			id: 'loc-1',
			street: 'Hauptstraße',
			houseNumber: '5',
			postalCode: '10115',
			city: 'Berlin',
			state: 'Berlin',
			country: 'Germany',
			latitude: 52.52,
			longitude: 13.405
		});
		// Mirrors how the real editors bind `fields` to a reactive superforms
		// store: writes from `onFieldChange` flow back into the prop so the
		// component's derived "address, city" label can update after selection.
		let currentFields = fields();
		const onFieldChange = vi.fn((field: keyof CommonFormState, value: string) => {
			currentFields = { ...currentFields, [field]: value };
			void view.rerender({ fields: currentFields });
		});
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: currentFields,
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('Berlin');
		const suggestion = view.getByText('Berlin, Germany');
		await expect.element(suggestion).toBeVisible();
		await suggestion.click();

		await expect.poll(() => geocodeLocationIdMock.mock.calls.length).toBe(1);
		expect(geocodeLocationIdMock).toHaveBeenCalledWith('loc-1');

		await expect
			.poll(() => onFieldChange.mock.calls.length)
			.toBeGreaterThanOrEqual(ADDRESS_FIELD_KEYS.length);
		const written = Object.fromEntries(onFieldChange.mock.calls) as Record<string, string>;
		expect(written.address).toBe('Hauptstraße 5');
		expect(written.street).toBe('Hauptstraße');
		expect(written.housenumber).toBe('5');
		expect(written.city).toBe('Berlin');
		expect(written.state).toBe('Berlin');
		expect(written.country).toBe('Germany');
		expect(written.postalcode).toBe('10115');
		expect(written.latitude).toBe('52.52');
		expect(written.longitude).toBe('13.405');

		await expect.element(view.getByTestId('geocoder')).toHaveValue('Hauptstraße 5, Berlin');
	});

	it('clearing the input clears every address/coordinate field', async () => {
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields({
					address: 'Hofweg 1',
					street: 'Hofweg',
					housenumber: '1',
					city: 'Templin',
					state: 'Brandenburg',
					country: 'Germany',
					postalcode: '17268',
					latitude: '53.12',
					longitude: '13.51'
				}),
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('');

		await expect.poll(() => onFieldChange.mock.calls.length).toBe(ADDRESS_FIELD_KEYS.length);
		const written = Object.fromEntries(onFieldChange.mock.calls) as Record<string, string>;
		for (const key of ADDRESS_FIELD_KEYS) {
			expect(written[key]).toBe('');
		}
	});

	it('shows a translated error and lets the user retry when geocoding a selection fails', async () => {
		getAutocompleteSuggestionsMock.mockResolvedValue([
			{ id: 'loc-1', title: 'Berlin, Germany', type: 'location' }
		]);
		geocodeLocationIdMock.mockRejectedValueOnce(new Error('network error'));
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields(),
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('Berlin');
		const suggestion = view.getByText('Berlin, Germany');
		await expect.element(suggestion).toBeVisible();
		await suggestion.click();

		await expect.poll(() => geocodeLocationIdMock.mock.calls.length).toBe(1);
		await expect
			.element(
				view.getByText('Der ausgewählte Ort konnte nicht geladen werden. Bitte erneut versuchen.')
			)
			.toBeVisible();
		expect(onFieldChange).not.toHaveBeenCalled();

		// Retyping clears the stale error instead of leaving it stuck forever.
		// (Stays below the search debounce threshold so it doesn't kick off
		// another suggestions fetch that could outlive this test.)
		await view.getByTestId('geocoder').fill('x');
		await expect
			.element(
				view.getByText('Der ausgewählte Ort konnte nicht geladen werden. Bitte erneut versuchen.')
			)
			.not.toBeInTheDocument();
	});

	it('surfaces a passed-in validation error (e.g. invalid stored coordinates) alongside the field', async () => {
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields({ city: 'Zurich' }),
				onFieldChange,
				error: 'editor_error_invalid_coordinates'
			}
		});

		await expect.element(view.getByTestId('geocoder')).toHaveValue('Zurich');
		await expect.element(view.getByText('Bitte gültige Koordinaten eingeben.')).toBeVisible();
	});

	it('typing over an existing stored location clears it until a new selection is made', async () => {
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields({
					address: 'Hofweg 1',
					street: 'Hofweg',
					housenumber: '1',
					city: 'Templin',
					state: 'Brandenburg',
					country: 'Germany',
					postalcode: '17268',
					latitude: '53.12',
					longitude: '13.51'
				}),
				onFieldChange
			}
		});

		// Retype over the existing address without selecting a new suggestion.
		// Stays below the search debounce threshold so it doesn't kick off a
		// suggestions fetch that could outlive this test.
		await view.getByTestId('geocoder').fill('B');

		await expect.poll(() => onFieldChange.mock.calls.length).toBe(ADDRESS_FIELD_KEYS.length);
		const written = Object.fromEntries(onFieldChange.mock.calls) as Record<string, string>;
		for (const key of ADDRESS_FIELD_KEYS) {
			expect(written[key]).toBe('');
		}
	});

	it('ignores a stale geocode response if the user edits again before it resolves', async () => {
		getAutocompleteSuggestionsMock.mockResolvedValue([
			{ id: 'loc-1', title: 'Berlin, Germany', type: 'location' }
		]);
		let resolveGeocode!: (value: GeocoderLocationResponse) => void;
		geocodeLocationIdMock.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					resolveGeocode = resolve;
				})
		);
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields(),
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('Berlin');
		const suggestion = view.getByText('Berlin, Germany');
		await expect.element(suggestion).toBeVisible();
		await suggestion.click();
		await expect.poll(() => geocodeLocationIdMock.mock.calls.length).toBe(1);

		// The user changes their mind before the lookup resolves.
		await view.getByTestId('geocoder').fill('x');
		onFieldChange.mockClear();

		resolveGeocode({
			id: 'loc-1',
			city: 'Berlin',
			latitude: 52.52,
			longitude: 13.405
		});
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(onFieldChange).not.toHaveBeenCalled();
		await expect.element(view.getByTestId('geocoder')).toHaveValue('x');
	});

	it('typed but unselected text never writes fields', async () => {
		getAutocompleteSuggestionsMock.mockResolvedValue([
			{ id: 'loc-1', title: 'Berlin, Germany', type: 'location' }
		]);
		const onFieldChange = vi.fn();
		const view = render(GeocoderField, {
			props: {
				id: 'test-geocoder',
				label: 'Adresse',
				markerType: 'Farm',
				fields: fields(),
				onFieldChange
			}
		});

		await view.getByTestId('geocoder').fill('Berlin');
		await expect.poll(() => getAutocompleteSuggestionsMock.mock.calls.length).toBe(1);

		expect(onFieldChange).not.toHaveBeenCalled();
	});
});
