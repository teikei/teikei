import type { Page } from '@playwright/test';
import {
	BERLIN,
	POTSDAM,
	deleteFromMyEntries,
	entryIdFromUrl,
	expect,
	openEditorFromMyEntries,
	selectLocation,
	test
} from './helpers';

const ALL_PRODUCTS = [
	'Gemüse',
	'Obst',
	'Pilze',
	'Getreideprodukte (z.B. Mehl, Grieß, Nudeln)',
	'Eier',
	'Fleisch',
	'Wurstwaren',
	'Saft',
	'Wein',
	'Bier'
];

const MEMBER_STATUS = {
	waitlist: {
		editorLabel: 'Wir haben keine freien Plätze, aber eine Warteliste',
		profileText: 'Wir nehmen neue Mitglieder auf! (Warteliste)'
	},
	no: {
		editorLabel: 'Wir haben keine freien Plätze',
		profileText: 'Wir nehmen derzeit keine neuen Mitglieder auf!'
	}
};

interface FarmData {
	name: string;
	url: string;
	description: string;
	location: typeof BERLIN;
	products: string[];
	additionalProductInformation: string;
	actsEcological: boolean;
	economicalBehavior: string;
	foundedYear: string;
	foundedMonth: string;
	foundedLine: string;
	status: keyof typeof MEMBER_STATUS;
	maximumMembers: string;
	participation: string;
}

const created: FarmData = {
	name: 'Integration Farm 1',
	url: 'http://www.example1.com',
	description: 'Beschreibung der Integration Farm',
	location: BERLIN,
	products: ['Gemüse', 'Pilze', 'Eier', 'Wurstwaren', 'Saft', 'Bier'],
	additionalProductInformation: 'Zusätzliche Informationen zum Angebot',
	actsEcological: true,
	economicalBehavior: 'Weitere Erläuterungen',
	foundedYear: '2021',
	foundedMonth: 'März',
	foundedLine: 'Solidarische Landwirtschaft seit März 2021',
	status: 'waitlist',
	maximumMembers: '100',
	participation: 'Die Mitglieder können ernten'
};

const edited: FarmData = {
	name: 'Integration Farm 2',
	url: 'http://www.example2.com',
	description: 'Beschreibung der Integration Farm 2',
	location: POTSDAM,
	products: ['Obst', 'Getreideprodukte (z.B. Mehl, Grieß, Nudeln)', 'Fleisch', 'Wein'],
	additionalProductInformation: 'Zusätzliche Informationen zum Angebot 2',
	actsEcological: false,
	economicalBehavior: 'Weitere Erläuterungen 2',
	foundedYear: '2019',
	foundedMonth: 'Juni',
	foundedLine: 'Solidarische Landwirtschaft seit Juni 2019',
	status: 'no',
	maximumMembers: '20',
	participation: 'Die Mitglieder können ernten 2'
};

async function fillFarmForm(page: Page, farm: FarmData) {
	await page.getByTestId('editor-input-name').fill(farm.name);
	await page.locator('#entry-editor-url').fill(farm.url);
	await page.locator('#entry-editor-description').fill(farm.description);
	await selectLocation(page, 'editor-input-geocoder', farm.location);

	for (const product of ALL_PRODUCTS) {
		await page
			.getByRole('checkbox', { name: product, exact: true })
			.setChecked(farm.products.includes(product));
	}
	await page
		.locator('#entry-editor-additional-product-information')
		.fill(farm.additionalProductInformation);

	await page
		.getByRole('checkbox', { name: 'Dieser Betrieb ist bio-zertifiziert' })
		.setChecked(farm.actsEcological);
	await page.locator('#entry-editor-economical-behavior').fill(farm.economicalBehavior);

	await page.locator('#entry-editor-founded-year').click();
	await page.getByRole('option', { name: farm.foundedYear, exact: true }).click();
	await page.locator('#entry-editor-founded-month').click();
	await page.getByRole('option', { name: farm.foundedMonth, exact: true }).click();
	await page
		.getByRole('radio', { name: MEMBER_STATUS[farm.status].editorLabel, exact: true })
		.check();
	await page.locator('#entry-editor-maximum-members').fill(farm.maximumMembers);
	await page.locator('#entry-editor-participation').fill(farm.participation);
}

// Reloads first so the assertions run against what the API persisted rather
// than against client state left over from the save.
async function expectFarmProfile(page: Page, farm: FarmData) {
	await page.reload();

	await expect(page.getByRole('heading', { name: farm.name })).toBeVisible();
	await expect(page.getByText(farm.foundedLine)).toBeVisible();
	await expect(page.getByTestId('entry-detail-address')).toContainText(
		`${farm.location.postalCode} ${farm.location.city}`
	);
	await expect(page.getByTestId('entry-detail-website')).toHaveAttribute('href', farm.url);
	await expect(page.getByText(farm.description)).toBeVisible();

	// Chips are grouped by category, so compare as sets rather than in form order.
	const chips = page.getByTestId('product-chip');
	await expect(chips).toHaveCount(farm.products.length);
	expect((await chips.allTextContents()).map((text) => text.trim()).sort()).toEqual(
		[...farm.products].sort()
	);
	await expect(page.getByText(farm.additionalProductInformation)).toBeVisible();

	await expect(page.getByText('Dieser Betrieb ist bio-zertifiziert.')).toBeVisible({
		visible: farm.actsEcological
	});
	await expect(page.getByText(farm.economicalBehavior)).toBeVisible();

	await expect(page.getByTestId('membership-status')).toHaveText(
		MEMBER_STATUS[farm.status].profileText
	);
	const membership = page.getByTestId('profile-section-membership');
	await expect(membership).toContainText(farm.participation);
	await expect(membership).toContainText(farm.maximumMembers);
}

test('user can create, edit and delete a farm', async ({ page, api }) => {
	await page.goto('/#/myentries');
	await page.getByTestId('create-farm-action').click();
	await expect(page.getByTestId('entry-editor')).toBeVisible();

	await fillFarmForm(page, created);
	await page.getByTestId('entry-editor-save').click();

	await expect(page).toHaveURL(/#\/farms\/\d+$/);
	const farmId = entryIdFromUrl(page);
	await expectFarmProfile(page, created);

	await openEditorFromMyEntries(page, created.name);
	await expect(page.getByTestId('entry-editor')).toBeVisible();
	await fillFarmForm(page, edited);
	await page.getByTestId('entry-editor-save').click();

	await expect(page).toHaveURL(new RegExp(`#/farms/${farmId}$`));
	await expectFarmProfile(page, edited);

	await deleteFromMyEntries(page, edited.name, 'Hof wurde gelöscht.');
	expect(await api.entryExists('Farm', farmId)).toBe(false);
});
