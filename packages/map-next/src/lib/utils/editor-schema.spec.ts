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
		address: 'Bahnhofstrasse 1, Zurich',
		latitude: '47.37',
		longitude: '8.55'
	};
}

function validDepotForm() {
	return {
		...createEmptyDepotForm(),
		name: 'New Depot',
		city: 'Zurich',
		address: 'Bahnhofstrasse 1, Zurich',
		latitude: '47.39',
		longitude: '8.58',
		farms: ['farm-1']
	};
}

describe('mainEntryFormSchema', () => {
	it('accepts a form with name, city and valid coordinates (other fields empty)', () => {
		expect(mainEntryFormSchema.safeParse(validMainEntryForm()).success).toBe(true);
	});

	it('requires name and city; address stays optional (a bare village/town pick is valid)', () => {
		const result = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			name: '',
			city: '',
			address: ''
		});
		expect(result.success).toBe(false);
		const messages = issueMessages(result.error!.issues);
		expect(messages.name).toBe('forms_validation_required');
		expect(messages.city).toBe('editor_error_address_required');
		expect(messages.address).toBeUndefined();
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

	it('accepts an empty url and rejects an invalid one', () => {
		const empty = mainEntryFormSchema.safeParse({ ...validMainEntryForm(), url: '' });
		expect(empty.success).toBe(true);

		const invalid = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			url: 'not a url'
		});
		expect(invalid.success).toBe(false);
		expect(issueMessages(invalid.error!.issues).url).toBe('editor_error_invalid_url');

		const valid = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			url: 'https://example.org'
		});
		expect(valid.success).toBe(true);
	});

	it('rejects a name longer than 255 characters', () => {
		const result = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			name: 'a'.repeat(256)
		});
		expect(result.success).toBe(false);
		expect(issueMessages(result.error!.issues).name).toBe('editor_error_max_length_short');
	});

	it('rejects a description longer than 1000 characters', () => {
		const result = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			description: 'a'.repeat(1001)
		});
		expect(result.success).toBe(false);
		expect(issueMessages(result.error!.issues).description).toBe('editor_error_max_length_long');
	});

	it('accepts an empty maximumMembers and rejects a negative or non-integer value', () => {
		const empty = mainEntryFormSchema.safeParse({ ...validMainEntryForm(), maximumMembers: '' });
		expect(empty.success).toBe(true);

		const negative = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			maximumMembers: '-1'
		});
		expect(negative.success).toBe(false);
		expect(issueMessages(negative.error!.issues).maximumMembers).toBe(
			'editor_error_invalid_maximum_members'
		);

		const nonInteger = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			maximumMembers: '1.5'
		});
		expect(nonInteger.success).toBe(false);

		const valid = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			maximumMembers: '40'
		});
		expect(valid.success).toBe(true);
	});

	it('accepts an empty foundedAtMonth and rejects a value outside 1-12', () => {
		const empty = mainEntryFormSchema.safeParse({ ...validMainEntryForm(), foundedAtMonth: '' });
		expect(empty.success).toBe(true);

		const tooHigh = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			foundedAtMonth: '13'
		});
		expect(tooHigh.success).toBe(false);
		expect(issueMessages(tooHigh.error!.issues).foundedAtMonth).toBe(
			'editor_error_invalid_founded_month'
		);

		const valid = mainEntryFormSchema.safeParse({
			...validMainEntryForm(),
			foundedAtMonth: '6'
		});
		expect(valid.success).toBe(true);
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
				products: [{ id: '1', category: 'veg', name: 'veg', type: 'Product', link: '' }],
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
				goals: [{ id: '10', name: 'land', type: 'Goal', link: '' }]
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
