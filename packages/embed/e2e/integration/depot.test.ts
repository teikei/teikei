import type { Page } from '@playwright/test';
import {
	BERLIN,
	POTSDAM,
	deleteFromMyEntries,
	expect,
	openEditorFromMyEntries,
	selectLocation,
	test
} from './helpers';

interface DepotData {
	name: string;
	url: string;
	description: string;
	deliveryDays: string;
	location: typeof BERLIN;
}

const created: DepotData = {
	name: 'Integration Depot 1',
	url: 'http://www.example1.com',
	description: 'Beschreibung des Depots 1',
	deliveryDays: 'Abholtage 1',
	location: BERLIN
};

const edited: DepotData = {
	name: 'Integration Depot 2',
	url: 'http://www.example2.com',
	description: 'Beschreibung des Depots 2',
	deliveryDays: 'Abholtage 2',
	location: POTSDAM
};

async function fillDepotForm(page: Page, depot: DepotData) {
	await page.getByTestId('depot-input-name').fill(depot.name);
	await page.locator('#depot-editor-url').fill(depot.url);
	await page.locator('#depot-editor-description').fill(depot.description);
	await page.locator('#depot-editor-delivery-days').fill(depot.deliveryDays);
	await selectLocation(page, 'depot-input-geocoder', depot.location);
}

// A depot has no profile of its own: it is shown on its farm's profile, which
// the saved-toast links to. Reloading makes the check run against persisted data.
async function expectDepotOnFarmProfile(page: Page, farmName: string, depot: DepotData) {
	await page
		.locator('[data-sonner-toast]')
		.getByRole('button', { name: 'Zugehörigen Hof anzeigen' })
		.click();
	await expect(page).toHaveURL(/#\/farms\/\d+$/);
	await page.reload();
	await expect(page.getByRole('heading', { name: farmName })).toBeVisible();

	const card = page.getByTestId('depot-card').filter({ hasText: depot.name });
	await card.getByRole('button', { name: new RegExp(depot.name) }).click();
	await expect(card).toContainText(depot.description);
	await expect(card).toContainText(depot.deliveryDays);
	await expect(card.getByTestId('depot-card-website')).toHaveAttribute('href', depot.url);
}

test('user can create, edit and delete a depot', async ({ page, api }) => {
	const farmName = 'Integration Farm for Depot';
	const farmId = await api.createFarm(farmName);

	await page.goto('/#/myentries');
	await page.getByTestId('create-depot-action').click();
	await expect(page.getByTestId('depot-editor')).toBeVisible();

	await fillDepotForm(page, created);
	await page.getByTestId('depot-input-farms').click();
	await page.getByRole('option', { name: farmName }).click();
	await page.getByTestId('depot-editor-save').click();

	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Depot wurde gespeichert.' })
	).toBeVisible();
	await expectDepotOnFarmProfile(page, farmName, created);

	await openEditorFromMyEntries(page, created.name);
	await expect(page.getByTestId('depot-editor')).toBeVisible();
	await fillDepotForm(page, edited);
	await page.getByTestId('depot-editor-save').click();

	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Depot wurde aktualisiert.' })
	).toBeVisible();
	await expectDepotOnFarmProfile(page, farmName, edited);

	await deleteFromMyEntries(page, edited.name, 'Depot wurde gelöscht.');
	await page.goto(`/#/farms/${farmId}`);
	await expect(page.getByRole('heading', { name: farmName })).toBeVisible();
	await expect(page.getByTestId('depot-card')).toHaveCount(0);
});
