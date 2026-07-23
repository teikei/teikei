import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

interface DepotSeed {
	id: string;
	name: string;
	farmId: string;
	farmName: string;
	description?: string;
	url?: string;
	deliveryDays?: string | null;
}

function buildFarmSummary(id: string, name: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.55, 47.37] },
		properties: {
			id,
			type: 'Farm' as const,
			name,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: [],
			updatedAt: '2025-02-01T00:00:00.000Z'
		}
	};
}

function buildDepotFeature(seed: DepotSeed) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.58, 47.39] },
		properties: {
			id: seed.id,
			type: 'Depot' as const,
			name: seed.name,
			postalcode: '8001',
			city: 'Zurich',
			address: 'Bahnhofstrasse 1',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			description: seed.description,
			url: seed.url,
			deliveryDays: seed.deliveryDays === undefined ? 'Mon, Wed' : seed.deliveryDays,
			farms: {
				type: 'FeatureCollection' as const,
				features: [buildFarmSummary(seed.farmId, seed.farmName)]
			},
			updatedAt: '2025-02-02T00:00:00.000Z'
		}
	};
}

function buildFarmDetail(id: string, name: string, depotSeeds: DepotSeed[]) {
	return {
		...buildFarmSummary(id, name),
		properties: {
			...buildFarmSummary(id, name).properties,
			depots: {
				type: 'FeatureCollection' as const,
				features: depotSeeds.map(buildDepotFeature)
			}
		}
	};
}

async function mockAuthenticatedUser(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.setItem('accessToken', 'test-token');
	});

	await page.route(/\/authentication(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			accessToken: 'test-token',
			user: { id: 'user-1', email: 'owner@example.com', name: 'Owner User' }
		})
	);
}

async function mockGeocoder(page: Page) {
	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('zur')) {
			await fulfillJson(route, [
				{ id: 'loc-zurich', title: 'Zurich, Switzerland', type: 'location' }
			]);
			return;
		}
		await fulfillJson(route, []);
	});
	await page.route(/\/geocoder(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { id: 'loc-zurich', city: 'Zurich', latitude: 47.39, longitude: 8.58 })
	);
}

test('add pickup location from the owned farm profile creates a pre-associated depot and returns to the profile', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockGeocoder(page);

	const ownedFarm = buildFarmSummary('farm-owned', 'Owned Farm');
	let farmDepots: DepotSeed[] = [];

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const isMine = new URL(route.request().url()).searchParams.get('mine') === 'true';
		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: isMine ? [ownedFarm] : [ownedFarm]
		});
	});

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-owned', 'Owned Farm', farmDepots))
	);

	await page.route(/\/depots(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() !== 'POST') {
			return route.fallback();
		}
		const payload = JSON.parse(route.request().postData() ?? '{}');
		farmDepots = [
			{
				id: 'depot-new',
				name: payload.name ?? 'New Depot',
				farmId: 'farm-owned',
				farmName: 'Owned Farm'
			}
		];
		await fulfillJson(route, buildDepotFeature(farmDepots[0]));
	});

	await page.goto('/#/farms/farm-owned');

	const addDepot = page.getByTestId('farm-add-depot');
	await expect(addDepot).toBeVisible({ timeout: 15000 });
	await addDepot.click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/new?farm=farm-owned');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });
	// Farm is pre-associated and hidden: the preset note shows, no farm checkbox.
	await expect(page.getByTestId('depot-preset-farm')).toHaveText('Owned Farm', { timeout: 15000 });
	await expect(page.getByTestId('depot-editor').getByRole('checkbox')).toHaveCount(0);

	await page.getByTestId('depot-input-name').fill('Profile Depot');
	await page.getByTestId('depot-input-geocoder').fill('Zurich');
	await page.getByText('Zurich, Switzerland').click();
	await expect(page.getByTestId('depot-input-geocoder')).toHaveValue('Zurich', { timeout: 15000 });
	await page.getByTestId('depot-editor-save').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned');
	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Depot wurde gespeichert.' })
	).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('depot-card').filter({ hasText: 'Profile Depot' })).toBeVisible({
		timeout: 15000
	});
});

