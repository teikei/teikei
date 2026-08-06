import * as m from '$lib/paraglide/messages.js';
import { confirmDialog } from '$lib/stores/confirm-dialog.svelte';
import {
	setupUnsavedChangesGuard,
	shouldBlockUnsavedNavigation
} from '$lib/utils/unsaved-changes-guard';

export interface EditorGuardSources {
	isSaving: () => boolean;
	hasUnsavedChanges: () => boolean;
}

export interface EditorGuard {
	/** Whether pending navigation should currently be blocked. */
	readonly shouldBlockNavigation: boolean;
	/** Prompts the user to confirm discarding unsaved changes (resolves to their choice). */
	confirmDiscardChanges(): Promise<boolean>;
	/** Permits navigation, e.g. after a successful save or confirmed cancel. */
	allowNavigation(): void;
	/** Re-enables the guard, e.g. after a failed save. */
	blockNavigation(): void;
}

/**
 * Wires up the unsaved-changes navigation guard shared by the entry and depot
 * editors. Must be called during component initialization (it registers
 * `beforeNavigate`/`onMount` handlers internally).
 */
export function createEditorGuard(sources: EditorGuardSources): EditorGuard {
	let allowNavigationWithoutGuard = $state(false);

	const shouldBlockNavigation = $derived(
		shouldBlockUnsavedNavigation({
			allowNavigationWithoutGuard,
			isSaving: sources.isSaving(),
			hasUnsavedChanges: sources.hasUnsavedChanges()
		})
	);

	function confirmDiscardChanges(): Promise<boolean> {
		return confirmDialog.confirm({
			title: m.editor_unsaved_changes_confirm(),
			confirmLabel: m.editor_discard_changes(),
			cancelLabel: m.editor_cancel(),
			confirmVariant: 'default'
		});
	}

	setupUnsavedChangesGuard({
		shouldBlockNavigation: () => shouldBlockNavigation,
		confirmDiscardChanges,
		onNavigationConfirmed: () => {
			allowNavigationWithoutGuard = true;
			setTimeout(() => {
				allowNavigationWithoutGuard = false;
			}, 0);
		}
	});

	return {
		get shouldBlockNavigation() {
			return shouldBlockNavigation;
		},
		confirmDiscardChanges,
		allowNavigation() {
			allowNavigationWithoutGuard = true;
		},
		blockNavigation() {
			allowNavigationWithoutGuard = false;
		}
	};
}
