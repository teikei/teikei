import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedCallback } from './debounce';

describe('createDebouncedCallback', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('runs callback once after the delay', () => {
		const callback = vi.fn();
		const debounced = createDebouncedCallback(callback, 100);

		debounced.trigger();
		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('coalesces rapid triggers into a single callback run', () => {
		const callback = vi.fn();
		const debounced = createDebouncedCallback(callback, 100);

		debounced.trigger();
		vi.advanceTimersByTime(50);
		debounced.trigger();
		vi.advanceTimersByTime(50);
		debounced.trigger();

		vi.advanceTimersByTime(99);
		expect(callback).toHaveBeenCalledTimes(0);

		vi.advanceTimersByTime(1);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('cancels a pending callback run', () => {
		const callback = vi.fn();
		const debounced = createDebouncedCallback(callback, 100);

		debounced.trigger();
		debounced.cancel();
		vi.advanceTimersByTime(100);

		expect(callback).not.toHaveBeenCalled();
	});
});
