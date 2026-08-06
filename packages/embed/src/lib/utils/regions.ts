import { REGION_CATALOG } from '$lib/config/regions';

export interface RegionOption {
	value: string;
	label: string;
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
