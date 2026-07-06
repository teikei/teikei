import type { DepotFeature, MainEntryFeature } from '$lib/types/entries';
import { apiFetch, type HttpMethod } from '$lib/api/client';
import type { CommonAddressPayload } from '$lib/utils/editor-form';

type RelationId = string | number;

export interface FarmMutationPayload extends CommonAddressPayload {
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

export interface InitiativeMutationPayload extends CommonAddressPayload {
	goals: RelationId[];
	badges: RelationId[];
}

export interface DepotMutationPayload extends CommonAddressPayload {
	deliveryDays: string | null;
	farms: RelationId[];
}

function fetchEntryMutation<TResponse, TPayload>(
	path: string,
	method: Extract<HttpMethod, 'POST' | 'PATCH'>,
	payload: TPayload
): Promise<TResponse> {
	return apiFetch<TResponse>(path, {
		method,
		body: payload,
		auth: 'required',
		errorMessage: `Failed to ${method === 'POST' ? 'create' : 'update'} ${path}`
	});
}

export async function createFarm(payload: FarmMutationPayload): Promise<MainEntryFeature> {
	return fetchEntryMutation<MainEntryFeature, FarmMutationPayload>('farms', 'POST', payload);
}

export async function updateFarm(
	id: string,
	payload: FarmMutationPayload
): Promise<MainEntryFeature> {
	return fetchEntryMutation<MainEntryFeature, FarmMutationPayload>(
		`farms/${encodeURIComponent(id)}`,
		'PATCH',
		payload
	);
}

export async function createInitiative(
	payload: InitiativeMutationPayload
): Promise<MainEntryFeature> {
	return fetchEntryMutation<MainEntryFeature, InitiativeMutationPayload>(
		'initiatives',
		'POST',
		payload
	);
}

export async function updateInitiative(
	id: string,
	payload: InitiativeMutationPayload
): Promise<MainEntryFeature> {
	return fetchEntryMutation<MainEntryFeature, InitiativeMutationPayload>(
		`initiatives/${encodeURIComponent(id)}`,
		'PATCH',
		payload
	);
}

export async function createDepot(payload: DepotMutationPayload): Promise<DepotFeature> {
	return fetchEntryMutation<DepotFeature, DepotMutationPayload>('depots', 'POST', payload);
}

export async function updateDepot(
	id: string,
	payload: DepotMutationPayload
): Promise<DepotFeature> {
	return fetchEntryMutation<DepotFeature, DepotMutationPayload>(
		`depots/${encodeURIComponent(id)}`,
		'PATCH',
		payload
	);
}

export async function deleteFarm(id: string): Promise<MainEntryFeature> {
	return apiFetch<MainEntryFeature>(`farms/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		auth: 'required',
		errorMessage: 'Failed to delete farm'
	});
}

export async function deleteInitiative(id: string): Promise<MainEntryFeature> {
	return apiFetch<MainEntryFeature>(`initiatives/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		auth: 'required',
		errorMessage: 'Failed to delete initiative'
	});
}

export async function deleteDepot(id: string): Promise<DepotFeature> {
	return apiFetch<DepotFeature>(`depots/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		auth: 'required',
		errorMessage: 'Failed to delete depot'
	});
}
