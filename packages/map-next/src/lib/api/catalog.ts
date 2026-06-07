import type { Badge, Goal, Product } from '$lib/types/entries';
import { apiFetch } from '$lib/api/client';

export async function getProducts(): Promise<Product[]> {
	return apiFetch<Product[]>('products', { errorMessage: 'Failed to fetch products' });
}

export async function getGoals(): Promise<Goal[]> {
	return apiFetch<Goal[]>('goals', { errorMessage: 'Failed to fetch goals' });
}

export async function getBadges(): Promise<Badge[]> {
	return apiFetch<Badge[]>('badges', { errorMessage: 'Failed to fetch badges' });
}
