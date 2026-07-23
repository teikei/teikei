import * as m from '$lib/paraglide/messages.js';
import { translateMonth } from '$lib/utils/translations';

/**
 * Legacy-style founded line for a farm profile header, e.g.
 * "Solidarische Landwirtschaft seit Mai 2020". Returns an empty string when the
 * farm has no founded year. Shared by the profile header (F12.1) so the string
 * is produced identically wherever it is shown.
 */
export function formatFoundedLine(founded: {
	foundedAtYear?: number | null;
	foundedAtMonth?: number | null;
}): string {
	if (!founded.foundedAtYear) {
		return '';
	}
	const monthText = founded.foundedAtMonth ? translateMonth(founded.foundedAtMonth) : '';
	const foundedAt = new Date(founded.foundedAtYear, (founded.foundedAtMonth || 1) - 1);
	const temporalWord = foundedAt < new Date() ? m.forms_labels_since() : m.forms_labels_from();
	return `${m.page_header_solawi()} ${temporalWord} ${monthText} ${founded.foundedAtYear}`
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Single-line address for an entry, e.g. "Hofweg 3, 49565 Bramsche". Shared by
 * the drawer headers so read-mode location text reads identically wherever it
 * is shown. Returns an empty string when no address parts are present.
 */
export function formatEntryAddress(place: {
	address?: string | null;
	postalcode?: string;
	city?: string;
}): string {
	const line = [place.postalcode, place.city].filter(Boolean).join(' ');
	return [place.address, line].filter(Boolean).join(', ');
}
