import config from '$lib/config/app-configuration';
import type { Badge, Goal, Product } from '$lib/types/entries';

const { apiBaseUrl } = config;

async function fetchCatalogJson<T>(path: string): Promise<T[]> {
	const response = await fetch(`${apiBaseUrl}/${path}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${path}`);
	}

	return response.json() as Promise<T[]>;
}

export async function getProducts(): Promise<Product[]> {
	return fetchCatalogJson<Product>('products');
}

export async function getGoals(): Promise<Goal[]> {
	return fetchCatalogJson<Goal>('goals');
}

export async function getBadges(): Promise<Badge[]> {
	return fetchCatalogJson<Badge>('badges');
}
