import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EntryFeatureCollection, MainEntryFeature } from '$lib/types/entries';

const gotoMock = vi.hoisted(() =>
	vi.fn<(url?: string | URL) => Promise<void>>(async () => undefined)
);
const beforeNavigateMock = vi.hoisted(() => vi.fn());
const getDepotAssociatedFarmIdMock = vi.hoisted(() =>
	vi.fn<(depotId?: string) => Promise<string | null>>(async () => null)
);
const getMainEntryMock = vi.hoisted(() =>
	vi.fn(async (resource: string, id: string) => ({
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.54, 47.37] },
		properties: { id, type: 'Farm', name: 'Farm', products: [] }
	}))
);
const deleteDepotMock = vi.hoisted(() =>
	vi.fn<(depotId?: string) => Promise<void>>(async () => undefined)
);
const confirmDialogMock = vi.hoisted(() => vi.fn<() => Promise<boolean>>(async () => true));
const getCurrentUserMock = vi.hoisted(() =>
	vi.fn(() => ({
		id: 'user-1',
		name: 'Owner User',
		email: 'owner@example.com'
	}))
);
const isInitializedMock = vi.hoisted(() => vi.fn(() => true));
const pageState = vi.hoisted(() => ({
	url: new URL('http://localhost/#/'),
	data: {} as Record<string, unknown>
}));

vi.mock('$app/navigation', () => ({
	goto: gotoMock,
	beforeNavigate: beforeNavigateMock,
	// superforms (pulled in via the entry/depot editors) imports these.
	afterNavigate: vi.fn(),
	invalidateAll: vi.fn(async () => undefined)
}));

const navigatingState = vi.hoisted(() => ({
	to: null,
	from: null,
	type: null,
	complete: null,
	delta: null
}));

vi.mock('$app/state', () => ({
	page: pageState,
	navigating: navigatingState
}));

vi.mock('$lib/api/entry-mutations', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/api/entry-mutations')>();
	return {
		...actual,
		deleteDepot: deleteDepotMock
	};
});

vi.mock('$lib/api/entry-details', () => ({
	getAssociatedFarmIdForDepot: getDepotAssociatedFarmIdMock,
	getMainEntry: getMainEntryMock
}));

vi.mock('$lib/stores/confirm-dialog.svelte', () => ({
	confirmDialog: { confirm: confirmDialogMock }
}));

vi.mock('$lib/stores/auth.svelte', () => ({
	authStore: {
		get user() {
			return getCurrentUserMock();
		},
		get isAuthenticated() {
			return getCurrentUserMock() !== null;
		},
		get isInitialized() {
			return isInitializedMock();
		}
	}
}));

import MapSidebar from './MapSidebar.svelte';

function createFarmDetail(id: string, name: string): MainEntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.54, 47.37] },
		properties: {
			id,
			type: 'Farm',
			name,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: []
		}
	};
}

const emptyEntries: EntryFeatureCollection = {
	type: 'FeatureCollection',
	features: []
};

function createDepotFeature(id: string, name: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.55, 47.38] },
		properties: {
			id,
			type: 'Depot' as const,
			name,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com'
		}
	};
}

function createInitiativeDetail(id: string, name: string): MainEntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.6, 47.4] },
		properties: {
			id,
			type: 'Initiative',
			name,
			postalcode: '8001',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			goals: []
		}
	};
}

function createDepotDetail(id: string, name: string): EntryFeatureCollection['features'][number] {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.58, 47.39] },
		properties: {
			id,
			type: 'Depot',
			name,
			postalcode: '8002',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com'
		}
	};
}

