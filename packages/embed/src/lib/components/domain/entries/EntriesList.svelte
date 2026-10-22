<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton } from '$lib/components/actions';
	import type { EntryFeature } from '$lib/types/entries';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { routeBuilders } from '$lib/utils/routes';
	import { entryHoverKey, hoveredEntry } from '$lib/stores/hovered-entry.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import EntryCard from './EntryCard.svelte';

	interface Props {
		features: EntryFeature[];
		totalCount: number;
		hasCappedEntries?: boolean;
		onEntryClick: (feature: EntryFeature) => void;
		onResetView?: () => void;
	}

	let {
		features,
		totalCount,
		hasCappedEntries = false,
		onEntryClick,
		onResetView
	}: Props = $props();

	const COUNT_ANNOUNCE_DEBOUNCE_MS = 500;
	const labelId = $props.id();

	function formatCountLabel(): string {
		return hasCappedEntries
			? m.map_sidebar_entries_capped({ total: totalCount, shown: features.length })
			: m.map_sidebar_entries_count({ count: totalCount });
	}

	const countLabel = $derived(formatCountLabel());

	// The count doubles as a live region, so it is debounced: a continuous pan
	// announces once on settle instead of streaming every intermediate viewport.
	// The visible number lags by the same 500ms — intended, and it also removes
	// the per-frame flicker the undebounced count had. The first value is applied
	// synchronously so the list is never briefly nameless (see `aria-labelledby`).
	let announcedCountLabel = $state(formatCountLabel());
	const debouncedCountLabel = createDebouncedCallback(() => {
		announcedCountLabel = countLabel;
	}, COUNT_ANNOUNCE_DEBOUNCE_MS);

	$effect(() => {
		void countLabel;
		debouncedCountLabel.trigger();
		return () => debouncedCountLabel.cancel();
	});

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
		<span data-testid={hasCappedEntries ? 'entries-cap-indicator' : undefined} aria-live="polite">
			{announcedCountLabel}
		</span>
	</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu bind:ref={listEl} data-testid="entries-list" aria-labelledby={labelId}>
			{#each features as feature (`${feature.properties?.type}-${feature.properties?.id}`)}
				{@const props = feature.properties}
				{@const key = entryHoverKey(props)}
				<Sidebar.MenuItem data-testid="entry-item">
					<Sidebar.MenuButton
						size="lg"
						class="h-auto py-3 data-highlighted:bg-sidebar-accent"
						data-testid="entry-row"
						data-entry-key={key}
						data-highlighted={hoveredEntry.key === key ? '' : undefined}
						onclick={(event: MouseEvent) => handleRowClick(event, feature)}
						onmouseenter={() => hoveredEntry.setHover(props, 'list')}
						onmouseleave={() => hoveredEntry.clear(props)}
						onfocus={() => hoveredEntry.setHover(props, 'list')}
						onblur={() => hoveredEntry.clear(props)}
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
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>

		{#if features.length === 0}
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
	</Sidebar.GroupContent>
</Sidebar.Group>
