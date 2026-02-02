import type { LayoutLoad } from './$types';
import { getEntries } from '$lib/api/entries';

export const load: LayoutLoad = async () => {
	const entries = await getEntries();
	return { entries };
};
