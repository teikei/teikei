import * as m from '$lib/paraglide/messages.js';

export function translateError(key: string): string {
	const messageFn = m[key as keyof typeof m] as ((inputs?: object) => string) | undefined;
	if (typeof messageFn === 'function') {
		return messageFn();
	}
	return key;
}

export function translateErrorsToArray(error: string | string[]): string[] {
	if (Array.isArray(error)) {
		return error.map((key) => translateError(key.trim()));
	}
	return error.split(',').map((key) => translateError(key.trim()));
}

export function translateErrors(error: string | string[] | undefined): string | undefined {
	if (!error) {
		return undefined;
	}
	return translateErrorsToArray(error).join(' ');
}
