import config from '$lib/config/app-configuration';
import type { MainEntryType } from '$lib/types/entries';

const { apiBaseUrl } = config;

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
	const response = await fetch(`${apiBaseUrl}/entrycontactmessage`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(params)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Contact message could not be sent');
	}

	return response.json() as Promise<SendEntryContactMessageResponse>;
}
