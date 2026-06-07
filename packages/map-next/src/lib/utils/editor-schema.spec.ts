import { describe, expect, it } from 'vitest';
import type { FarmFeature, InitiativeFeature, DepotFeature } from '$lib/types/entries';
import {
	createEmptyMainEntryForm,
	createEmptyDepotForm,
	depotFormFromFeature,
	depotFormSchema,
	mainEntryFormFromFeature,
	mainEntryFormSchema,
	mapDepotPayload,
	mapFarmPayload,
	mapInitiativePayload
} from './editor-schema';

/** Maps a zod issue list to a `path -> message` lookup for concise assertions. */
function issueMessages(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
	const result: Record<string, string> = {};
	for (const issue of issues) {
		result[issue.path.join('.')] = issue.message;
	}
	return result;
}

function validMainEntryForm() {
	return {
		...createEmptyMainEntryForm(),
		name: 'New Farm',
		city: 'Zurich',
		latitude: '47.37',
		longitude: '8.55'
	};
}

function validDepotForm() {
	return {
		...createEmptyDepotForm(),
		name: 'New Depot',
		city: 'Zurich',
		latitude: '47.39',
		longitude: '8.58',
		farms: ['farm-1']
	};
}

describe('mainEntryFormSchema', () => {
	it('accepts a form with name, city and valid coordinates (other fields empty)', () => {
		expect(mainEntryFormSchema.safeParse(validMainEntryForm()).success).toBe(true);
	});

	it('requires name and city', () => {
		const result = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			name: '',
			city: ''
		});
		expect(result.success).toBe(false);
		const messages = issueMessages(result.error!.issues);
		expect(messages.name).toBe('forms_validation_required');
		expect(messages.city).toBe('forms_validation_required');
	});

	it('rejects empty or non-numeric coordinates', () => {
		const empty = mainEntryFormSchema.safeParse({ ...validMainEntryForm(), latitude: '' });
		expect(empty.success).toBe(false);
		expect(issueMessages(empty.error!.issues).latitude).toBe('editor_error_invalid_coordinates');

		const nonNumeric = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			longitude: 'not-a-number'
		});
		expect(nonNumeric.success).toBe(false);
		expect(issueMessages(nonNumeric.error!.issues).longitude).toBe(
			'editor_error_invalid_coordinates'
		);
	});
});

describe('depotFormSchema', () => {
	it('accepts a depot form with at least one farm selected', () => {
		expect(depotFormSchema.safeParse(validDepotForm()).success).toBe(true);
	});

	it('requires at least one associated farm', () => {
		const result = depotFormSchema.safeParse({ ...validDepotForm(), farms: [] });
		expect(result.success).toBe(false);
		expect(issueMessages(result.error!.issues).farms).toBe('editor_depot_error_missing_farm');
	});
});

describe('payload mappers', () => {
	it('maps a farm form to the mutation payload (coordinates parsed, empties nulled)', () => {
		const payload = mapFarmPayload({
			...createEmptyMainEntryForm(),
			name: '  New Farm  ',
			city: 'Zurich',
			latitude: '47.37',
			longitude: '8.55',
			url: '',
			foundedAtYear: '2020',
			foundedAtMonth: '',
			maximumMembers: '40',
			actsEcological: true,
			products: ['1', 'prod-x'],
			badges: ['99']
		});

		expect(payload.name).toBe('New Farm');
		expect(payload.latitude).toBe(47.37);
		expect(payload.longitude).toBe(8.55);
		expect(payload.url).toBeNull();
		expect(payload.foundedAtYear).toBe(2020);
		expect(payload.foundedAtMonth).toBeNull();
		expect(payload.maximumMembers).toBe(40);
		expect(payload.actsEcological).toBe(true);
		// Numeric relation ids are coerced to numbers; non-numeric stay strings.
		expect(payload.products).toEqual([1, 'prod-x']);
		expect(payload.badges).toEqual([99]);
	});

	it('maps an initiative form to the mutation payload', () => {
		const payload = mapInitiativePayload({
			...createEmptyMainEntryForm(),
			name: 'Init',
			city: 'Zurich',
			latitude: '47.37',
			longitude: '8.55',
			goals: ['10'],
			badges: []
		});

		expect(payload.goals).toEqual([10]);
		expect(payload.badges).toEqual([]);
		expect(payload.latitude).toBe(47.37);
	});

	it('maps a depot form, nulling empty delivery days', () => {
		const payload = mapDepotPayload({
			...validDepotForm(),
			deliveryDays: ''
		});

		expect(payload.deliveryDays).toBeNull();
		expect(payload.farms).toEqual(['farm-1']);
	});
});

describe('form builders', () => {
	it('returns an empty form for an undefined main entry', () => {
		expect(mainEntryFormFromFeature(undefined)).toEqual(createEmptyMainEntryForm());
	});

	it('hydrates farm-specific fields from a farm feature', () => {
		const farm: FarmFeature = {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.55, 47.37] },
			properties: {
				id: 'farm-1',
				type: 'Farm',
				name: 'Owned Farm',
				postalcode: '8000',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: '',
				products: [{ id: 1, category: 'veg', name: 'veg', type: 'Product', link: '' }],
				acceptsNewMembers: 'waitlist',
				foundedAtYear: 2019,
				maximumMembers: 12
			}
		};

		const form = mainEntryFormFromFeature(farm);
		expect(form.name).toBe('Owned Farm');
		expect(form.latitude).toBe('47.37');
		expect(form.longitude).toBe('8.55');
		expect(form.products).toEqual(['1']);
		expect(form.acceptsNewMembers).toBe('waitlist');
		expect(form.foundedAtYear).toBe('2019');
		expect(form.maximumMembers).toBe('12');
	});

	it('hydrates goals from an initiative feature', () => {
		const initiative: InitiativeFeature = {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'init-1',
				type: 'Initiative',
				name: 'Owned Initiative',
				postalcode: '8001',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: '',
				goals: [{ id: 10, name: 'land', type: 'Goal', link: '' }]
			}
		};

		const form = mainEntryFormFromFeature(initiative);
		expect(form.name).toBe('Owned Initiative');
		expect(form.goals).toEqual(['10']);
		expect(form.products).toEqual([]);
	});

	it('hydrates associated farm ids from a depot feature', () => {
		const depot: DepotFeature = {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.58, 47.39] },
			properties: {
				id: 'depot-1',
				type: 'Depot',
				name: 'Owned Depot',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: '',
				deliveryDays: 'Mon',
				farms: {
					type: 'FeatureCollection',
					features: [
						{
							type: 'Feature',
							geometry: { type: 'Point', coordinates: [8.55, 47.37] },
							properties: {
								id: 'farm-1',
								type: 'Farm',
								name: 'Owned Farm',
								postalcode: '8000',
								city: 'Zurich',
								state: 'ZH',
								country: 'CH',
								link: '',
								products: []
							}
						}
					]
				}
			}
		};

		const form = depotFormFromFeature(depot);
		expect(form.name).toBe('Owned Depot');
		expect(form.deliveryDays).toBe('Mon');
		expect(form.farms).toEqual(['farm-1']);
	});
});
