<script lang="ts" module>
	export interface DefinitionListItem {
		term: string;
		description: string;
	}

	export interface DefinitionListProps {
		items: DefinitionListItem[];
	}
</script>

<script lang="ts">
	let { items }: DefinitionListProps = $props();
</script>

<dl class="flex flex-col gap-1 text-sm">
	{#each items as item (item.term)}
		<div class="flex flex-wrap items-baseline gap-1.5">
			<dt class="font-medium text-foreground">{item.term}</dt>
			<dd class="text-muted-foreground">{item.description}</dd>
		</div>
	{/each}
</dl>
