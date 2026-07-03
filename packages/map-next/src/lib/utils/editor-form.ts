import * as m from '$lib/paraglide/messages.js';
import type { EntryFeature } from '$lib/types/entries';

/**
 * Address and coordinate fields shared by every entry editor (farm, initiative,
 * depot). Type-specific fields live in the individual editor form states.
 */
export interface CommonFormState {
	name: string;
	url: string;
	description: string;
	address: string;
	street: string;
	housenumber: string;
	postalcode: string;
	city: string;
	state: string;
	country: string;
	latitude: string;
	longitude: string;
}

/**
 * The common subset of an entry mutation payload, derived from
 * {@link CommonFormState}. Editors spread this and add type-specific fields.
 */
export interface CommonAddressPayload {
	name: string;
	city: string;
	latitude: number;
	longitude: number;
	address: string | null;
	housenumber: string | null;
	description: string | null;
	url: string | null;
	street?: string;
	country?: string;
	state?: string;
	postalcode?: string;
}

export function createEmptyCommonForm(): CommonFormState {
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
		longitude: ''
	};
}

/**
 * Reads the shared address fields from an entry feature, falling back to empty
 * strings. Coordinates are taken from the GeoJSON geometry.
 */
export function toCommonFormState(feature: EntryFeature | undefined): CommonFormState {
	const props = feature?.properties;
	const coordinates = feature?.geometry?.coordinates ?? [null, null];
	return {
		...createEmptyCommonForm(),
		name: props?.name ?? '',
		url: props?.url ?? '',
		description: props?.description ?? '',
		address: props?.address ?? '',
		street: props?.street ?? '',
		housenumber: props?.housenumber ?? '',
		postalcode: props?.postalcode ?? '',
		city: props?.city ?? '',
		state: props?.state ?? '',
		country: props?.country ?? '',
		latitude: coordinates[1] != null ? String(coordinates[1]) : '',
		longitude: coordinates[0] != null ? String(coordinates[0]) : ''
	};
}

export function nullIfEmpty(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function stringOrUndefined(value: string): string | undefined {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export function parseNumberOrNull(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

export function parseRequiredNumber(value: string): number {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error(m.editor_error_invalid_coordinates());
	}
	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) {
		throw new Error(m.editor_error_invalid_coordinates());
	}
	return parsed;
}

export function parseRelationId(value: string): string | number {
	const parsed = Number(value);
	if (Number.isInteger(parsed) && String(parsed) === value) {
		return parsed;
	}
	return value;
}

export function mapCommonAddressPayload(common: CommonFormState): CommonAddressPayload {
	const street = stringOrUndefined(common.street);
	const country = stringOrUndefined(common.country);
	const state = stringOrUndefined(common.state);
	const postalcode = stringOrUndefined(common.postalcode);

	return {
		name: common.name.trim(),
		city: common.city.trim(),
		latitude: parseRequiredNumber(common.latitude),
		longitude: parseRequiredNumber(common.longitude),
		address: nullIfEmpty(common.address),
		housenumber: nullIfEmpty(common.housenumber),
		description: nullIfEmpty(common.description),
		url: nullIfEmpty(common.url),
		...(street !== undefined ? { street } : {}),
		...(country !== undefined ? { country } : {}),
		...(state !== undefined ? { state } : {}),
		...(postalcode !== undefined ? { postalcode } : {})
	};
}

/**
 * Returns whether a superforms `$tainted` tree contains any tainted leaf.
 * Used to drive the unsaved-changes guard from superforms' tainted state.
 */
export function hasTaintedField(tainted: unknown): boolean {
	if (tainted === true) {
		return true;
	}
	if (Array.isArray(tainted)) {
		return tainted.some(hasTaintedField);
	}
	if (tainted && typeof tainted === 'object') {
		return Object.values(tainted).some(hasTaintedField);
	}
	return false;
}

/**
 * A group of form fields belonging to one editor section, used to point users
 * at the section(s) containing validation errors (Feature 9.4 save-bar error
 * indicator).
 */
export interface EditorSectionErrorGroup {
	/** Translated section title shown in the save-bar error summary. */
	title: string;
	/** Form-field keys whose errors belong to this section. */
	fields: string[];
}

/**
 * Name + address/coordinate field keys that belong to the identity section of
 * every main-entry editor (shared by farm and initiative profiles).
 */
export const IDENTITY_FIELD_KEYS: string[] = [
	'name',
	'url',
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

function hasFieldError(value: unknown): boolean {
	return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

/**
 * Whether a superforms `$errors` object contains an error for any of the given
 * field keys — used to gate creation-wizard step advancement (Feature 9.5).
 */
export function fieldsHaveErrors(errors: Record<string, unknown>, fields: string[]): boolean {
	return fields.some((field) => hasFieldError(errors[field]));
}

/**
 * Given a superforms `$errors` object and the editor's section groups, returns
 * the titles of the sections that currently contain at least one field error —
 * in group order — so the save bar can name which sections need attention.
 */
export function sectionsWithErrors(
	errors: Record<string, unknown>,
	groups: EditorSectionErrorGroup[]
): string[] {
	return groups
		.filter((group) => fieldsHaveErrors(errors, group.fields))
		.map((group) => group.title);
}

/**
 * Toggles a value within a multi-select list, returning a new array.
 */
export function toggleSelection(values: string[], value: string, enabled: boolean): string[] {
	if (enabled) {
		return values.includes(value) ? values : [...values, value];
	}
	return values.filter((current) => current !== value);
}
