/**
 * Global async confirmation dialog backing the app's `<ConfirmDialog>` (mounted
 * once in the root layout). Replaces blocking `window.confirm` calls: callers
 * `await confirmDialog.confirm({ ... })` and branch on the boolean result.
 *
 * Safe as a module-level singleton because the app is fully client-side
 * (`router.type: 'hash'`), so there is no SSR request state to leak.
 */
import type { AppButtonVariant } from '$lib/components/actions';

/** The subset of AppButton variants a confirm action can render as. */
export type ConfirmDialogVariant = Extract<AppButtonVariant, 'default' | 'destructive'>;

export interface ConfirmDialogOptions {
	title: string;
	description?: string;
	confirmLabel: string;
	cancelLabel: string;
	/**
	 * 'destructive' for irreversible actions (e.g. deletion), 'default' otherwise.
	 * Required so every call site makes an explicit choice.
	 */
	confirmVariant: ConfirmDialogVariant;
}

class ConfirmDialogStore {
	open = $state(false);
	title = $state('');
	description = $state<string | undefined>(undefined);
	confirmLabel = $state('');
	cancelLabel = $state('');
	confirmVariant = $state<ConfirmDialogVariant>('default');

	#resolve: ((confirmed: boolean) => void) | null = null;

	/** Opens the dialog and resolves to the user's choice (cancel/dismiss → false). */
	confirm(options: ConfirmDialogOptions): Promise<boolean> {
		// A new request supersedes any unresolved one (treat the old as cancelled).
		this.#resolve?.(false);

		this.title = options.title;
		this.description = options.description;
		this.confirmLabel = options.confirmLabel;
		this.cancelLabel = options.cancelLabel;
		this.confirmVariant = options.confirmVariant;
		this.open = true;

		return new Promise<boolean>((resolve) => {
			this.#resolve = resolve;
		});
	}

	#settle(confirmed: boolean) {
		this.open = false;
		const resolve = this.#resolve;
		this.#resolve = null;
		resolve?.(confirmed);
	}

	accept() {
		this.#settle(true);
	}

	cancel() {
		this.#settle(false);
	}
}

export const confirmDialog = new ConfirmDialogStore();
