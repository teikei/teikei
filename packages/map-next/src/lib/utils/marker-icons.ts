import FarmIcon from '$lib/assets/markers/farm.svg';
import InitiativeIcon from '$lib/assets/markers/initiative.svg';
import DepotIcon from '$lib/assets/markers/depot.svg';

export const markerIcons: Record<string, string> = {
	farm: FarmIcon,
	initiative: InitiativeIcon,
	depot: DepotIcon
};

export const defaultMarkerIcon = DepotIcon;

export function getPlaceIcon(type?: string | null): string {
	if (!type) {
		return defaultMarkerIcon;
	}

	const normalizedType = type.toLowerCase();
	return markerIcons[normalizedType] ?? defaultMarkerIcon;
}
