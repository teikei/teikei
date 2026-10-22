import config from '$lib/config/app-configuration';
import { REGION_CATALOG } from '$lib/config/regions';
import * as m from '$lib/paraglide/messages.js';

export interface RegionOption {
	value: string;
	label: string;
}

const countryLabels: Record<string, () => string> = {
	DE: m.map_country_de,
	CH: m.map_country_ch,
	AT: m.map_country_at
};

export function getCountryOptions(): RegionOption[] {
	return Object.keys(config.countries).map((countryCode) => ({
		value: countryCode,
		label: countryLabels[countryCode]?.() ?? countryCode
	}));
}

export function getRegionOptionsForCountry(countryCode: string): RegionOption[] {
	const regions = REGION_CATALOG[countryCode];
	if (!regions) {
		return [];
	}

	return regions.map((region) => ({
		value: region.code,
		label: region.label
	}));
}

export function getRegionBounds(countryCode: string, regionCode: string) {
	const regions = REGION_CATALOG[countryCode];
	if (!regions) {
		return null;
	}

	const region = regions.find((entry) => entry.code === regionCode);
	return region?.bounds ?? null;
}
