import config from '$lib/config/app-configuration';
import type { MainEntryFeature } from '$lib/types/entries';
import { getAccessToken } from '$lib/utils/localStorage';

const { apiBaseUrl } = config;

type RelationId = string | number;

export interface FarmMutationPayload {
	name: string;
	city: string;
	latitude: number;
	longitude: number;
	address: string | null;
	street: string | null;
	housenumber: string | null;
	description: string | null;
	url: string | null;
	country: string | null;
	state: string | null;
	postalcode: string | null;
	acceptsNewMembers: 'yes' | 'no' | 'waitlist';
	foundedAtYear: number | null;
	foundedAtMonth: number | null;
	maximumMembers: number | null;
	additionalProductInformation: string | null;
	participation: string | null;
	actsEcological: boolean;
	economicalBehavior: string | null;
	products: RelationId[];
	badges: RelationId[];
}

export interface InitiativeMutationPayload {
	name: string;
	city: string;
	latitude: number;
	longitude: number;
	address: string | null;
	street: string | null;
	housenumber: string | null;
	description: string | null;
	url: string | null;
	country: string | null;
	state: string | null;
	postalcode: string | null;
	goals: RelationId[];
	badges: RelationId[];
}

function getAuthenticatedHeaders(): HeadersInit {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('Authentication required');
	}

	return {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json'
	};
}

async function fetchEntryMutation<TPayload>(
	path: string,
	method: 'POST' | 'PATCH',
	payload: TPayload
): Promise<MainEntryFeature> {
	const response = await fetch(`${apiBaseUrl}/${path}`, {
		method,
		headers: getAuthenticatedHeaders(),
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} ${path}`);
	}

	return response.json() as Promise<MainEntryFeature>;
}

export async function createFarm(payload: FarmMutationPayload): Promise<MainEntryFeature> {
	return fetchEntryMutation('farms', 'POST', payload);
}

export async function updateFarm(
	id: string,
	payload: FarmMutationPayload
): Promise<MainEntryFeature> {
	return fetchEntryMutation(`farms/${encodeURIComponent(id)}`, 'PATCH', payload);
}

export async function createInitiative(
	payload: InitiativeMutationPayload
): Promise<MainEntryFeature> {
	return fetchEntryMutation('initiatives', 'POST', payload);
}

export async function updateInitiative(
	id: string,
	payload: InitiativeMutationPayload
): Promise<MainEntryFeature> {
	return fetchEntryMutation(`initiatives/${encodeURIComponent(id)}`, 'PATCH', payload);
}
