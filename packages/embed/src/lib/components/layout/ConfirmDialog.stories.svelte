<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import AppButton from '$lib/components/actions/AppButton.svelte';
	import { confirmDialog } from '$lib/stores/confirm-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Layout/ConfirmDialog',
		component: ConfirmDialog,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Global dialog driven by the `confirmDialog` store: callers `await confirmDialog.confirm({ ... })` and get a boolean back.'
				}
			}
		}
	});
</script>

<Story name="Destructive" asChild>
	<ConfirmDialog />
	<AppButton
		variant="destructive"
		onclick={() =>
			confirmDialog.confirm({
				title: 'Eintrag löschen?',
				description: 'Diese Aktion kann nicht rückgängig gemacht werden.',
				confirmLabel: 'Löschen',
				cancelLabel: 'Abbrechen',
				confirmVariant: 'destructive'
			})}
	>
		Eintrag löschen
	</AppButton>
</Story>

<Story name="Default" asChild>
	<ConfirmDialog />
	<AppButton
		variant="outline"
		onclick={() =>
			confirmDialog.confirm({
				title: 'Änderungen verwerfen?',
				confirmLabel: 'Verwerfen',
				cancelLabel: 'Weiter bearbeiten',
				confirmVariant: 'default'
			})}
	>
		Abbrechen
	</AppButton>
</Story>
