import { expect, test as base, type APIRequestContext, type Page } from '@playwright/test';

export const API_URL = 'http://localhost:3030';

// Seeded by packages/api/db/seeds/01_users.js. This user owns no seeded
// entries, so everything it owns was created by a test and is safe to delete.
const TEST_USER = { email: 'user@example.com', password: 'admin' };

const COLLECTION_BY_TYPE = { Farm: 'farms', Initiative: 'initiatives', Depot: 'depots' } as const;

interface Location {
	/** Text typed into the geocoder field. */
	query: string;
	/** Suggestion label shown in the autocomplete list. */
	suggestion: string;
	postalCode: string;
	city: string;
	latitude: number;
	longitude: number;
	street: string;
	state: string;
}

// The geocoder is the only stubbed dependency: it calls HERE with a secret key
// and its results drift over time. Everything else hits the real API.
export const BERLIN: Location = {
	query: 'Alexanderplatz',
	suggestion: 'Alexanderplatz, 10178 Berlin',
	street: 'Alexanderplatz',
	postalCode: '10178',
	city: 'Berlin',
	state: 'Berlin',
	latitude: 52.5219,
	longitude: 13.4132
};

export const POTSDAM: Location = {
	query: 'Brandenburger',
	suggestion: 'Brandenburger Straße, 14467 Potsdam',
	street: 'Brandenburger Straße',
	postalCode: '14467',
	city: 'Potsdam',
	state: 'Brandenburg',
	latitude: 52.3989,
	longitude: 13.0646
};

const locationId = (location: Location) => `loc-${location.city.toLowerCase()}`;

async function stubGeocoder(page: Page) {
	const locations = [BERLIN, POTSDAM];

	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, (route) => {
		const { text } = route.request().postDataJSON() as { text: string };
		const matches = locations.filter((location) =>
			location.query.toLowerCase().startsWith(text.toLowerCase())
		);
		return route.fulfill({
			json: matches.map((location) => ({
				id: locationId(location),
				title: location.suggestion,
				type: 'location'
			}))
		});
	});

	await page.route(/\/geocoder(?:\/)?(?:\?.*)?$/, (route) => {
		const { locationid } = route.request().postDataJSON() as { locationid: string };
		const location = locations.find((candidate) => locationId(candidate) === locationid);
		return route.fulfill({
			json: location && {
				id: locationid,
				street: location.street,
				houseNumber: null,
				postalCode: location.postalCode,
				city: location.city,
				state: location.state,
				country: 'DEU',
				latitude: location.latitude,
				longitude: location.longitude
			}
		});
	});
}

/** Types into the geocoder field and picks the matching stubbed suggestion. */
export async function selectLocation(page: Page, testId: string, location: Location) {
	const field = page.getByTestId(testId);
	await field.fill(location.query);
	await page.getByText(location.suggestion).click();
	await expect(field).toHaveValue(new RegExp(location.city));
}

export class Api {
	constructor(
		private readonly request: APIRequestContext,
		private readonly headers: { Authorization: string }
	) {}

	async createFarm(name: string, location: Location = BERLIN): Promise<string> {
		const response = await this.request.post(`${API_URL}/farms`, {
			headers: this.headers,
			data: {
				name,
				city: location.city,
				postalcode: location.postalCode,
				street: location.street,
				state: location.state,
				country: 'DEU',
				latitude: location.latitude,
				longitude: location.longitude,
				acceptsNewMembers: 'yes',
				actsEcological: false,
				products: [],
				badges: []
			}
		});
		expect(response.ok()).toBe(true);
		return (await response.json()).properties.id;
	}

	async entryExists(type: keyof typeof COLLECTION_BY_TYPE, id: string): Promise<boolean> {
		const response = await this.request.get(`${API_URL}/${COLLECTION_BY_TYPE[type]}/${id}`);
		return response.ok();
	}

	/** Deletes everything the test user owns so tests never see each other's data. */
	async deleteOwnedEntries() {
		const response = await this.request.get(`${API_URL}/entries?mine=true`, {
			headers: this.headers
		});
		const { features } = await response.json();
		for (const { properties } of features) {
			const type: keyof typeof COLLECTION_BY_TYPE = properties.type;
			await this.request.delete(`${API_URL}/${COLLECTION_BY_TYPE[type]}/${properties.id}`, {
				headers: this.headers
			});
		}
	}
}

/**
 * Signs in through the API (not the form, which is rate limited) and hands the
 * token to the app the same way a login would: via localStorage.
 */
export const test = base.extend<{ api: Api }>({
	api: [
		async ({ page, request }, use) => {
			const response = await request.post(`${API_URL}/authentication`, {
				data: { strategy: 'local', ...TEST_USER }
			});
			expect(response.ok()).toBe(true);
			const { accessToken } = await response.json();

			await page.addInitScript((token) => {
				window.localStorage.setItem('accessToken', token);
			}, accessToken);
			await stubGeocoder(page);

			const api = new Api(request, { Authorization: `Bearer ${accessToken}` });
			await use(api);
			await api.deleteOwnedEntries();
		},
		{ auto: true }
	]
});

export { expect };

/** Reads the entry id off a `#/<collection>/<id>` detail URL. */
export function entryIdFromUrl(page: Page): string {
	const id = new URL(page.url()).hash.split('/').pop();
	if (!id) {
		throw new Error(`No entry id in ${page.url()}`);
	}
	return id;
}

/** Opens an entry's editor from the my-entries list, the way an owner does. */
export async function openEditorFromMyEntries(page: Page, entryName: string) {
	await page.goto('/#/myentries');
	await page
		.getByTestId('entry-item')
		.filter({ hasText: entryName })
		.getByTestId('entry-action-edit-inline')
		.click();
}

/** Deletes an entry from the my-entries list and waits for the success toast. */
export async function deleteFromMyEntries(page: Page, entryName: string, toast: string) {
	await page.goto('/#/myentries');
	await page
		.getByTestId('entry-item')
		.filter({ hasText: entryName })
		.getByTestId('entry-action-delete-inline')
		.click();
	await page.getByTestId('confirm-dialog-confirm').click();
	await expect(page.locator('[data-sonner-toast]').filter({ hasText: toast })).toBeVisible();
	await expect(page.getByTestId('entry-item').filter({ hasText: entryName })).toBeHidden();
}
