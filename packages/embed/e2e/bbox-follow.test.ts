import { expect, test, type Route } from '@playwright/test';

function entriesCountLabel(count: number): RegExp {
	return new RegExp(`^${count} (Entries|Einträge|Entrées)$`);
}

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

test('all-entries list follows viewport after zoomend with debounce', async ({ page }) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
					properties: {
						id: 'farm-center',
						type: 'Farm',
						name: 'Farm Center',
						postalcode: '00000',
						city: 'Center',
						state: 'DE',
						country: 'DE',
						link: 'https://example.com',
						products: []
					}
				},
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [16.0, 51.1657] },
					properties: {
						id: 'farm-east',
						type: 'Farm',
						name: 'Farm East',
						postalcode: '00000',
						city: 'East',
						state: 'DE',
						country: 'DE',
						link: 'https://example.com',
						products: []
					}
				}
			]
		})
	);

	await page.goto('/#/');
	await expect(page.getByText(entriesCountLabel(2))).toBeVisible({ timeout: 15000 });

	const zoomInButton = page.getByRole('button', { name: 'Zoom in' });
	await zoomInButton.click();
	await zoomInButton.click();
	await zoomInButton.click();

	await expect(page.getByText(entriesCountLabel(1))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Center')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm East')).toBeHidden();
});
