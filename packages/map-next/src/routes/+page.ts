import { getEntries } from '$lib/api/entries';

export async function load() {
	const entries = await getEntries();
	return {
		entries
	};
}
