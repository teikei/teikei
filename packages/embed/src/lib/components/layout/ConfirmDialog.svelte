<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { AppButton } from '$lib/components/actions';
	import { confirmDialog } from '$lib/stores/confirm-dialog.svelte';

	function handleOpenChange(open: boolean) {
		// Dismissing via Escape, overlay click or the close button counts as cancel.
		if (!open) {
			confirmDialog.cancel();
		}
	}
</script>

<Dialog.Root open={confirmDialog.open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-sm" data-testid="confirm-dialog">
		<Dialog.Header>
			<Dialog.Title>{confirmDialog.title}</Dialog.Title>
			{#if confirmDialog.description}
				<Dialog.Description>{confirmDialog.description}</Dialog.Description>
			{/if}
		</Dialog.Header>
		<Dialog.Footer>
			<AppButton
				type="button"
				variant="outline"
				data-testid="confirm-dialog-cancel"
				onclick={() => confirmDialog.cancel()}
			>
				{confirmDialog.cancelLabel}
			</AppButton>
			<AppButton
				type="button"
				variant={confirmDialog.confirmVariant}
				data-testid="confirm-dialog-confirm"
				onclick={() => confirmDialog.accept()}
			>
				{confirmDialog.confirmLabel}
			</AppButton>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
