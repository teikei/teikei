import { z } from 'zod';
import type { DepotFeature, MainEntryFeature } from '$lib/types/entries';
import type {
	DepotMutationPayload,
	FarmMutationPayload,
	InitiativeMutationPayload
} from '$lib/api/entry-mutations';
import {
	mapCommonAddressPayload,
	nullIfEmpty,
	parseNumberOrNull,
	parseRelationId,
	toCommonFormState
} from '$lib/utils/editor-form';

/**
 * Validation-message keys (resolved by `translateErrors`) reused across schemas.
 * Kept as raw keys so superforms surfaces them in `$errors` and the form
 * components translate them at render time.
 */
const REQUIRED = 'forms_validation_required';
const INVALID_COORDINATES = 'editor_error_invalid_coordinates';
const ADDRESS_REQUIRED = 'editor_error_address_required';

/** Required coordinate field: a non-empty string that parses to a finite number. */
function coordinateField() {
	return z.string().refine(
		(value) => {
			const trimmed = value.trim();
			return trimmed.length > 0 && Number.isFinite(Number(trimmed));
		},
		{ message: INVALID_COORDINATES }
	);
}

/**
 * Address + identity fields shared by every entry editor. The values mirror the
 * form inputs (all strings); payload mappers convert them to API types.
 */
const commonFields = {
	name: z.string().min(1, REQUIRED),
	url: z.string(),
	description: z.string(),
	address: z.string(),
	street: z.string(),
	housenumber: z.string(),
	postalcode: z.string(),
	city: z.string().min(1, ADDRESS_REQUIRED),
	state: z.string(),
	country: z.string(),
	latitude: coordinateField(),
	longitude: coordinateField()
};

/**
 * Combined farm + initiative editor schema. Both entry types are edited by the
 * same component, so the shape is a superset; the active `entryType` decides
 * which fields render and which payload mapper runs.
 */
export const mainEntryFormSchema = z.object({
	...commonFields,
	products: z.array(z.string()),
	goals: z.array(z.string()),
	badges: z.array(z.string()),
	additionalProductInformation: z.string(),
	actsEcological: z.boolean(),
	economicalBehavior: z.string(),
	foundedAtYear: z.string(),
	foundedAtMonth: z.string(),
	acceptsNewMembers: z.enum(['yes', 'no', 'waitlist']),
	maximumMembers: z.string(),
	participation: z.string()
});

export const depotFormSchema = z.object({
	...commonFields,
	deliveryDays: z.string(),
	farms: z.array(z.string()).min(1, 'editor_depot_error_missing_farm')
});

export type MainEntryFormData = z.infer<typeof mainEntryFormSchema>;
export type DepotFormData = z.infer<typeof depotFormSchema>;

export function createEmptyMainEntryForm(): MainEntryFormData {
	return {
		name: '',
		url: '',
		description: '',
		address: '',
		street: '',
		housenumber: '',
		postalcode: '',
		city: '',
		state: '',
		country: '',
		latitude: '',
		longitude: '',
		products: [],
		goals: [],
		badges: [],
		additionalProductInformation: '',
		actsEcological: false,
		economicalBehavior: '',
		foundedAtYear: '',
		foundedAtMonth: '',
		acceptsNewMembers: 'yes',
		maximumMembers: '',
		participation: ''
	};
}

/**
 * Builds the combined main-entry form state from an existing feature (edit) or
 * returns an empty form (create). Reads only the fields relevant to the
 * feature's discriminated type; the rest keep their empty defaults.
 */
export function mainEntryFormFromFeature(entry: MainEntryFeature | undefined): MainEntryFormData {
	const base = createEmptyMainEntryForm();
	if (!entry) {
		return base;
	}

	const common = toCommonFormState(entry);

	if (entry.properties.type === 'Farm') {
		const props = entry.properties;
		return {
			...base,
			...common,
			products: (props.products ?? []).map((product) => String(product.id)),
			badges: (props.badges ?? []).map((badge) => String(badge.id)),
			additionalProductInformation: props.additionalProductInformation ?? '',
			actsEcological: !!props.actsEcological,
			economicalBehavior: props.economicalBehavior ?? '',
			foundedAtYear: props.foundedAtYear != null ? String(props.foundedAtYear) : '',
			foundedAtMonth: props.foundedAtMonth != null ? String(props.foundedAtMonth) : '',
			acceptsNewMembers: props.acceptsNewMembers ?? 'yes',
			maximumMembers: props.maximumMembers != null ? String(props.maximumMembers) : '',
			participation: props.participation ?? ''
		};
	}

	const props = entry.properties;
	return {
		...base,
		...common,
		goals: (props.goals ?? []).map((goal) => String(goal.id)),
		badges: (props.badges ?? []).map((badge) => String(badge.id))
	};
}

export function createEmptyDepotForm(): DepotFormData {
	return {
		name: '',
		url: '',
		description: '',
		address: '',
		street: '',
		housenumber: '',
		postalcode: '',
		city: '',
		state: '',
		country: '',
		latitude: '',
		longitude: '',
		deliveryDays: '',
		farms: []
	};
}

export function depotFormFromFeature(entry: DepotFeature | undefined): DepotFormData {
	const base = createEmptyDepotForm();
	if (!entry) {
		return base;
	}

	const props = entry.properties;
	return {
		...base,
		...toCommonFormState(entry),
		deliveryDays: props.deliveryDays ?? '',
		farms: (props.farms?.features ?? []).map((farm) => String(farm.properties.id))
	};
}

export function mapFarmPayload(form: MainEntryFormData): FarmMutationPayload {
	return {
		...mapCommonAddressPayload(form),
		acceptsNewMembers: form.acceptsNewMembers,
		foundedAtYear: parseNumberOrNull(form.foundedAtYear),
		foundedAtMonth: parseNumberOrNull(form.foundedAtMonth),
		maximumMembers: parseNumberOrNull(form.maximumMembers),
		additionalProductInformation: nullIfEmpty(form.additionalProductInformation),
		participation: nullIfEmpty(form.participation),
		actsEcological: form.actsEcological,
		economicalBehavior: nullIfEmpty(form.economicalBehavior),
		products: form.products.map(parseRelationId),
		badges: form.badges.map(parseRelationId)
	};
}

export function mapInitiativePayload(form: MainEntryFormData): InitiativeMutationPayload {
	return {
		...mapCommonAddressPayload(form),
		goals: form.goals.map(parseRelationId),
		badges: form.badges.map(parseRelationId)
	};
}

export function mapDepotPayload(form: DepotFormData): DepotMutationPayload {
	return {
		...mapCommonAddressPayload(form),
		deliveryDays: nullIfEmpty(form.deliveryDays),
		farms: form.farms.map(parseRelationId)
	};
}
