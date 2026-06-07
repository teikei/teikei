<script lang="ts">
	import type { EntryProperties } from '$lib/types/entries';
	import { getPlaceIcon } from '$lib/utils/marker-icons';

	interface EntryCardProps {
		entry: EntryProperties;
		iconSize?: string;
	}

	let { entry, iconSize = 'size-9' }: EntryCardProps = $props();

	const icon = $derived(getPlaceIcon(entry.type));

	function formatAddress(props: EntryProperties): string {
		const parts = [props.postalcode, props.city].filter(Boolean);
		return parts.join(' ');
	}
</script>

<div class="flex shrink-0 items-center justify-center">
	<img class={iconSize} src={icon} alt={entry.name || entry.type} />
</div>
<div class="ml-1 flex min-w-0 flex-col">
	<span class="truncate text-foreground">{entry.name}</span>
	<span class="truncate text-muted-foreground">
		{formatAddress(entry)}
	</span>
</div>

<style>
	img {
		object-fit: contain;
	}
</style>