describe('MapSidebar', () => {
	beforeEach(() => {
		gotoMock.mockReset();
		getDepotAssociatedFarmIdMock.mockReset();
		getDepotAssociatedFarmIdMock.mockResolvedValue(null);
		deleteDepotMock.mockReset();
		confirmDialogMock.mockReset();
		confirmDialogMock.mockResolvedValue(true);
		getCurrentUserMock.mockReturnValue({
			id: 'user-1',
			name: 'Owner User',
			email: 'owner@example.com'
		});
		isInitializedMock.mockReturnValue(true);
	});

	it('triggers map pan callback for deep-link detail data even when list entries are empty', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-1');
		pageState.data = { detailData: createFarmDetail('farm-1', 'Farm One') };
		const onEntryClick = vi.fn();

		render(MapSidebar, {
			props: {
				entries: emptyEntries,
				onEntryClick
			}
		});

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(1);
		expect(onEntryClick.mock.calls[0]?.[0]?.properties?.id).toBe('farm-1');
	});

	it('clicking a farm list row pans and navigates to the farm detail route', async () => {
		pageState.url = new URL('http://localhost/#/');
		pageState.data = {};
		gotoMock.mockReset();
		const onEntryClick = vi.fn();

		render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-2', 'Farm Two')]
				},
				onEntryClick
			}
		});

		const farmTextNode = Array.from(document.querySelectorAll('*')).find(
			(node) => node.textContent?.trim() === 'Farm Two'
		);
		const farmRow = farmTextNode?.closest('[data-testid="entry-row"]');
		if (!(farmRow instanceof HTMLElement)) {
			throw new Error('Expected a clickable sidebar row for farm entry');
		}

		farmRow.click();

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(1);
		await expect.poll(() => gotoMock.mock.calls.length).toBe(1);
		expect(gotoMock.mock.calls[0]?.[0]).toBe('#/farms/farm-2');
	});

	it('depot openDetailView keeps focus on associated farm even if that farm detail is already active', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-a');
		pageState.data = { detailData: createFarmDetail('farm-a', 'Associated Farm A') };
		getDepotAssociatedFarmIdMock.mockResolvedValue('farm-a');
		const onEntryClick = vi.fn();

		const view = render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-a', 'Associated Farm A')]
				},
				onEntryClick
			}
		});

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(1);

		view.component.openDetailView(createDepotFeature('depot-1', 'Depot One'));

		await expect.poll(() => getDepotAssociatedFarmIdMock.mock.calls.length).toBe(1);
		await expect.poll(() => onEntryClick.mock.calls.length).toBe(2);
		await expect.poll(() => gotoMock.mock.calls.length).toBe(1);
		expect(gotoMock.mock.calls[0]?.[0]).toBe('#/farms/farm-a');
		expect(onEntryClick.mock.calls[1]?.[0]?.properties?.id).toBe('depot-1');
	});

	it('openDetailView in my-entries scope does not trigger a second pan when triggerPan is false', async () => {
		pageState.url = new URL('http://localhost/#/myentries');
		pageState.data = {};
		const onEntryClick = vi.fn();

		const view = render(MapSidebar, {
			props: {
				entries: emptyEntries,
				myEntries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-3', 'Farm Three')]
				},
				onEntryClick
			}
		});

		view.component.openDetailView(createFarmDetail('farm-3', 'Farm Three'));

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(0);
		await expect.poll(() => gotoMock.mock.calls.length).toBe(0);
	});

	it('renders sticky create actions and row action controls in my-entries scope', async () => {
		pageState.url = new URL('http://localhost/#/myentries');
		pageState.data = {};

		render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: []
				},
				myEntries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-3', 'Farm Three')]
				}
			}
		});

		await expect
			.poll(() => !!document.querySelector('[data-testid="my-entries-create-actions"]'))
			.toBe(true);
		expect(document.querySelector('[data-testid="create-farm-action"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="create-depot-action"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="create-initiative-action"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-row-actions-desktop"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-row-actions-mobile"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-actions-overflow-trigger"]')).toBeTruthy();
	});

	it('my-entries create and edit actions navigate to farm/initiative/depot routes', async () => {
		pageState.url = new URL('http://localhost/#/myentries');
		pageState.data = {};

		render(MapSidebar, {
			props: {
				entries: emptyEntries,
				myEntries: {
					type: 'FeatureCollection',
					features: [
						createFarmDetail('farm-3', 'Farm Three'),
						createInitiativeDetail('init-5', 'Init Five'),
						createDepotDetail('depot-8', 'Depot Eight')
					]
				}
			}
		});

		const createFarmButton = document.querySelector('[data-testid="create-farm-action"]');
		if (!(createFarmButton instanceof HTMLElement)) {
			throw new Error('Expected create farm action button');
		}
		createFarmButton.click();
		await expect.poll(() => gotoMock.mock.calls.length).toBe(1);
		expect(gotoMock.mock.calls[0]?.[0]).toBe('#/farms/new');

		const createInitiativeButton = document.querySelector(
			'[data-testid="create-initiative-action"]'
		);
		if (!(createInitiativeButton instanceof HTMLElement)) {
			throw new Error('Expected create initiative action button');
		}
		createInitiativeButton.click();
		await expect.poll(() => gotoMock.mock.calls.length).toBe(2);
		expect(gotoMock.mock.calls[1]?.[0]).toBe('#/initiatives/new');

		const createDepotButton = document.querySelector('[data-testid="create-depot-action"]');
		if (!(createDepotButton instanceof HTMLElement)) {
			throw new Error('Expected create depot action button');
		}
		createDepotButton.click();
		await expect.poll(() => gotoMock.mock.calls.length).toBe(3);
		expect(gotoMock.mock.calls[2]?.[0]).toBe('#/depots/new');

		const editButtons = Array.from(
			document.querySelectorAll('[data-testid="entry-action-edit-inline"]')
		) as HTMLElement[];
		const firstEditButton = editButtons[0];
		if (!firstEditButton) {
			throw new Error('Expected inline edit button');
		}
		firstEditButton.click();

		await expect.poll(() => gotoMock.mock.calls.length).toBe(4);
		expect(gotoMock.mock.calls[3]?.[0]).toBe('#/farms/farm-3/edit');

		const depotEditButton = editButtons[2];
		if (!depotEditButton) {
			throw new Error('Expected depot inline edit button');
		}
		depotEditButton.click();
		await expect.poll(() => gotoMock.mock.calls.length).toBe(5);
		expect(gotoMock.mock.calls[4]?.[0]).toBe('#/depots/depot-8/edit');
	});

	it('my-entries depot delete action removes depot and returns to plain my-entries route', async () => {
		pageState.url = new URL('http://localhost/#/myentries');
		pageState.data = {};
		confirmDialogMock.mockResolvedValue(true);

		render(MapSidebar, {
			props: {
				entries: emptyEntries,
				myEntries: {
					type: 'FeatureCollection',
					features: [createDepotDetail('depot-9', 'Depot Nine')]
				}
			}
		});

		const deleteButton = document.querySelector('[data-testid="entry-action-delete-inline"]');
		if (!(deleteButton instanceof HTMLElement)) {
			throw new Error('Expected depot inline delete button');
		}
		deleteButton.click();

		await expect.poll(() => confirmDialogMock.mock.calls.length).toBe(1);
		await expect.poll(() => deleteDepotMock.mock.calls.length).toBe(1);
		expect(deleteDepotMock.mock.calls[0]?.[0]).toBe('depot-9');
		await expect.poll(() => gotoMock.mock.calls.length).toBe(1);
		expect(gotoMock.mock.calls[0]?.[0]).toBe('#/myentries');
	});

	it('my-entries depot delete is aborted when the confirm dialog is dismissed', async () => {
		pageState.url = new URL('http://localhost/#/myentries');
		pageState.data = {};
		confirmDialogMock.mockResolvedValue(false);

		render(MapSidebar, {
			props: {
				entries: emptyEntries,
				myEntries: {
					type: 'FeatureCollection',
					features: [createDepotDetail('depot-9', 'Depot Nine')]
				}
			}
		});

		const deleteButton = document.querySelector('[data-testid="entry-action-delete-inline"]');
		if (!(deleteButton instanceof HTMLElement)) {
			throw new Error('Expected depot inline delete button');
		}
		deleteButton.click();

		await expect.poll(() => confirmDialogMock.mock.calls.length).toBe(1);
		// Let the delete handler run past the awaited confirm before asserting it stopped.
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(deleteDepotMock).not.toHaveBeenCalled();
		expect(gotoMock).not.toHaveBeenCalled();
	});

	it('caps rendered entry rows at 200 to avoid large list DOM churn', async () => {
		pageState.url = new URL('http://localhost/#/');
		pageState.data = {};

		const manyEntries = Array.from({ length: 250 }, (_, index) =>
			createFarmDetail(`farm-${index}`, `Farm ${index}`)
		);

		render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: manyEntries
				}
			}
		});

		await expect
			.poll(() => document.querySelectorAll('[data-testid="entry-item"]').length)
			.toBe(200);
		expect(document.querySelector('[data-testid="entries-cap-indicator"]')?.textContent).toContain(
			'250 Einträge · 200 angezeigt'
		);
	});

	it('contact view renders a single back button and no search input', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-1/contact');
		pageState.data = { contactData: createFarmDetail('farm-1', 'Farm One') };

		render(MapSidebar, { props: { entries: emptyEntries } });

		await expect
			.poll(() => !!document.querySelector('[data-testid="entry-contact-form"]'))
			.toBe(true);
		expect(document.querySelectorAll('[data-testid="entry-contact-back"]').length).toBe(1);
		expect(document.querySelectorAll('[data-testid="detail-search-back"]').length).toBe(0);
		// The only aria-labelled input in the sidebar is the search field.
		expect(document.querySelectorAll('input[aria-label]').length).toBe(0);
	});

	it('focusSearch is a no-op while the contact view is open', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-1/contact');
		pageState.data = { contactData: createFarmDetail('farm-1', 'Farm One') };

		const view = render(MapSidebar, { props: { entries: emptyEntries } });

		await expect
			.poll(() => !!document.querySelector('[data-testid="entry-contact-form"]'))
			.toBe(true);
		const messageField = document.querySelector('#entry-contact-message');
		if (!(messageField instanceof HTMLElement)) {
			throw new Error('Expected the contact message field');
		}
		messageField.focus();

		view.component.focusSearch();
		// focusSearch() focuses on the next frame, so wait one out before asserting.
		await new Promise((resolve) => requestAnimationFrame(resolve));

		expect(document.activeElement).toBe(messageField);
	});

	it('detail view keeps the slim search header alongside the profile actions', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-1');
		pageState.data = { detailData: createFarmDetail('farm-1', 'Farm One') };

		render(MapSidebar, { props: { entries: emptyEntries } });

		await expect
			.poll(() => !!document.querySelector('[data-testid="detail-search-back"]'))
			.toBe(true);
		expect(document.querySelector('input[aria-label]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-detail-close"]')).toBeTruthy();
	});

	it('exposes accessible labels for key sidebar controls', async () => {
		pageState.url = new URL('http://localhost/#/');
		pageState.data = {};

		render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-1', 'Farm One')]
				},
				myEntries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-owned', 'Farm Owned')]
				}
			}
		});

		const collapseToggle = document.querySelector('[data-testid="sidebar-collapse-toggle"]');
		expect(collapseToggle?.getAttribute('aria-label')).toBeTruthy();

		const searchInput = document.querySelector('input[aria-label]');
		expect(searchInput?.getAttribute('aria-label')).toBeTruthy();
	});
});
