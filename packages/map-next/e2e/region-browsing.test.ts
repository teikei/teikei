import { expect, test, type Route } from '@playwright/test';

function entriesCountLabel(count: number): RegExp {
	return new RegExp(`^(Entries|Einträge|Entrées) \\(${count}\\)$`);
}

const ANY_ENTRIES_COUNT_LABEL = /^(Entries|Einträge|Entrées) \(\d+\)$/;

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

test('country and region selectors pan map and update all-entries list via bbox follow', async ({
	page
}) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [11.576124, 48.137154] },
					properties: {
						id: 'farm-de-bayern',
						type: 'Farm',
						name: 'Farm Bayern',
						postalcode: '80331',
						city: 'Munich',
						state: 'Bayern',
						country: 'DE',
						link: 'https://example.com',
						products: []
					}
				},
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [8.682127, 50.110924] },
					properties: {
						id: 'initiative-de-hessen',
						type: 'Initiative',
						name: 'Initiative Hessen',
						postalcode: '60311',
						city: 'Frankfurt',
						state: 'Hessen',
						country: 'DE',
						link: 'https://example.com',
						goals: []
					}
				},
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [8.541694, 47.376887] },
					properties: {
						id: 'farm-ch-zh',
						type: 'Farm',
						name: 'Farm Zurich',
						postalcode: '8001',
						city: 'Zurich',
						state: 'ZH',
						country: 'CH',
						link: 'https://example.com',
						products: []
					}
				},
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [8.04422, 47.39254] },
					properties: {
						id: 'initiative-ch-ag',
						type: 'Initiative',
						name: 'Initiative Aargau',
						postalcode: '5000',
						city: 'Aarau',
						state: 'AG',
						country: 'CH',
						link: 'https://example.com',
						goals: []
					}
				}
			]
		})
	);

	await page.goto('/#/');
	await expect(page.getByText(ANY_ENTRIES_COUNT_LABEL)).toBeVisible({ timeout: 15000 });

	await page.locator('#country-browse-select').click();
	await page.locator('[data-slot="select-item"][data-value="CH"]').click();

	await expect(page.getByText(entriesCountLabel(2))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Zurich')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Initiative Aargau')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Bayern')).toBeHidden();

	await page.locator('#region-browse-select').click();
	await page.locator('[data-slot="select-item"][data-value="ZH"]').click();

	await expect(page.getByText(entriesCountLabel(1))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Zurich')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Initiative Aargau')).toBeHidden();

	// Select "All Regions" again and verify all CH entries are shown
	await page.locator('#region-browse-select').click();
	await page.locator('[data-slot="select-item"][data-value="ALL_REGIONS_VALUE"]').click();

	await expect(page.getByText(entriesCountLabel(2))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Zurich')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Initiative Aargau')).toBeVisible({ timeout: 15000 });
});
