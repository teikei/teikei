<script lang="ts" module>
	export type BottomSheetSnap = 'peek' | 'half' | 'full';

	// Snap geometry — single source of truth. Both the resting layout heights
	// (CSS length strings, incl. safe-area insets) and the px math that picks the
	// nearest snap on release derive from these numbers, so tuning a snap only
	// touches one place.
	//
	// The peek height is also published as the `--bottom-sheet-peek-height` token
	// in layout.css (matching PEEK_HEIGHT_PX) so map chrome can clear the sheet
	// without re-hardcoding the value; keep that token and PEEK_HEIGHT_PX in sync.
	const PEEK_HEIGHT_PX = 156;
	const HALF_VIEWPORT_FRACTION = 0.52;
	const FULL_TOP_GAP_PX = 12;

	const RESTING_HEIGHT: Record<BottomSheetSnap, string> = {
		peek: 'var(--bottom-sheet-peek-height)',
		half: `${HALF_VIEWPORT_FRACTION * 100}dvh`,
		full: `calc(100dvh - max(env(safe-area-inset-top), ${FULL_TOP_GAP_PX}px))`
	};

	function snapHeightPx(target: BottomSheetSnap, viewportHeight: number): number {
		if (target === 'peek') return PEEK_HEIGHT_PX;
		if (target === 'half') return Math.round(viewportHeight * HALF_VIEWPORT_FRACTION);
		return viewportHeight - FULL_TOP_GAP_PX;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/tailwind';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		snap?: BottomSheetSnap;
		onSnap?: (snap: BottomSheetSnap) => void;
		children: Snippet;
		class?: string;
		'data-testid'?: string;
	}

	let {
		snap = 'half',
		onSnap,
		children,
		class: className,
		'data-testid': testId
	}: Props = $props();

	const SNAP_ORDER: BottomSheetSnap[] = ['peek', 'half', 'full'];

	let sheetEl = $state<HTMLElement>();
	let dragging = $state(false);
	// Live sheet height (px) while a drag is in progress; null falls back to the
	// CSS-driven per-snap height so safe-area insets stay correct at rest.
	let dragHeight = $state<number | null>(null);

	function viewportHeight(): number {
		return window.visualViewport?.height ?? window.innerHeight;
	}

	// Applied as an inline style so the resting height always wins over content
	// sizing (an explicit height + overflow-hidden clips the list at peek instead
	// of letting it grow the sheet).
	const heightStyle = $derived(
		dragHeight != null ? `height:${dragHeight}px` : `height:${RESTING_HEIGHT[snap]}`
	);

	function nearestSnap(height: number): BottomSheetSnap {
		const vh = viewportHeight();
		let best = SNAP_ORDER[0];
		let bestDelta = Infinity;
		for (const candidate of SNAP_ORDER) {
			const delta = Math.abs(snapHeightPx(candidate, vh) - height);
			if (delta < bestDelta) {
				bestDelta = delta;
				best = candidate;
			}
		}
		return best;
	}

	function handlePointerDown(event: PointerEvent) {
		dragging = true;
		dragHeight = sheetEl?.getBoundingClientRect().height ?? snapHeightPx(snap, viewportHeight());
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging) return;
		const vh = viewportHeight();
		const next = vh - event.clientY;
		dragHeight = Math.max(PEEK_HEIGHT_PX * 0.6, Math.min(vh, next));
	}

	function endDrag(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const height = dragHeight ?? snapHeightPx(snap, viewportHeight());
		dragHeight = null;
		(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
		const next = nearestSnap(height);
		if (next !== snap) {
			onSnap?.(next);
		}
	}

	// Keyboard fallback: cycle up/down through the snap points.
	function handleHandleKeydown(event: KeyboardEvent) {
		const index = SNAP_ORDER.indexOf(snap);
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			const next = SNAP_ORDER[Math.min(index + 1, SNAP_ORDER.length - 1)];
			if (next !== snap) onSnap?.(next);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			const next = SNAP_ORDER[Math.max(index - 1, 0)];
			if (next !== snap) onSnap?.(next);
		}
	}
</script>

<section
	bind:this={sheetEl}
	data-snap={snap}
	data-testid={testId}
	class={cn(
		'bottom-sheet fixed inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-4xl border border-sidebar-border bg-sidebar shadow-md',
		'z-[var(--z-map-sidebar)]',
		dragging ? 'select-none' : 'transition-[height] duration-200 ease-out',
		className
	)}
	style={heightStyle}
>
	<div
		class="flex h-11 w-full shrink-0 cursor-grab touch-none items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset active:cursor-grabbing"
		role="slider"
		tabindex="0"
		aria-label={m.map_sidebar_sheet_handle()}
		aria-valuemin={0}
		aria-valuemax={2}
		aria-valuenow={SNAP_ORDER.indexOf(snap)}
		data-testid="bottom-sheet-handle"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={endDrag}
		onpointercancel={endDrag}
		onkeydown={handleHandleKeydown}
	>
		<span class="h-1.5 w-10 rounded-full bg-muted-foreground/40"></span>
	</div>
	<div class="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
		{@render children()}
	</div>
</section>
