import { beforeNavigate } from '$app/navigation';
import { onMount } from 'svelte';

interface UnsavedNavigationBlockState {
	allowNavigationWithoutGuard: boolean;
	isSaving: boolean;
	hasUnsavedChanges: boolean;
}

interface UnsavedChangesGuardOptions {
	shouldBlockNavigation: () => boolean;
	confirmDiscardChanges: () => boolean;
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
	beforeNavigate((navigation) => {
		if (!shouldBlockNavigation()) {
			return;
		}

		if (!confirmDiscardChanges()) {
			navigation.cancel();
			return;
		}

		onNavigationConfirmed();
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
