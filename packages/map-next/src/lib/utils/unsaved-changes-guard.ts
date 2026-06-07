import { beforeNavigate, goto } from '$app/navigation';
import { onMount } from 'svelte';

interface UnsavedNavigationBlockState {
	allowNavigationWithoutGuard: boolean;
	isSaving: boolean;
	hasUnsavedChanges: boolean;
}

interface UnsavedChangesGuardOptions {
	shouldBlockNavigation: () => boolean;
	confirmDiscardChanges: () => Promise<boolean>;
	onNavigationConfirmed: () => void;
}

export function shouldBlockUnsavedNavigation({
	allowNavigationWithoutGuard,
	isSaving,
	hasUnsavedChanges
}: UnsavedNavigationBlockState): boolean {
	return !allowNavigationWithoutGuard && !isSaving && hasUnsavedChanges;
}

export function setupUnsavedChangesGuard({
	shouldBlockNavigation,
	confirmDiscardChanges,
	onNavigationConfirmed
}: UnsavedChangesGuardOptions): void {
	// Set while we re-issue a navigation the user confirmed, so the second
	// `beforeNavigate` pass lets it through instead of prompting again.
	let bypassNextNavigation = false;

	beforeNavigate((navigation) => {
		if (bypassNextNavigation) {
			return;
		}

		if (!shouldBlockNavigation()) {
			return;
		}

		// The confirmation dialog is async, so we cannot decide synchronously
		// here. Cancel the navigation, ask the user, and re-issue it on confirm.
		const target = navigation.to?.url;
		navigation.cancel();
		if (!target) {
			return;
		}

		void (async () => {
			const confirmed = await confirmDiscardChanges();
			if (!confirmed) {
				return;
			}

			onNavigationConfirmed();
			bypassNextNavigation = true;
			try {
				await goto(target);
			} finally {
				bypassNextNavigation = false;
			}
		})();
	});

	onMount(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!shouldBlockNavigation()) {
				return;
			}

			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});
}
