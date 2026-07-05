import type { PageLoad } from './$types';
import { getMainEntry } from '$lib/api/entry-details';

export const load: PageLoad = async ({ params }) => {
	try {
		const detailData = await getMainEntry('farms', params.id);
		return { detailData, detailType: 'Farm' as const };
	} catch {
		// Render the designed error state in the drawer instead of bubbling to
		// SvelteKit's error page (the app also runs embedded in host pages).
		return { detailType: 'Farm' as const, loadError: true };
	}
};
