// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {
	DepotFeature,
	EntryFeatureCollection,
	MainEntryFeature,
	MainEntryType
} from '$lib/types/entries';
import type { DepotEditorData, EntryEditorData } from '$lib/types/editor';
import type { DiscoveryFocus } from '$lib/types/discovery';
import type { CurrentUser } from '$lib/types/user';

declare global {
	namespace App {
		/**
		 * Union of every shape a route `load` can contribute to `page.data`.
		 * All keys are optional because each is produced by only some routes;
		 * the always-mounted `MapSidebar`/`Map` read them off the shared
		 * `page.data` instead of receiving them as props.
		 */
		interface PageData {
			/** Provided by the root layout load for every route. */
			entries?: EntryFeatureCollection;
			/** Farm/initiative detail + edit routes. */
			detailData?: MainEntryFeature;
			detailType?: MainEntryType;
			/** Farm/initiative contact routes — same payload, contact view instead of profile. */
			contactData?: MainEntryFeature;
			/** Farm/initiative create + edit routes. */
			editorData?: EntryEditorData;
			/** Depot edit route. */
			depotDetailData?: DepotFeature;
			/** Depot create + edit routes. */
			depotEditorData?: DepotEditorData;
			/** Discovery routes (`locations/[id]`, `position/[coords]`). */
			discoveryFocus?: DiscoveryFocus;
			/** Legacy hash redirect route. */
			redirectTarget?: string;
			/** Authenticated user routes (`users/editaccount`, `users/editpassword`). */
			user?: CurrentUser;
			/** Password reset route. */
			resetToken?: string;
		}
	}
}

export {};
