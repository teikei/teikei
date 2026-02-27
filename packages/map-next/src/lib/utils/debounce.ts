export interface DebouncedCallback {
	trigger: () => void;
	cancel: () => void;
}

export function createDebouncedCallback(callback: () => void, delayMs: number): DebouncedCallback {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return {
		trigger() {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(() => {
				timeoutId = null;
				callback();
			}, delayMs);
		},
		cancel() {
			if (!timeoutId) return;
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
}
