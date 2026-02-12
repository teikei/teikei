<script lang="ts">
	import type { EntryProperties } from '$lib/types/entries';
	interface EntryCardProps {
		entry: EntryProperties;
	}

	let { entry }: EntryCardProps = $props();
</script>

<div class="flex min-w-0 flex-col gap-0.5">
	<span class="truncate text-background">{entry.name}</span>
	<span class="truncate text-muted-foreground">
		{entry.city}
	</span>
</div>
