/**
 * Map focus target resolved by the discovery routes (`locations/[id]`,
 * `position/[coords]`) and handed to `Map.svelte` via `page.data.discoveryFocus`.
 */
export interface DiscoveryFocus {
	kind: 'location' | 'position';
	latitude: number;
	longitude: number;
	id?: string;
	coords?: string;
}
