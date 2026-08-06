<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { cn } from '$lib/utils/tailwind';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { MAP_SIDEBAR_WIDTH_PX, MAP_EDITOR_WIDTH_PX } from '$lib/config/layout';
	import BottomSheet, { type BottomSheetSnap } from './BottomSheet.svelte';

	interface Props {
		/** Compact state: collapsed floating card (desktop) / peek snap (mobile). */
		collapsed?: boolean;
		/**
		 * Which content the shell currently hosts; drives the mobile snap point.
		 * `task` and `editor` are both focused tasks (full sheet, no collapse);
		 * only `editor` also widens the desktop drawer.
		 */
		mode?: 'list' | 'detail' | 'task' | 'editor';
		/**
		 * Mobile only: force the sheet to full height (e.g. while the search input
		 * is focused with the keyboard open). Releasing it restores the previous
		 * snap point without losing it.
		 */
		raiseToFull?: boolean;
		children: Snippet;
	}

	let {
		collapsed = $bindable(false),
		mode = 'list',
		raiseToFull = false,
		children
	}: Props = $props();

	const isMobile = new IsMobile();

	// How far the mobile sheet opens when not collapsed. Independent from
	// `collapsed` so peek ↔ expanded toggling never loses the chosen height.
	let expandedLevel = $state<Exclude<BottomSheetSnap, 'peek'>>('half');

	// Detail opens at half, focused tasks at full — reconcile on each mode
	// transition (including the initial one, e.g. a deep link straight into an
	// editor) so a deliberate user drag afterwards is not immediately overridden.
	let previousMode = $state<Props['mode'] | undefined>(undefined);
	$effect(() => {
		if (mode === previousMode) return;
		previousMode = mode;
		if (mode === 'editor' || mode === 'task') {
			expandedLevel = 'full';
			collapsed = false;
		} else if (mode === 'detail') {
			expandedLevel = 'half';
			collapsed = false;
		}
	});

	const snap = $derived<BottomSheetSnap>(raiseToFull ? 'full' : collapsed ? 'peek' : expandedLevel);

	function handleSnap(next: BottomSheetSnap) {
		if (next === 'peek') {
			collapsed = true;
			return;
		}
		collapsed = false;
		expandedLevel = next;
	}

	// Desktop floating shell — geometry preserved from the previous inline shell.
	// Detail shares the editor's near-full-height insets so long profiles aren't
	// squeezed into a small box; only the list keeps the bounded card height.
	const desktopPositionClass = $derived.by(() => {
		if (collapsed) return 'top-auto bottom-2.5 h-auto';
		if (mode !== 'list') return 'top-2.5 bottom-2.5';
		return 'bottom-2.5 h-[min(70vh,36rem)]';
	});
	const desktopBreakpointPositionClass = $derived(
		collapsed ? 'md:top-2.5 md:bottom-auto' : 'md:top-2.5 md:bottom-2.5'
	);
	// Editor mode widens on lg; list/detail keep the standard sidebar width.
	const desktopWidthClass = $derived(
		mode === 'editor' ? 'lg:w-[var(--map-editor-width)]' : 'lg:w-[var(--map-sidebar-width)]'
	);
	const rootHeightClass = $derived(collapsed ? 'h-auto' : 'h-full');
</script>

{#if isMobile.current}
	<BottomSheet {snap} onSnap={handleSnap} data-testid="map-sidebar-shell">
		<Sidebar.Provider open={true} class="h-full min-h-0">
			<Sidebar.Root
				variant="floating"
				collapsible="none"
				class="h-full w-full border-0 bg-transparent shadow-none"
			>
				{@render children()}
			</Sidebar.Root>
		</Sidebar.Provider>
	</BottomSheet>
{:else}
	<div
		style={`--map-sidebar-width: ${MAP_SIDEBAR_WIDTH_PX}px; --map-editor-width: ${MAP_EDITOR_WIDTH_PX}px;`}
		class={cn(
			'pointer-events-auto absolute right-2.5 left-2.5 z-[var(--z-map-sidebar)] flex transition-[width] duration-200 ease-in-out md:right-auto md:h-auto md:w-[28rem] md:max-w-[calc(100vw-1.25rem)]',
			desktopWidthClass,
			desktopPositionClass,
			desktopBreakpointPositionClass
		)}
		data-testid="map-sidebar-shell"
	>
		<Sidebar.Provider open={true} class={cn('min-h-0', rootHeightClass)}>
			<Sidebar.Root
				variant="floating"
				collapsible="none"
				class={cn(
					'w-full rounded-4xl border border-sidebar-border shadow-md transition-[height] duration-200 ease-in-out',
					rootHeightClass
				)}
			>
				{@render children()}
			</Sidebar.Root>
		</Sidebar.Provider>
	</div>
{/if}
