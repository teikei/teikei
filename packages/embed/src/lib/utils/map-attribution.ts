import config from '$lib/config/app-configuration';
import * as m from '$lib/paraglide/messages.js';

function link(href: string, label: string): string {
	return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

/** HTML for the MapLibre attribution control: site links plus the map data credit. */
export function buildMapAttribution(): string {
	return [
		link(config.siteUrl, m.footer_site_title()),
		link(config.imprintUrl, m.footer_imprint()),
		link(config.privacyUrl, m.footer_privacy()),
		`${m.footer_map_data()} ${link(config.mapboxAboutUrl, m.footer_mapbox())}`
	].join(' | ');
}
