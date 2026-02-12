<script lang="ts">
	import type { EntryProperties } from '$lib/types/entries';
	import { getEntryIcon } from '$lib/utils/entries';

	interface EntryCardProps {
		entry: EntryProperties;
		iconSize?: string;
	}

	let { entry, iconSize = 'size-5' }: EntryCardProps = $props();

	const Icon = $derived(getEntryIcon(entry.type));

	function formatAddress(props: EntryProperties): string {
		const parts = [props.postalcode, props.city].filter(Boolean);
		return parts.join(' ');
	}
</script>

<div class="flex shrink-0 items-center justify-center">
	{#if Icon}
		<Icon class={iconSize} />
	{/if}
</div>
<div class="flex min-w-0 flex-col gap-0.5">
	<span class="truncate text-foreground">{entry.name}</span>
	<span class="truncate text-muted-foreground">
		{formatAddress(entry)}
	</span>
</div>
