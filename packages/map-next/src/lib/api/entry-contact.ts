import type { MainEntryType } from '$lib/types/entries';
import { apiFetch } from '$lib/api/client';

export interface SendEntryContactMessageParams {
	id: string;
	type: MainEntryType;
	senderName: string;
	senderEmail: string;
	text: string;
}

export interface SendEntryContactMessageResponse {
	id: string;
	type: MainEntryType;
	senderName: string;
	senderEmail: string;
	text: string;
}

export async function sendEntryContactMessage(
	params: SendEntryContactMessageParams
): Promise<SendEntryContactMessageResponse> {
	return apiFetch<SendEntryContactMessageResponse>('entrycontactmessage', {
		method: 'POST',
		body: params,
		errorMessage: 'Contact message could not be sent'
	});
}
