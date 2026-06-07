<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { EntryFeature } from '$lib/types/entries';
	import { cn } from '$lib/utils/tailwind';
	import * as m from '$lib/paraglide/messages.js';
	import EntryCard from './EntryCard.svelte';
	import EntryRowActions from './EntryRowActions.svelte';

	interface Props {
		features: EntryFeature[];
		totalCount: number;
		hasCappedEntries?: boolean;
		isMyEntriesScope?: boolean;
		isLoading?: boolean;
		onEntryClick: (feature: EntryFeature) => void;
		onEditEntry: (feature: EntryFeature, event: Event) => void;
		onDeleteEntry: (feature: EntryFeature, event: Event) => void;
		onRowActionTrigger: (event: Event) => void;
	}

	let {
		features,
		totalCount,
		hasCappedEntries = false,
		isMyEntriesScope = false,
		isLoading = false,
		onEntryClick,
		onEditEntry,
		onDeleteEntry,
		onRowActionTrigger
	}: Props = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>
		<div class="flex items-center justify-between gap-2">
			<span>{m.map_sidebar_entries()} ({totalCount})</span>
			{#if isMyEntriesScope && isLoading}
				<span class="text-xs text-muted-foreground">{m.map_sidebar_loading()}</span>
			{/if}
		</div>
		{#if hasCappedEntries}
			<p class="mt-1 text-xs text-muted-foreground" data-testid="entries-cap-indicator">
				{features.length}/{totalCount}
			</p>
		{/if}
	</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu data-testid="entries-list" aria-busy={isMyEntriesScope && isLoading}>
			{#each features as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
				{@const props = feature.properties}
				<Sidebar.MenuItem data-testid="entry-item">
					<Sidebar.MenuButton
						size="lg"
						class={cn('h-auto py-3', isMyEntriesScope && 'pr-12 lg:pr-34')}
						data-testid="entry-row"
						onclick={() => onEntryClick(feature)}
					>
						<EntryCard entry={props} />
					</Sidebar.MenuButton>
					{#if isMyEntriesScope}
						<EntryRowActions
							{feature}
							onEdit={onEditEntry}
							onDelete={onDeleteEntry}
							onTrigger={onRowActionTrigger}
						/>
					{/if}
				</Sidebar.MenuItem>
			{:else}
				<p class="px-2 py-4 text-sm text-muted-foreground">
					{isMyEntriesScope ? m.map_sidebar_my_entries_empty() : m.map_sidebar_no_entries_found()}
				</p>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