test('farm profile gates depot edit/delete to owned depots and deletes from the profile', async ({
	page
}) => {
	await mockAuthenticatedUser(page);

	const ownedFarm = buildFarmSummary('farm-owned', 'Owned Farm');
	const ownedDepot: DepotSeed = {
		id: 'depot-owned',
		name: 'My Depot',
		farmId: 'farm-owned',
		farmName: 'Owned Farm'
	};
	const foreignDepot: DepotSeed = {
		id: 'depot-foreign',
		name: 'Foreign Depot',
		farmId: 'farm-owned',
		farmName: 'Owned Farm'
	};
	let farmDepots: DepotSeed[] = [ownedDepot, foreignDepot];

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const isMine = new URL(route.request().url()).searchParams.get('mine') === 'true';
		return fulfillJson(route, {
			type: 'FeatureCollection',
			// The user owns the farm and only the "owned" depot.
			features: isMine ? [ownedFarm, buildDepotFeature(ownedDepot)] : [ownedFarm]
		});
	});

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-owned', 'Owned Farm', farmDepots))
	);

	await page.route(/\/depots\/depot-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'DELETE') {
			farmDepots = farmDepots.filter((depot) => depot.id !== 'depot-owned');
			await fulfillJson(route, buildDepotFeature(ownedDepot));
			return;
		}
		await fulfillJson(route, buildDepotFeature(ownedDepot));
	});

	await page.goto('/#/farms/farm-owned');

	const ownedCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-owned"]');
	const foreignCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-foreign"]');
	await expect(ownedCard).toBeVisible({ timeout: 15000 });
	await expect(foreignCard).toBeVisible({ timeout: 15000 });

	// Owned depot exposes management actions.
	await expect(ownedCard.getByTestId('depot-card-edit')).toBeVisible();
	await expect(ownedCard.getByTestId('depot-card-delete')).toBeVisible();

	// Foreign-owned depot shows the ownership hint and no actions.
	await expect(foreignCard.getByTestId('depot-card-foreign-hint')).toBeVisible();
	await expect(foreignCard.getByTestId('depot-card-edit')).toHaveCount(0);
	await expect(foreignCard.getByTestId('depot-card-delete')).toHaveCount(0);

	// Delete from the profile: confirm dialog, toast, card removed, stays on profile.
	await ownedCard.getByTestId('depot-card-delete').click();
	await page.getByTestId('confirm-dialog-confirm').click();

	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Depot wurde gelöscht.' })
	).toBeVisible({ timeout: 15000 });
	await expect(ownedCard).toBeHidden({ timeout: 15000 });
	await expect(foreignCard).toBeVisible();
	expect(page.url()).toContain('#/farms/farm-owned');
});

test('the add-depot button is absent on a foreign farm profile', async ({ page }) => {
	await mockAuthenticatedUser(page);

	const foreignFarm = buildFarmSummary('farm-foreign', 'Foreign Farm');
	// The signed-in user owns a depot connected to the farm, but not the farm itself.
	const ownedDepot: DepotSeed = {
		id: 'depot-owned',
		name: 'My Depot',
		farmId: 'farm-foreign',
		farmName: 'Foreign Farm'
	};

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const isMine = new URL(route.request().url()).searchParams.get('mine') === 'true';
		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: isMine ? [buildDepotFeature(ownedDepot)] : [foreignFarm]
		});
	});

	await page.route(/\/farms\/farm-foreign(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-foreign', 'Foreign Farm', [ownedDepot]))
	);

	await page.goto('/#/farms/farm-foreign');

	// The owned depot's edit affordance renders only once auth and the mine=true
	// entries response have resolved, anchoring the absence check below to a
	// settled authenticated-ownership state (not a not-yet-loaded one).
	const ownedCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-owned"]');
	await expect(ownedCard.getByTestId('depot-card-edit')).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('farm-add-depot')).toHaveCount(0);
});

