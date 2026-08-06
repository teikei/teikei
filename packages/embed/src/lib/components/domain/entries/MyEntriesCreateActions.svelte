<script lang="ts">
	import { AppButton } from '$lib/components/actions';
	import type { EntryType } from '$lib/types/entries';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onCreate: (entryType: EntryType, event: Event) => void;
	}

	let { onCreate }: Props = $props();
</script>

<div
	class="sticky top-0 z-20 border-b bg-sidebar px-2 pb-2"
	data-testid="my-entries-create-actions"
>
	<div class="grid grid-cols-3 gap-2 pt-2">
		<AppButton
			type="button"
			variant="outline"
			data-testid="create-farm-action"
			onclick={(event) => onCreate('Farm', event)}
		>
			{m.map_sidebar_new_farm()}
		</AppButton>
		<AppButton
			type="button"
			variant="outline"
			data-testid="create-depot-action"
			onclick={(event) => onCreate('Depot', event)}
		>
			{m.map_sidebar_new_depot()}
		</AppButton>
		<AppButton
			type="button"
			variant="outline"
			data-testid="create-initiative-action"
			onclick={(event) => onCreate('Initiative', event)}
		>
			{m.map_sidebar_new_initiative()}
		</AppButton>
	</div>
</div>
