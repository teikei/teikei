<script lang="ts">
	import { AppButton } from '$lib/components/actions';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		action: 'created' | 'updated' | 'deleted';
		farmId?: string | null;
		onViewAssociatedFarm: (farmId: string | null) => void;
		onDismiss: () => void;
	}

	let { action, farmId = null, onViewAssociatedFarm, onDismiss }: Props = $props();

	const message = $derived(
		action === 'created'
			? m.editor_depot_saved_created()
			: action === 'updated'
				? m.editor_depot_saved_updated()
				: m.editor_depot_saved_deleted()
	);
</script>

<div
	class="mx-2 mt-2 rounded-md border border-success-border bg-success-muted p-3 text-sm text-success-foreground"
	data-testid="depot-mutation-feedback"
>
	<p>{message}</p>
	<div class="mt-2 flex flex-wrap items-center gap-2">
		{#if farmId}
			<AppButton
				type="button"
				variant="outline"
				data-testid="view-associated-farm-action"
				onclick={() => onViewAssociatedFarm(farmId)}
			>
				{m.editor_depot_view_associated_farm()}
			</AppButton>
		{/if}
		<AppButton
			type="button"
			variant="outline"
			data-testid="dismiss-depot-feedback"
			onclick={onDismiss}
		>
			{m.editor_depot_dismiss_feedback()}
		</AppButton>
	</div>
</div>