test('foreign farm profile shows no ownership hint on any depot card', async ({ page }) => {
	await mockAuthenticatedUser(page);

	const ownedFarm = buildFarmSummary('farm-owned', 'Owned Farm');
	const ownedDepot: DepotSeed = {
		id: 'depot-owned',
		name: 'My Depot',
		farmId: 'farm-foreign',
		farmName: 'Foreign Farm'
	};
	const foreignDepot: DepotSeed = {
		id: 'depot-foreign',
		name: 'Foreign Depot',
		farmId: 'farm-foreign',
		farmName: 'Foreign Farm'
	};

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const isMine = new URL(route.request().url()).searchParams.get('mine') === 'true';
		return fulfillJson(route, {
			type: 'FeatureCollection',
			// The user owns a different farm and one depot connected to the foreign farm.
			features: isMine
				? [ownedFarm, buildDepotFeature(ownedDepot)]
				: [ownedFarm, buildFarmSummary('farm-foreign', 'Foreign Farm')]
		});
	});

	await page.route(/\/farms\/farm-foreign(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-foreign', 'Foreign Farm', [ownedDepot, foreignDepot]))
	);

	await page.goto('/#/farms/farm-foreign');

	const ownedCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-owned"]');
	const foreignCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-foreign"]');
	await expect(ownedCard).toBeVisible({ timeout: 15000 });
	await expect(foreignCard).toBeVisible({ timeout: 15000 });

	// The hint is farm-owner-scoped: on a foreign farm no card shows it.
	await expect(page.getByTestId('depot-card-foreign-hint')).toHaveCount(0);

	// Owned depots keep their management actions even on a foreign farm.
	await expect(ownedCard.getByTestId('depot-card-edit')).toBeVisible();
	await expect(foreignCard.getByTestId('depot-card-edit')).toHaveCount(0);
	await expect(foreignCard.getByTestId('depot-card-delete')).toHaveCount(0);
});

test('farm profile renders every connected depot with no list-level truncation', async ({
	page
}) => {
	const depotSeeds: DepotSeed[] = Array.from({ length: 7 }, (_, index) => ({
		id: `depot-${index + 1}`,
		name: `Depot ${index + 1}`,
		farmId: 'farm-big',
		farmName: 'Big Farm'
	}));

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [buildFarmSummary('farm-big', 'Big Farm')]
		})
	);

	await page.route(/\/farms\/farm-big(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-big', 'Big Farm', depotSeeds))
	);

	await page.goto('/#/farms/farm-big');

	const section = page.getByTestId('farm-depots');
	await expect(section).toBeVisible({ timeout: 15000 });

	// Section heading carries the total count (accordion rows add their own
	// level-3 headings, so scope to the section's level-5 heading).
	await expect(section.getByRole('heading', { level: 5 })).toContainText('7');

	// All rows render at once; the old show-all/show-less toggle is gone.
	const cards = page.getByTestId('depot-card');
	await expect(cards).toHaveCount(7);
	await expect(page.getByTestId('farm-depots-toggle')).toHaveCount(0);
});

