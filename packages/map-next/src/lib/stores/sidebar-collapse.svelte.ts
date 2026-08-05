export interface SidebarCollapseSources {
	isAuthModalRoute: () => boolean;
	isNonListMode: () => boolean;
	isTaskLevel: () => boolean;
	isMobile: () => boolean;
}

export interface SidebarCollapse {
	collapsed: boolean;
	/** Content is only unmounted for the desktop collapsed card. */
	readonly effectiveCollapsed: boolean;
	expand(): void;
}

/**
 * The collapsed flag plus the two policies that override it: auth-modal routes
 * collapse the sidebar and restore the user's preference on leaving, and
 * non-list modes forbid collapsing. Must be called during component
 * initialization (it registers `$effect`s).
 */
export function createSidebarCollapse(sources: SidebarCollapseSources): SidebarCollapse {
	let collapsed = $state(false);
	// Track previous auth route state to detect transitions
	let wasAuthModalRoute = $state(false);
	// Store the user's preferred collapsed state before auth modal opens
	let collapsedBeforeAuthModal = $state(false);

	// Auto-collapse when auth modal routes are active
	$effect(() => {
		const isAuthModalRoute = sources.isAuthModalRoute();
		if (isAuthModalRoute && !wasAuthModalRoute) {
			// Entering auth route - save current state and collapse
			collapsedBeforeAuthModal = collapsed;
			collapsed = true;
		} else if (!isAuthModalRoute && wasAuthModalRoute) {
			// Leaving auth route - restore previous state
			collapsed = collapsedBeforeAuthModal;
		}
		wasAuthModalRoute = isAuthModalRoute;
	});

	// On mobile the bottom sheet stays mounted at every snap point (so dragging
	// between peek/half/full reveals live content); content is only unmounted for
	// the desktop collapsed card.
	const effectiveCollapsed = $derived(collapsed && !sources.isMobile());

	$effect(() => {
		// Keep detail/editor routes reachable: avoid rendering them in the collapsed
		// desktop card. On the mobile bottom sheet a detail view may still snap to
		// peek (map returns to view, selection kept), but task levels stay expanded.
		const forbidCollapse = !sources.isMobile() || sources.isTaskLevel();
		if (sources.isNonListMode() && collapsed && forbidCollapse) {
			collapsed = false;
		}
	});

	return {
		get collapsed() {
			return collapsed;
		},
		set collapsed(value: boolean) {
			collapsed = value;
		},
		get effectiveCollapsed() {
			return effectiveCollapsed;
		},
		expand() {
			collapsed = false;
		}
	};
}
