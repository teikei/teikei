import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AutocompleteSuggestion } from '$lib/api/discovery';

const getAutocompleteSuggestionsMock = vi.hoisted(() =>
	vi.fn<() => Promise<AutocompleteSuggestion[]>>()
);

vi.mock('$lib/api/discovery', () => ({
	getAutocompleteSuggestions: getAutocompleteSuggestionsMock
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(async () => undefined)
}));

import { createSidebarSearch, type SidebarSearch } from './sidebar-search.svelte';

const DEBOUNCE_MS = 300;

function suggestion(id: string): AutocompleteSuggestion {
	return { id, title: id, type: 'farm' };
}

interface Deferred {
	promise: Promise<AutocompleteSuggestion[]>;
	resolve: (value: AutocompleteSuggestion[]) => void;
	reject: (reason: unknown) => void;
}

function deferred(): Deferred {
	let resolve!: (value: AutocompleteSuggestion[]) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<AutocompleteSuggestion[]>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	// Nothing else attaches a handler until the store's `await` does, so keep an
	// unhandled rejection from failing the run.
	promise.catch(() => {});
	return { promise, resolve, reject };
}

/** Queue the next in-flight response and let the debounce fire for `query`. */
function issueRequest(search: SidebarSearch, query: string): Deferred {
	const pending = deferred();
	getAutocompleteSuggestionsMock.mockReturnValueOnce(pending.promise);
	search.value = query;
	flushSync();
	vi.advanceTimersByTime(DEBOUNCE_MS);
	return pending;
}

describe('createSidebarSearch', () => {
	let search: SidebarSearch;
	let cleanup: () => void;

	beforeEach(() => {
		vi.useFakeTimers();
		getAutocompleteSuggestionsMock.mockReset().mockResolvedValue([]);
		cleanup = $effect.root(() => {
			search = createSidebarSearch({
				isMyEntriesScope: () => false,
				collapsed: () => false,
				isMobile: () => false
			});
		});
		flushSync();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it('enters the loading state for the whole debounce window before requesting', () => {
		search.value = 'ab';
		flushSync();

		expect(search.isLoading).toBe(true);
		expect(getAutocompleteSuggestionsMock).not.toHaveBeenCalled();

		vi.advanceTimersByTime(DEBOUNCE_MS - 1);
		expect(getAutocompleteSuggestionsMock).not.toHaveBeenCalled();
		expect(search.isLoading).toBe(true);

		vi.advanceTimersByTime(1);
		expect(getAutocompleteSuggestionsMock).toHaveBeenCalledTimes(1);
	});

	it('drops an out-of-order response from a superseded request', async () => {
		const stale = issueRequest(search, 'ab');
		const latest = issueRequest(search, 'abc');

		latest.resolve([suggestion('latest')]);
		await latest.promise;
		expect(search.suggestions.map((s) => s.id)).toEqual(['latest']);

		stale.resolve([suggestion('stale')]);
		await stale.promise;

		expect(search.suggestions.map((s) => s.id)).toEqual(['latest']);
		expect(search.isLoading).toBe(false);
	});

	it('lets a rejection from a superseded request clear neither suggestions nor loading', async () => {
		const stale = issueRequest(search, 'ab');
		const resolved = issueRequest(search, 'abc');

		resolved.resolve([suggestion('kept')]);
		await resolved.promise;

		issueRequest(search, 'abcde');
		expect(search.isLoading).toBe(true);

		stale.reject(new Error('network'));
		await expect(stale.promise).rejects.toThrow('network');

		expect(search.suggestions.map((s) => s.id)).toEqual(['kept']);
		expect(search.isLoading).toBe(true);
	});

	it('discards an in-flight result once the query drops below the minimum length', async () => {
		const inFlight = issueRequest(search, 'ab');

		search.value = 'a';
		flushSync();
		expect(search.isLoading).toBe(false);

		inFlight.resolve([suggestion('discarded')]);
		await inFlight.promise;

		expect(search.suggestions).toEqual([]);
		expect(search.isLoading).toBe(false);
	});
});
