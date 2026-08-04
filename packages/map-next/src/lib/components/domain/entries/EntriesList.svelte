<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { AppButton } from '$lib/components/actions';
	import type { EntryFeature } from '$lib/types/entries';
	import { cn } from '$lib/utils/tailwind';
	import { routeBuilders } from '$lib/utils/routes';
	import { entryHoverKey, hoveredEntry } from '$lib/stores/hovered-entry.svelte';
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
		onResetView?: () => void;
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
		onRowActionTrigger,
		onResetView
	}: Props = $props();

	const SKELETON_ROW_COUNT = 5;
	const labelId = $props.id();

	// Skeleton rows only make sense where there is a real async load to wait on —
	// the my-entries fetch. The public list is populated synchronously from the
	// viewport, so an empty public list is a genuine empty state, not "loading".
	const showSkeleton = $derived(isMyEntriesScope && isLoading && features.length === 0);
	const showEmptyState = $derived(!showSkeleton && features.length === 0);

	let listEl = $state<HTMLUListElement | null>(null);

	// Scroll the matching card into view when the hover originates from the map,
	// so the user can see which list entry a hovered marker corresponds to.
	$effect(() => {
		const key = hoveredEntry.key;
		if (hoveredEntry.source !== 'map' || !key || !listEl) {
			return;
		}
		const target = listEl.querySelector(`[data-entry-key="${CSS.escape(key)}"]`);
		target?.scrollIntoView({ block: 'nearest' });
	});

	// Rows are real links, so only a plain primary click is handled in-app —
	// modified and non-primary clicks stay with the browser (new tab, etc.).
	function handleRowClick(event: MouseEvent, feature: EntryFeature) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		event.preventDefault();
		onEntryClick(feature);
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel id={labelId}>
		<div class="flex items-center justify-between gap-2">
			{#if hasCappedEntries}
				<span data-testid="entries-cap-indicator">
					{m.map_sidebar_entries_capped({ total: totalCount, shown: features.length })}
				</span>
			{:else}
				<span>{m.map_sidebar_entries_count({ count: totalCount })}</span>
			{/if}
			{#if isMyEntriesScope && isLoading}
				<span class="text-xs text-muted-foreground">{m.map_sidebar_loading()}</span>
			{/if}
		</div>
	</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu
			bind:ref={listEl}
			data-testid="entries-list"
			aria-busy={isMyEntriesScope && isLoading}
			aria-labelledby={labelId}
		>
			{#if showSkeleton}
				{#each Array.from({ length: SKELETON_ROW_COUNT }) as _, index (index)}
					<Sidebar.MenuItem data-testid="entry-skeleton" aria-hidden="true">
						<div class="flex items-start gap-3 px-2 py-3">
							<Skeleton class="size-9 shrink-0 rounded-full" />
							<div class="flex min-w-0 flex-1 flex-col gap-2">
								<Skeleton class="h-4 w-3/4" />
								<Skeleton class="h-3 w-1/2" />
							</div>
						</div>
					</Sidebar.MenuItem>
				{/each}
			{:else}
				{#each features as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
					{@const props = feature.properties}
					{@const key = entryHoverKey(props)}
					<Sidebar.MenuItem data-testid="entry-item">
						<Sidebar.MenuButton
							size="lg"
							class={cn(
								'h-auto py-3 data-highlighted:bg-sidebar-accent',
								isMyEntriesScope && 'pr-12 lg:pr-34'
							)}
							data-testid="entry-row"
							data-entry-key={key}
							data-highlighted={hoveredEntry.key === key ? '' : undefined}
							onclick={(event: MouseEvent) => handleRowClick(event, feature)}
							onmouseenter={() => hoveredEntry.setHover(props, 'list')}
							onmouseleave={() => hoveredEntry.clear(props)}
						>
							{#snippet child({ props: rowProps })}
								<a
									href={routeBuilders.entryDetail(props.type, props.id)}
									data-sveltekit-preload-data="tap"
									{...rowProps}
								>
									<EntryCard entry={props} />
								</a>
							{/snippet}
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
				{/each}
			{/if}
		</Sidebar.Menu>

		{#if showEmptyState}
			{#if isMyEntriesScope}
				<p class="px-2 py-4 text-sm text-muted-foreground">
					{m.map_sidebar_my_entries_empty()}
				</p>
			{:else}
				<div
					class="flex flex-col items-center gap-2 px-4 py-8 text-center"
					data-testid="entries-empty-state"
				>
					<p class="text-sm font-medium text-foreground">{m.map_sidebar_empty_title()}</p>
					<p class="text-sm text-muted-foreground">{m.map_sidebar_empty_description()}</p>
					{#if onResetView}
						<AppButton
							type="button"
							variant="outline"
							data-testid="entries-empty-reset"
							onclick={onResetView}
						>
							{m.map_sidebar_empty_reset_action()}
						</AppButton>
					{/if}
				</div>
			{/if}
		{/if}
	</Sidebar.GroupContent>
</Sidebar.Group>
