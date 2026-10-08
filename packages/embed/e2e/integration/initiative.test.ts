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

const ALL_GOALS = [
	'Land oder Hof',
	'Mitglieder fürs Organisationsteam',
	'GärtnerInnen oder LandwirtInnen',
	'KonsumentInnen'
];

interface InitiativeData {
	name: string;
	url: string;
	description: string;
	location: typeof BERLIN;
	goals: string[];
}

const created: InitiativeData = {
	name: 'Integration Initiative 1',
	url: 'http://www.example1.com',
	description: 'Beschreibung der Initiative 1',
	location: BERLIN,
	goals: ['Land oder Hof', 'Mitglieder fürs Organisationsteam']
};

const edited: InitiativeData = {
	name: 'Integration Initiative 2',
	url: 'http://www.example2.com',
	description: 'Beschreibung der Initiative 2',
	location: POTSDAM,
	goals: ['GärtnerInnen oder LandwirtInnen', 'KonsumentInnen']
};

async function fillInitiativeForm(page: Page, initiative: InitiativeData) {
	await page.getByTestId('editor-input-name').fill(initiative.name);
	await page.locator('#entry-editor-url').fill(initiative.url);
	await page.locator('#entry-editor-description').fill(initiative.description);
	await selectLocation(page, 'editor-input-geocoder', initiative.location);

	for (const goal of ALL_GOALS) {
		await page
			.getByRole('checkbox', { name: goal, exact: true })
			.setChecked(initiative.goals.includes(goal));
	}
}

// Reloads first so the assertions run against what the API persisted rather
// than against client state left over from the save.
async function expectInitiativeProfile(page: Page, initiative: InitiativeData) {
	await page.reload();

	await expect(page.getByRole('heading', { name: initiative.name })).toBeVisible();
	await expect(page.getByTestId('entry-detail-address')).toContainText(
		`${initiative.location.postalCode} ${initiative.location.city}`
	);
	await expect(page.getByTestId('entry-detail-website')).toHaveAttribute('href', initiative.url);
	await expect(page.getByText(initiative.description)).toBeVisible();

	const chips = page.getByTestId('goal-chip');
	await expect(chips).toHaveCount(initiative.goals.length);
	expect((await chips.allTextContents()).map((text) => text.trim()).sort()).toEqual(
		[...initiative.goals].sort()
	);
}

test('user can create, edit and delete an initiative', async ({ page, api }) => {
	await page.goto('/#/myentries');
	await page.getByTestId('create-initiative-action').click();
	await expect(page.getByTestId('entry-editor')).toBeVisible();

	await fillInitiativeForm(page, created);
	await page.getByTestId('entry-editor-save').click();

	await expect(page).toHaveURL(/#\/initiatives\/\d+$/);
	const initiativeId = entryIdFromUrl(page);
	await expectInitiativeProfile(page, created);

	await openEditorFromMyEntries(page, created.name);
	await expect(page.getByTestId('entry-editor')).toBeVisible();
	await fillInitiativeForm(page, edited);
	await page.getByTestId('entry-editor-save').click();

	await expect(page).toHaveURL(new RegExp(`#/initiatives/${initiativeId}$`));
	await expectInitiativeProfile(page, edited);

	await deleteFromMyEntries(page, edited.name, 'Initiative wurde gelöscht.');
	expect(await api.entryExists('Initiative', initiativeId)).toBe(false);
});
