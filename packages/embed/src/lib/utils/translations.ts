import * as m from '$lib/paraglide/messages.js';

type MessageKey = keyof typeof m;

const productTranslations: Record<string, MessageKey> = {
	beer: 'products_beer',
	bread_and_pastries: 'products_bread_and_pastries',
	cereals: 'products_cereals',
	dairy: 'products_dairy',
	eggs: 'products_eggs',
	fish: 'products_fish',
	fruits: 'products_fruits',
	honey: 'products_honey',
	juice: 'products_juice',
	meat: 'products_meat',
	milk: 'products_milk',
	mushrooms: 'products_mushrooms',
	sausages: 'products_sausages',
	spices: 'products_spices',
	vegetables: 'products_vegetables',
	wine: 'products_wine'
};

const categoryTranslations: Record<string, MessageKey> = {
	animal_products: 'productcategories_animal_products',
	beverages: 'productcategories_beverages',
	vegetable_products: 'productcategories_vegetable_products'
};

const typeTranslations: Record<string, MessageKey> = {
	farm: 'entry_type_farm',
	initiative: 'entry_type_initiative',
	depot: 'entry_type_depot'
};

const goalTranslations: Record<string, MessageKey> = {
	consumers: 'forms_labels_goals_consumers',
	land: 'forms_labels_goals_land',
	organizers: 'forms_labels_goals_organizers',
	staff: 'forms_labels_goals_staff'
};

const monthTranslations: Record<number, MessageKey> = {
	1: 'months_january',
	2: 'months_february',
	3: 'months_march',
	4: 'months_april',
	5: 'months_may',
	6: 'months_june',
	7: 'months_july',
	8: 'months_august',
	9: 'months_september',
	10: 'months_october',
	11: 'months_november',
	12: 'months_december'
};

function translateFromMap<K extends string | number>(
	lookup: Record<K, MessageKey>,
	value: K,
	fallback: string
): string {
	const key = lookup[value];
	if (key && typeof m[key] === 'function') {
		return (m[key] as () => string)();
	}
	return fallback;
}

export function translateProduct(name: string): string {
	return translateFromMap(productTranslations, name, name);
}

export function translateCategory(name: string): string {
	return translateFromMap(categoryTranslations, name, name);
}

export function translateType(type: string): string {
	return translateFromMap(typeTranslations, type.toLowerCase(), type);
}

export function translateGoal(name: string): string {
	return translateFromMap(goalTranslations, name, name);
}

export function translateMonth(month: number): string {
	return translateFromMap(monthTranslations, month, String(month));
}
