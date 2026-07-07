<script lang="ts">
	import { AppButton, IconButton } from '$lib/components/actions';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { EntryFeature } from '$lib/types/entries';
	import * as m from '$lib/paraglide/messages.js';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';

	interface Props {
		feature: EntryFeature;
		onEdit: (feature: EntryFeature, event: Event) => void;
		onDelete: (feature: EntryFeature, event: Event) => void;
		onTrigger: (event: Event) => void;
	}

	let { feature, onEdit, onDelete, onTrigger }: Props = $props();
</script>

<div
	class="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-1 lg:flex"
	data-testid="entry-row-actions-desktop"
>
	<AppButton
		type="button"
		variant="outline"
		data-testid="entry-action-edit-inline"
		onclick={(event) => onEdit(feature, event)}
	>
		{m.map_sidebar_action_edit()}
	</AppButton>
	<AppButton
		type="button"
		variant="destructive"
		data-testid="entry-action-delete-inline"
		onclick={(event) => onDelete(feature, event)}
	>
		{m.map_sidebar_action_delete()}
	</AppButton>
</div>
<div
	class="absolute top-1/2 right-2 -translate-y-1/2 lg:hidden"
	data-testid="entry-row-actions-mobile"
>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<IconButton
				type="button"
				data-testid="entry-actions-overflow-trigger"
				label={m.map_sidebar_row_actions()}
				onclick={onTrigger}
			>
				<EllipsisIcon />
			</IconButton>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="z-[var(--z-map-overlay)]">
			<DropdownMenu.Item
				data-testid="entry-action-edit-overflow"
				onclick={(event) => onEdit(feature, event)}
			>
				{m.map_sidebar_action_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				variant="destructive"
				data-testid="entry-action-delete-overflow"
				onclick={(event) => onDelete(feature, event)}
			>
				{m.map_sidebar_action_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
