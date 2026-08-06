import type { PageLoad } from './$types';
import { getMainEntry } from '$lib/api/entry-details';
import { loadCatching } from '$lib/utils/load-error';
import { routeBuilders } from '$lib/utils/routes';

// The entry payload is returned under `contactData` (not `detailData`) so the
// drawer renders the contact view instead of the profile for the same entry.
export const load: PageLoad = ({ params }) =>
	loadCatching(
		routeBuilders.initiative.contact(params.id),
		async () => {
			const contactData = await getMainEntry('initiatives', params.id);
			return { contactData, detailType: 'Initiative' as const };
		},
		{ detailType: 'Initiative' as const }
	);
