<script lang="ts">
	import { navigating, page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { SvelteSet } from 'svelte/reactivity';
	import { authStore } from '$lib/stores/auth.svelte';
	import { confirmDialog } from '$lib/stores/confirm-dialog.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { ErrorState, SidebarScrollArea, SidebarShell } from '$lib/components/layout';
	import config from '$lib/config/app-configuration';
	import type {
		DepotFeature,
		EntryFeature,
		EntryFeatureCollection,
		MainEntryFeature
	} from '$lib/types/entries';
	import type { RegionOption } from '$lib/utils/regions';
	import {
		EntriesList,
		MyEntriesCreateActions,
		MyEntriesList,
		ProfileSkeleton
	} from '$lib/components/domain/entries';
	import { DepotEditor } from '$lib/components/domain/depots';
	import { FarmProfile } from '$lib/components/domain/farms';
	import { InitiativeProfile } from '$lib/components/domain/initiatives';
	import { MapSidebarHeader, SlimSearchHeader } from '$lib/components/domain/map';
	import { getAssociatedFarmIdForDepot, getMainEntry } from '$lib/api/entry-details';
	import { getAutocompleteSuggestions, type AutocompleteSuggestion } from '$lib/api/discovery';
	import { deleteDepot, deleteFarm, deleteInitiative } from '$lib/api/entry-mutations';
	import { networkSelection } from '$lib/stores/network-selection.svelte';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { mainEntryTypeToResource } from '$lib/utils/main-entries';
	import { isAuthRouteHash, parseHashRoute, routeBuilders } from '$lib/utils/routes';
	import type { LoadErrorKind } from '$lib/utils/load-error';
	import { toastSuccess, toastError, toastInfo } from '$lib/utils/toast';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

	const isMobile = new IsMobile();

	const ALL_REGIONS_VALUE = '__all_regions__';
	const SEARCH_SUGGESTIONS_DEBOUNCE_MS = 300;
	const MIN_SEARCH_CHARS = 2;
	const MAX_VISIBLE_ENTRIES = 200;
	const { displayLocale } = config;

	interface MapSidebarProps {
		entries?: EntryFeatureCollection;
		myEntries?: EntryFeatureCollection;
		isMyEntriesLoading?: boolean;
		myEntriesError?: boolean;
		onEntryClick?: (feature: EntryFeature, options?: { openPopup?: boolean }) => void;
		onDetailClose?: () => void;
		countryOptions?: RegionOption[];
		stateOptions?: RegionOption[];
		selectedCountry?: string;
		selectedState?: string | null;
		onCountryChange?: (countryCode: string) => void;
		onStateChange?: (stateCode: string | null) => void;
		onResetView?: () => void;
		onRefreshMyEntries?: () => void | Promise<void>;
		/** Restore the pre-detail map viewport when going "back" (F12.3). */
		onRestoreDetailView?: () => void;
	}

	let {
		entries,
		myEntries,
		isMyEntriesLoading = false,
		myEntriesError = false,
		onEntryClick,
		onDetailClose,
		countryOptions = [],
		stateOptions = [],
		selectedCountry = '',
		selectedState = null,
		onCountryChange,
		onStateChange,
		onResetView,
		onRefreshMyEntries,
		onRestoreDetailView
	}: MapSidebarProps = $props();

	let searchValue = $state('');
	let searchSuggestions: AutocompleteSuggestion[] = $state([]);
	let isSearchLoading = $state(false);
	let latestSearchRequestId = $state(0);
	let searchInputEl = $state<HTMLInputElement | null>(null);
	let isSearchFocused = $state(false);
	let collapsed = $state(false);
	let latestInteractionId = $state(0);
	let isDepotDeletePending = $state(false);
	let isMainEntryDeletePending = $state(false);
	// List scroll restore (F12.3): captured when a detail opens, re-applied when
	// the list remounts after a "back". The list content is unmounted while a
	// detail is open, so scrollTop would otherwise be lost.
	let listScrollEl = $state<HTMLElement | null>(null);
	let savedListScrollTop = $state(0);
	let pendingScrollRestore = $state(false);

	const parsedRoute = $derived(parseHashRoute(page.url.hash));

	// Auto-collapse when auth modal routes are active
	const isAuthModalRoute = $derived(isAuthRouteHash(page.url.hash));
	const routeKind = $derived(parsedRoute.kind);
	const isUserAuthenticated = $derived(authStore.isAuthenticated);
	const isAuthInitialized = $derived(authStore.isInitialized);
	const isMyEntriesScope = $derived(routeKind === 'myentries' && isUserAuthenticated);
	const baseEntries = $derived.by(() =>
		isMyEntriesScope ? (myEntries?.features ?? []) : (entries?.features ?? [])
	);

	// Track previous auth route state to detect transitions
	let wasAuthModalRoute = $state(false);
	// Store the user's preferred collapsed state before auth modal opens
	let collapsedBeforeAuthModal = $state(false);
	let redirectingToSignInForMyEntries = $state(false);

	$effect(() => {
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

	$effect(() => {
		if (routeKind !== 'myentries') {
			redirectingToSignInForMyEntries = false;
			return;
		}

		if (!isAuthInitialized || isUserAuthenticated || redirectingToSignInForMyEntries) {
			return;
		}

		redirectingToSignInForMyEntries = true;
		void goto(routeBuilders.auth.signInWithRedirect(routeBuilders.myEntries()));
	});

	// Detail view from route data (loaded by +page.ts)
	const detailData = $derived(page.data.detailData);
	const editorData = $derived(page.data.editorData);
	const depotDetailData = $derived(page.data.depotDetailData);
	const depotEditorData = $derived(page.data.depotEditorData);
	// Loaders catch fetch failures (via loadCatching) and return this kind so
	// the drawer shows a designed error state instead of SvelteKit's error page
	// (14.2). 'not-found' gets its own copy and no retry; 'unavailable' offers one.
	const loadError = $derived(page.data.loadError as LoadErrorKind | undefined);
	// Routes whose loaders fetch remote data before rendering; navigating to one
	// shows a profile skeleton in the drawer instead of the frozen previous view.
	const DATA_ROUTE_IDS = new Set([
		'/farms/[id]',
		'/farms/[id]/edit',
		'/farms/new',
		'/initiatives/[id]',
		'/initiatives/[id]/edit',
		'/initiatives/new',
		'/depots/[id]/edit',
		'/depots/new',
		'/locations/[id]'
	]);
	const isNavigatingToDataRoute = $derived(
		navigating.to != null && DATA_ROUTE_IDS.has(navigating.to.route.id ?? '')
	);
	const showDetail = $derived(!!detailData);
	const showEditor = $derived(!!editorData);
	const showDepotEditor = $derived(!!depotEditorData);
	const isNonListMode = $derived(showDetail || showEditor || showDepotEditor);
	const isEditorMode = $derived(showEditor || showDepotEditor);
	// Profile inline edit (Feature 4 & 9): farms and initiatives render their
	// section-based FarmProfile/InitiativeProfile for read, edit, and create.
	// Creation is the same section form as editing with no existing entry to
	// hydrate — the standalone 3-step creation wizard was removed (Feature 9).
	const isFarmEditor = $derived(showEditor && editorData?.entryType === 'Farm');
	const isFarmDetail = $derived(
		showDetail && !showEditor && detailData?.properties.type === 'Farm'
	);
	const isInitiativeEditor = $derived(showEditor && editorData?.entryType === 'Initiative');
	const isInitiativeDetail = $derived(
		showDetail && !showEditor && detailData?.properties.type === 'Initiative'
	);
	const ownedMainEntryIds = $derived.by(() => {
		const ownedIds = new SvelteSet<string>();
		for (const feature of myEntries?.features ?? []) {
			const type = feature.properties?.type;
			if (type === 'Farm' || type === 'Initiative') {
				ownedIds.add(feature.properties.id);
			}
		}
		return ownedIds;
	});
	const ownedDepotIds = $derived.by(() => {
		const ownedIds = new SvelteSet<string>();
		for (const feature of myEntries?.features ?? []) {
			if (feature.properties?.type === 'Depot') {
				ownedIds.add(feature.properties.id);
			}
		}
		return ownedIds;
	});
	const ownedFarmIds = $derived.by(() => {
		const ownedIds = new SvelteSet<string>();
		for (const feature of myEntries?.features ?? []) {
			if (feature.properties?.type === 'Farm') {
				ownedIds.add(feature.properties.id);
			}
		}
		return ownedIds;
	});
	const selectedCountryLabel = $derived(
		countryOptions.find((option) => option.value === selectedCountry)?.label ??
			m.map_sidebar_country_label()
	);
	const selectedStateLabel = $derived.by(() => {
		if (stateOptions.length === 0) {
			return m.map_sidebar_no_regions_available();
		}

		if (!selectedState) {
			return m.map_sidebar_all_regions();
		}

		return stateOptions.find((option) => option.value === selectedState)?.label ?? selectedState;
	});
	const stateSelectValue = $derived(selectedState ?? ALL_REGIONS_VALUE);
	// On mobile the search input stays reachable at the peek snap (collapsed), and
	// focusing it lifts the sheet to full (raiseToFull); keep the panel available
	// there regardless of `collapsed`. Not focus-gated, so a tap on a suggestion
	// (which blurs the input first) still lands.
	const showSearchSuggestions = $derived(
		(!collapsed || isMobile.current) &&
			!isMyEntriesScope &&
			searchValue.trim().length >= MIN_SEARCH_CHARS
	);
	// A failed load counts as 'detail' so the shell expands (mobile sheet rises
	// from peek, desktop card uncollapses) and the error state is actually
	// visible instead of clipped inside the peek-height sheet.
	const shellMode = $derived<'list' | 'detail' | 'editor'>(
		isEditorMode ? 'editor' : showDetail || loadError ? 'detail' : 'list'
	);
	// On mobile the bottom sheet stays mounted at every snap point (so dragging
	// between peek/half/full reveals live content); content is only unmounted for
	// the desktop collapsed card.
	const effectiveCollapsed = $derived(collapsed && !isMobile.current);

	$effect(() => {
		// Keep detail/editor routes reachable: avoid rendering them in the collapsed
		// desktop card. On the mobile bottom sheet a detail view may still snap to
		// peek (map returns to view, selection kept), but editors stay expanded.
		const forbidCollapse = !isMobile.current || isEditorMode;
		if (isNonListMode && collapsed && forbidCollapse) {
			collapsed = false;
		}
	});

	// Track when detail route changes to trigger map pan
	let lastDetailId = $state<string | null>(null);

	$effect(() => {
		if (detailData && detailData.properties.id !== lastDetailId) {
			// Pan from resolved detail data (works for deep-link and redirect loads, too).
			onEntryClick?.(detailData as EntryFeature, { openPopup: true });
			lastDetailId = detailData.properties.id;
		} else if (!detailData) {
			lastDetailId = null;
		}
	});

	// Expose function to open detail view from outside (e.g., map click)
	export function openDetailView(feature: EntryFeature) {
		void handleEntryClick(feature, { triggerPan: false });
	}

	// Expose search focusing for the app-root keyboard shortcut (`/` and ⌘K).
	// Editors and creation forms deliberately hide the search, so this is a no-op there.
	export function focusSearch() {
		// No search surface in editors/creation forms, and the input is disabled in
		// my-entries scope — focusing a disabled input is a silent no-op, so bail.
		if (isEditorMode || isMyEntriesScope) {
			return;
		}
		collapsed = false;
		// The input may be (re)mounting after expanding; focus on the next frame.
		requestAnimationFrame(() => searchInputEl?.focus());
	}

	function handleSearchFocus() {
		isSearchFocused = true;
	}

	function handleSearchBlur() {
		isSearchFocused = false;
	}

	const visibleFeatures = $derived(baseEntries.slice(0, MAX_VISIBLE_ENTRIES));
	const hasCappedEntries = $derived(baseEntries.length > visibleFeatures.length);

	function stopRowActionEvent(event: Event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function getFirstAssociatedFarmId(depot: DepotFeature): string | null {
		return depot.properties.farms?.features?.[0]?.properties?.id ?? null;
	}

	function showDepotMutationToast(
		action: 'created' | 'updated' | 'deleted',
		farmId: string | null
	) {
		const message =
			action === 'created'
				? m.editor_depot_saved_created()
				: action === 'updated'
					? m.editor_depot_saved_updated()
					: m.editor_depot_saved_deleted();

		toastSuccess(
			message,
			farmId
				? {
						action: {
							label: m.editor_depot_view_associated_farm(),
							onClick: () => void goto(routeBuilders.farm.detail(farmId))
						}
					}
				: undefined
		);
	}

	function handleCreateEntry(entryType: 'Farm' | 'Depot' | 'Initiative', event: Event) {
		stopRowActionEvent(event);
		if (entryType === 'Farm') {
			void goto(routeBuilders.farm.create());
			return;
		}
		if (entryType === 'Initiative') {
			void goto(routeBuilders.initiative.create());
			return;
		}

		// A new depot always attaches to one of the user's own farms; point users
		// with no farms at creating a farm first (legacy parity).
		if (ownedFarmIds.size === 0) {
			toastInfo(m.map_sidebar_depot_needs_farm());
			return;
		}

		void goto(routeBuilders.depotLegacy.create());
	}

	function handleEditEntry(feature: EntryFeature, event: Event) {
		stopRowActionEvent(event);
		const type = feature.properties.type;
		if (type === 'Farm') {
			void goto(routeBuilders.farm.edit(feature.properties.id));
			return;
		}
		if (type === 'Initiative') {
			void goto(routeBuilders.initiative.edit(feature.properties.id));
			return;
		}

		void goto(routeBuilders.depotLegacy.edit(feature.properties.id));
	}

	async function handleDeleteEntry(feature: EntryFeature, event: Event) {
		stopRowActionEvent(event);
		if (feature.properties.type === 'Depot') {
			await handleDeleteDepot(feature as DepotFeature);
			return;
		}
		await handleDeleteMainEntry(feature as MainEntryFeature);
	}

	async function handleDeleteDepot(feature: DepotFeature) {
		if (isDepotDeletePending) {
			return;
		}

		const confirmed = await confirmDialog.confirm({
			title: m.editor_depot_delete_confirm(),
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel(),
			confirmVariant: 'destructive'
		});
		if (!confirmed) {
			return;
		}

		isDepotDeletePending = true;
		try {
			const farmId = getFirstAssociatedFarmId(feature);
			await deleteDepot(feature.properties.id);
			await goto(routeBuilders.myEntries(), { replaceState: true });
			// Deleting from within #/myentries navigates to the same hash, so the
			// hash-driven owned-entries refresh in createMyEntriesStore won't fire.
			// Trigger it explicitly so the deleted depot disappears immediately.
			await onRefreshMyEntries?.();
			showDepotMutationToast('deleted', farmId);
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete depot ${feature.properties.id}`, error);
			}
			toastError(m.editor_depot_delete_failed());
		} finally {
			isDepotDeletePending = false;
		}
	}

	async function handleDeleteMainEntry(feature: MainEntryFeature) {
		if (isMainEntryDeletePending) {
			return;
		}

		const isFarm = feature.properties.type === 'Farm';
		const name = feature.properties.name;

		let description: string = isFarm
			? m.map_sidebar_delete_farm_confirm_description()
			: m.map_sidebar_delete_initiative_confirm_description();

		// Deleting a farm detaches its depots: the FK cascade removes only the
		// farm↔depot association rows, never the depot records themselves (own or
		// foreign-owned). Surface that consequence when the farm actually has depots.
		if (isFarm) {
			try {
				const farmDetail = await getMainEntry('farms', feature.properties.id);
				const hasDepots =
					farmDetail.properties.type === 'Farm' &&
					(farmDetail.properties.depots?.features.length ?? 0) > 0;
				if (hasDepots) {
					description = `${description} ${m.map_sidebar_delete_farm_confirm_depots_note()}`;
				}
			} catch (error) {
				if (dev) {
					console.warn(`Failed to load depots for farm ${feature.properties.id}`, error);
				}
			}
		}

		const confirmed = await confirmDialog.confirm({
			title: isFarm
				? m.map_sidebar_delete_farm_confirm_title({ name })
				: m.map_sidebar_delete_initiative_confirm_title({ name }),
			description,
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel(),
			confirmVariant: 'destructive'
		});
		if (!confirmed) {
			return;
		}

		isMainEntryDeletePending = true;
		try {
			if (isFarm) {
				await deleteFarm(feature.properties.id);
			} else {
				await deleteInitiative(feature.properties.id);
			}
			await goto(routeBuilders.myEntries(), { replaceState: true });
			// Same-hash navigation won't retrigger the owned-entries refresh, so fire
			// it explicitly; invalidateAll re-runs the layout load so the deleted
			// entry also disappears from the map without a full page reload.
			await onRefreshMyEntries?.();
			await invalidateAll();
			toastSuccess(
				isFarm ? m.map_sidebar_delete_farm_success() : m.map_sidebar_delete_initiative_success()
			);
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete ${feature.properties.type} ${feature.properties.id}`, error);
			}
			toastError(
				isFarm ? m.map_sidebar_delete_farm_failed() : m.map_sidebar_delete_initiative_failed()
			);
		} finally {
			isMainEntryDeletePending = false;
		}
	}

	function handleDepotSelectFromProfile(depot: DepotFeature) {
		onEntryClick?.(depot as EntryFeature, { openPopup: true });
	}

	function handleDepotEditFromProfile(depot: DepotFeature) {
		const farmId = detailData?.properties.id;
		if (farmId) {
			void goto(routeBuilders.depot.editForFarm(depot.properties.id, farmId));
			return;
		}
		void goto(routeBuilders.depotLegacy.edit(depot.properties.id));
	}

	function handleAddDepotFromProfile() {
		const farmId = detailData?.properties.id;
		if (!farmId) {
			return;
		}
		void goto(routeBuilders.depot.createForFarm(farmId));
	}

	async function handleDepotDeleteFromProfile(depot: DepotFeature) {
		if (isDepotDeletePending) {
			return;
		}

		const confirmed = await confirmDialog.confirm({
			title: m.editor_depot_delete_confirm(),
			confirmLabel: m.map_sidebar_action_delete(),
			cancelLabel: m.editor_cancel(),
			confirmVariant: 'destructive'
		});
		if (!confirmed) {
			return;
		}

		isDepotDeletePending = true;
		try {
			await deleteDepot(depot.properties.id);
			// Reload the open farm profile so the deleted depot card disappears.
			await invalidateAll();
			await onRefreshMyEntries?.();
			toastSuccess(m.editor_depot_saved_deleted());
		} catch (error) {
			if (dev) {
				console.warn(`Failed to delete depot ${depot.properties.id}`, error);
			}
			toastError(m.editor_depot_delete_failed());
		} finally {
			isDepotDeletePending = false;
		}
	}

	async function loadSearchSuggestions(query: string) {
		const trimmed = query.trim();
		if (trimmed.length < MIN_SEARCH_CHARS) {
			searchSuggestions = [];
			isSearchLoading = false;
			return;
		}

		const requestId = ++latestSearchRequestId;
		isSearchLoading = true;

		try {
			const suggestions = await getAutocompleteSuggestions({
				text: trimmed,
				locale: displayLocale,
				withEntries: true
			});

			if (requestId !== latestSearchRequestId) {
				return;
			}

			searchSuggestions = suggestions;
		} catch (error) {
			if (requestId !== latestSearchRequestId) {
				return;
			}
			searchSuggestions = [];
			if (dev) {
				console.warn('Failed to fetch search suggestions', error);
			}
		} finally {
			if (requestId === latestSearchRequestId) {
				isSearchLoading = false;
			}
		}
	}

	const debouncedSuggestionsSearch = createDebouncedCallback(
		() => void loadSearchSuggestions(searchValue),
		SEARCH_SUGGESTIONS_DEBOUNCE_MS
	);

	$effect(() => {
		const query = searchValue.trim();
		if (query.length < MIN_SEARCH_CHARS) {
			latestSearchRequestId = -1;
			isSearchLoading = false;
			searchSuggestions = [];
			debouncedSuggestionsSearch.cancel();
			return;
		}

		// Enter the loading state up front so the panel shows the loading row
		// (not a false "no results" empty state) during the debounce window.
		isSearchLoading = true;
		debouncedSuggestionsSearch.trigger();
	});

	async function handleEntryClick(feature: EntryFeature, options: { triggerPan?: boolean } = {}) {
		const interactionId = ++latestInteractionId;
		const props = feature.properties;

		// Remember where the list was scrolled so "back" can restore it (F12.3).
		savedListScrollTop = listScrollEl?.scrollTop ?? 0;

		if (isMyEntriesScope) {
			if (options.triggerPan !== false) {
				onEntryClick?.(feature, { openPopup: true });
			}
			return;
		}

		if (props.type === 'Depot') {
			try {
				const farmId = await getAssociatedFarmIdForDepot(props.id);
				// Ignore stale async results when a newer interaction has happened.
				if (interactionId !== latestInteractionId) {
					return;
				}

				if (farmId) {
					const associatedFarmFeature = entries?.features.find(
						(candidate) =>
							candidate.properties?.type === 'Farm' && candidate.properties?.id === farmId
					);

					if (associatedFarmFeature) {
						onEntryClick?.(associatedFarmFeature as EntryFeature, { openPopup: true });
						// Prevent duplicate pan when the detail route data resolves for this farm.
						lastDetailId = farmId;
					}
					await goto(routeBuilders.farm.detail(farmId));
					return;
				}

				if (dev) {
					console.warn(`No associated farm found for depot ${props.id}`);
				}
			} catch (error) {
				if (dev) {
					console.warn(`Failed to resolve associated farm for depot ${props.id}`, error);
				}
			}
			return;
		}

		// Trigger map click handler (for panning/popup) when requested.
		if (options.triggerPan !== false) {
			onEntryClick?.(feature, { openPopup: true });
		}

		// Prevent duplicate panning when route data for this same entry arrives.
		lastDetailId = props.id;

		// Navigate to detail route for farm/initiative.
		const mainEntryResource = mainEntryTypeToResource(props.type);
		await goto(routeBuilders.mainEntryDetail(mainEntryResource, props.id));
	}

	// Re-apply the captured list scroll once the list content remounts after a
	// "back". Runs when both the restore is pending and the element is bound.
	$effect(() => {
		if (pendingScrollRestore && listScrollEl) {
			listScrollEl.scrollTop = savedListScrollTop;
			pendingScrollRestore = false;
		}
	});

	function handleCloseDetail() {
		// Closing the profile (route leave) is the lifecycle boundary for depot
		// emphasis — clear here, not on popup close, so dismissing only the map
		// popup keeps the selected depot highlighted while the profile stays open.
		networkSelection.clear();
		goto(routeBuilders.home());
		onDetailClose?.();
	}

	// "Back" (slim persistent header) returns to the list as it was: restore the
	// pre-detail map viewport and the list scroll position, unlike the plain close
	// (X) which leaves the map where the detail framed it (F12.3).
	function handleDetailBack() {
		if (savedListScrollTop > 0) {
			pendingScrollRestore = true;
		}
		onRestoreDetailView?.();
		handleCloseDetail();
	}

	function handleEditFromDetail() {
		if (!detailData) {
			return;
		}
		if (detailData.properties.type === 'Farm') {
			void goto(routeBuilders.farm.edit(detailData.properties.id));
			return;
		}
		if (detailData.properties.type === 'Initiative') {
			void goto(routeBuilders.initiative.edit(detailData.properties.id));
		}
	}

	async function handleEditorCancel() {
		if (!editorData) {
			return;
		}

		if (editorData.mode === 'create') {
			await goto(routeBuilders.myEntries(), { replaceState: true });
			return;
		}

		if (detailData?.properties.type === 'Farm') {
			await goto(routeBuilders.farm.detail(detailData.properties.id), { replaceState: true });
			return;
		}
		if (detailData?.properties.type === 'Initiative') {
			await goto(routeBuilders.initiative.detail(detailData.properties.id), { replaceState: true });
			return;
		}

		await goto(routeBuilders.home(), { replaceState: true });
	}

	// Both saving an edit and creating a new entry land on the read profile
	// (Feature 9): creation reuses the same section form as editing, so the owner
	// has already filled the whole form — no separate edit-mode refinement step.
	async function handleEditorSaved(savedEntry: MainEntryFeature) {
		if (savedEntry.properties.type === 'Farm') {
			await goto(routeBuilders.farm.detail(savedEntry.properties.id), { replaceState: true });
			return;
		}
		await goto(routeBuilders.initiative.detail(savedEntry.properties.id), { replaceState: true });
	}

	function getDepotReturnFarmId(): string | null {
		return parsedRoute.query.get('farm');
	}

	async function handleDepotEditorCancel() {
		const returnFarmId = getDepotReturnFarmId();
		if (returnFarmId) {
			await goto(routeBuilders.farm.detail(returnFarmId), { replaceState: true });
			return;
		}
		await goto(routeBuilders.myEntries(), { replaceState: true });
	}

	async function handleDepotEditorSaved(savedDepot: DepotFeature) {
		const action = depotEditorData?.mode === 'edit' ? 'updated' : 'created';
		const returnFarmId = getDepotReturnFarmId();
		if (returnFarmId) {
			// Returning to the originating farm profile: no redundant "show farm" action.
			await goto(routeBuilders.farm.detail(returnFarmId), { replaceState: true });
			showDepotMutationToast(action, null);
			return;
		}
		const farmId = getFirstAssociatedFarmId(savedDepot);
		await goto(routeBuilders.myEntries(), { replaceState: true });
		showDepotMutationToast(action, farmId);
	}

	function handleOpenAllEntriesScope() {
		void goto(routeBuilders.home());
	}

	function handleOpenMyEntriesScope() {
		void goto(routeBuilders.myEntries());
	}

	async function handleSearchSuggestionSelect(suggestion: AutocompleteSuggestion) {
		searchValue = '';
		searchSuggestions = [];
		isSearchLoading = false;
		latestSearchRequestId = -1;
		debouncedSuggestionsSearch.cancel();
		// Selecting from a search over an open profile replaces it; drop any depot
		// emphasis from the profile we are leaving (the depot branch re-sets it).
		networkSelection.clear();

		if (suggestion.type === 'location') {
			await goto(routeBuilders.discovery.location(suggestion.id));
			return;
		}

		if (suggestion.type === 'farm') {
			await goto(routeBuilders.farm.detail(suggestion.id));
			return;
		}

		if (suggestion.type === 'initiative') {
			await goto(routeBuilders.initiative.detail(suggestion.id));
			return;
		}

		if (suggestion.type === 'depot') {
			// Emphasize this depot's connection once its owning farm profile resolves.
			networkSelection.selectDepot(suggestion.id);
			await goto(routeBuilders.depotLegacy.detail(suggestion.id));
		}
	}

	function handleCountrySelect(nextCountryCode: string) {
		onCountryChange?.(nextCountryCode);
	}

	function handleStateSelect(nextStateCode: string) {
		onStateChange?.(nextStateCode === ALL_REGIONS_VALUE ? null : nextStateCode);
	}
</script>

<!-- Slim persistent header keeps search reachable from an open profile; selecting
     a result replaces the profile (handleSearchSuggestionSelect navigates). Editors
     and creation forms render no search (F10 focused-task rule). -->
{#snippet detailSearchHeader()}
	<SlimSearchHeader
		bind:searchValue
		bind:searchInputEl
		suggestions={searchSuggestions}
		isLoading={isSearchLoading}
		{showSearchSuggestions}
		onBack={handleDetailBack}
		onSearchSuggestionSelect={handleSearchSuggestionSelect}
		onSearchFocus={handleSearchFocus}
		onSearchBlur={handleSearchBlur}
	/>
{/snippet}

<SidebarShell bind:collapsed mode={shellMode} raiseToFull={isMobile.current && isSearchFocused}>
	{#if isNavigatingToDataRoute}
		<ProfileSkeleton />
	{:else if loadError === 'not-found'}
		{@render detailSearchHeader()}
		<ErrorState
			title={m.errors_not_found_title()}
			description={m.errors_not_found_description()}
			testId="detail-error-state"
		/>
	{:else if loadError}
		{@render detailSearchHeader()}
		<ErrorState onRetry={() => void invalidateAll()} testId="detail-error-state" />
	{:else if showDepotEditor && depotEditorData}
		{#key `${depotEditorData.mode}:${depotDetailData?.properties.id ?? 'new'}:${parsedRoute.query.get('farm') ?? ''}`}
			<DepotEditor
				editorData={depotEditorData}
				entry={depotDetailData}
				presetFarmId={parsedRoute.query.get('farm')}
				onCancel={handleDepotEditorCancel}
				onSaved={handleDepotEditorSaved}
			/>
		{/key}
	{:else if isFarmEditor && editorData}
		{#key `farm-edit:${detailData?.properties.id ?? 'new'}`}
			<FarmProfile
				entry={detailData}
				mode="edit"
				{editorData}
				canEdit={detailData ? ownedMainEntryIds.has(detailData.properties.id) : false}
				{ownedDepotIds}
				onClose={handleCloseDetail}
				onCancel={handleEditorCancel}
				onSaved={handleEditorSaved}
				onDepotSelect={handleDepotSelectFromProfile}
				onDepotEdit={handleDepotEditFromProfile}
				onDepotDelete={handleDepotDeleteFromProfile}
				onAddDepot={handleAddDepotFromProfile}
			/>
		{/key}
	{:else if isInitiativeEditor && editorData}
		{#key `initiative-edit:${detailData?.properties.id ?? 'new'}`}
			<InitiativeProfile
				entry={detailData}
				mode="edit"
				{editorData}
				canEdit={detailData ? ownedMainEntryIds.has(detailData.properties.id) : false}
				onClose={handleCloseDetail}
				onCancel={handleEditorCancel}
				onSaved={handleEditorSaved}
			/>
		{/key}
	{:else if isFarmDetail && detailData}
		{@render detailSearchHeader()}
		{#key `farm:${detailData.properties.id}`}
			<FarmProfile
				entry={detailData}
				mode="read"
				canEdit={ownedMainEntryIds.has(detailData.properties.id)}
				{ownedDepotIds}
				onClose={handleCloseDetail}
				onEdit={handleEditFromDetail}
				onDepotSelect={handleDepotSelectFromProfile}
				onDepotEdit={handleDepotEditFromProfile}
				onDepotDelete={handleDepotDeleteFromProfile}
				onAddDepot={handleAddDepotFromProfile}
			/>
		{/key}
	{:else if isInitiativeDetail && detailData}
		{@render detailSearchHeader()}
		{#key `initiative:${detailData.properties.id}`}
			<InitiativeProfile
				entry={detailData}
				mode="read"
				canEdit={ownedMainEntryIds.has(detailData.properties.id)}
				onClose={handleCloseDetail}
				onEdit={handleEditFromDetail}
			/>
		{/key}
	{:else}
		<MapSidebarHeader
			bind:collapsed
			bind:searchValue
			bind:searchInputEl
			{isUserAuthenticated}
			{isMyEntriesScope}
			{showSearchSuggestions}
			{isSearchLoading}
			{searchSuggestions}
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{stateSelectValue}
			{selectedCountryLabel}
			{selectedStateLabel}
			allRegionsValue={ALL_REGIONS_VALUE}
			onOpenAllEntriesScope={handleOpenAllEntriesScope}
			onOpenMyEntriesScope={handleOpenMyEntriesScope}
			onSearchSuggestionSelect={handleSearchSuggestionSelect}
			onSearchFocus={handleSearchFocus}
			onSearchBlur={handleSearchBlur}
			onCountrySelect={handleCountrySelect}
			onStateSelect={handleStateSelect}
		/>
		{#if !effectiveCollapsed}
			<SidebarScrollArea bind:ref={listScrollEl}>
				{#if isMyEntriesScope}
					<MyEntriesCreateActions onCreate={handleCreateEntry} />
					<MyEntriesList
						features={baseEntries as EntryFeature[]}
						isLoading={isMyEntriesLoading}
						hasError={myEntriesError}
						onRetry={() => void onRefreshMyEntries?.()}
						onEntryClick={(feature) => void handleEntryClick(feature)}
						onEditEntry={handleEditEntry}
						onDeleteEntry={handleDeleteEntry}
						onRowActionTrigger={stopRowActionEvent}
					/>
				{:else}
					<EntriesList
						features={visibleFeatures as EntryFeature[]}
						totalCount={baseEntries.length}
						{hasCappedEntries}
						{isMyEntriesScope}
						isLoading={isMyEntriesLoading}
						onEntryClick={(feature) => void handleEntryClick(feature)}
						onEditEntry={handleEditEntry}
						onDeleteEntry={handleDeleteEntry}
						onRowActionTrigger={stopRowActionEvent}
						{onResetView}
					/>
				{/if}
			</SidebarScrollArea>
		{/if}
	{/if}
</SidebarShell>