test('a depot row is collapsed by default and expands to reveal description, website and delivery days', async ({
	page
}) => {
	const richDepot: DepotSeed = {
		id: 'depot-rich',
		name: 'Rich Depot',
		farmId: 'farm-details',
		farmName: 'Details Farm',
		description: 'Weekly veggie box pickup.',
		url: 'https://depot.example.com',
		deliveryDays: 'Mon, Wed'
	};
	// A depot without a website URL proves empty fields are omitted from the row.
	const sparseDepot: DepotSeed = {
		id: 'depot-sparse',
		name: 'Sparse Depot',
		farmId: 'farm-details',
		farmName: 'Details Farm',
		description: undefined,
		url: undefined,
		deliveryDays: null
	};

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [buildFarmSummary('farm-details', 'Details Farm')]
		})
	);

	await page.route(/\/farms\/farm-details(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-details', 'Details Farm', [richDepot, sparseDepot]))
	);

	await page.goto('/#/farms/farm-details');

	const richCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-rich"]');
	await expect(richCard).toBeVisible({ timeout: 15000 });

	// Collapsed by default: the expandable details are not visible yet.
	const website = richCard.getByTestId('depot-card-website');
	await expect(richCard).toContainText('Rich Depot');
	await expect(website).toBeHidden();

	// Expand the row via its header trigger.
	await richCard.getByRole('button', { name: /Rich Depot/ }).click();

	await expect(richCard).toContainText('Weekly veggie box pickup.');
	await expect(richCard).toContainText('Mon, Wed');
	await expect(website).toBeVisible();
	await expect(website).toHaveAttribute('href', 'https://depot.example.com');

	// The sparse depot omits website + delivery days once expanded.
	const sparseCard = page.locator('[data-testid="depot-card"][data-depot-id="depot-sparse"]');
	await sparseCard.getByRole('button', { name: /Sparse Depot/ }).click();
	await expect(sparseCard.getByTestId('depot-card-website')).toHaveCount(0);
	await expect(sparseCard).not.toContainText('Mon, Wed');
});

test('expanding a depot row surfaces its address in the map popup', async ({ page }) => {
	const depot: DepotSeed = {
		id: 'depot-details',
		name: 'Detail Depot',
		farmId: 'farm-details',
		farmName: 'Details Farm'
	};

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [buildFarmSummary('farm-details', 'Details Farm')]
		})
	);

	await page.route(/\/farms\/farm-details(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, buildFarmDetail('farm-details', 'Details Farm', [depot]))
	);

	await page.goto('/#/farms/farm-details');

	const card = page.locator('[data-testid="depot-card"][data-depot-id="depot-details"]');
	await expect(card).toBeVisible({ timeout: 15000 });

	// The row still hides the street address; expanding then selecting must make
	// it reachable in the map popup (buildDepotFeature seeds it).
	await card.getByRole('button', { name: /Detail Depot/ }).click();
	await card.getByTestId('depot-card-select').click();

	const popup = page.locator('.maplibregl-popup-content');
	await expect(popup).toBeVisible({ timeout: 15000 });
	await expect(popup).toContainText('Bahnhofstrasse 1');
	await expect(popup).toContainText('Mon, Wed');
});

test('my-entries groups a cross-owned depot under the foreign farm with an ownership hint', async ({
	page
}) => {
	await mockAuthenticatedUser(page);

	const ownedFarm = buildFarmSummary('farm-owned', 'Owned Farm');
	const crossDepot: DepotSeed = {
		id: 'depot-cross',
		name: 'Cross Depot',
		farmId: 'farm-foreign',
		farmName: 'Foreign Farm'
	};

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const isMine = new URL(route.request().url()).searchParams.get('mine') === 'true';
		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: isMine ? [ownedFarm, buildDepotFeature(crossDepot)] : [ownedFarm]
		});
	});

	await page.goto('/#/myentries');

	// Own farm renders as its own group.
	await expect(page.getByTestId('entry-item').filter({ hasText: 'Owned Farm' })).toBeVisible({
		timeout: 15000
	});

	// Cross-owned depot is grouped under the foreign farm header with the hint.
	const foreignHeader = page.getByTestId('my-entries-foreign-farm-header');
	await expect(foreignHeader).toBeVisible({ timeout: 15000 });
	await expect(foreignHeader).toContainText('Foreign Farm');
	await expect(foreignHeader).toContainText('Wird von einem anderen Konto verwaltet.');

	// The cross-owned depot remains editable by its owner.
	const crossDepotRow = page.getByTestId('entry-item').filter({ hasText: 'Cross Depot' });
	await expect(crossDepotRow).toBeVisible();
	await expect(crossDepotRow.getByTestId('entry-action-edit-inline')).toBeVisible();
});
