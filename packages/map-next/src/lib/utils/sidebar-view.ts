import type { DepotEditorData, EntryEditorData } from '$lib/types/editor';
import type { MainEntryFeature } from '$lib/types/entries';
import type { LoadErrorKind } from '$lib/utils/load-error';

// Routes whose loaders fetch remote data before rendering; navigating to one
// shows a profile skeleton in the drawer instead of the frozen previous view.
const DATA_ROUTE_IDS = new Set([
	'/farms/[id]',
	'/farms/[id]/edit',
	'/farms/[id]/contact',
	'/farms/new',
	'/initiatives/[id]',
	'/initiatives/[id]/edit',
	'/initiatives/[id]/contact',
	'/initiatives/new',
	'/depots/[id]/edit',
	'/depots/new',
	'/locations/[id]'
]);

/** The route data the sidebar's view mode depends on: `page.data` plus the pending navigation target. */
export interface SidebarViewInput {
	detailData?: MainEntryFeature;
	contactData?: MainEntryFeature;
	editorData?: EntryEditorData;
	depotEditorData?: DepotEditorData;
	loadError?: LoadErrorKind;
	navigatingToRouteId?: string | null;
}

export interface SidebarView {
	showDetail: boolean;
	showContact: boolean;
	showEditor: boolean;
	showDepotEditor: boolean;
	isNonListMode: boolean;
	isEditorMode: boolean;
	isTaskLevel: boolean;
	isFarmEditor: boolean;
	isFarmDetail: boolean;
	isInitiativeEditor: boolean;
	isInitiativeDetail: boolean;
	isNavigatingToDataRoute: boolean;
	shellMode: 'list' | 'detail' | 'task' | 'editor';
	focusedEntry: MainEntryFeature | undefined;
}

/** Resolves which of the sidebar's template branches is active, and how the shell should present it. */
export function resolveSidebarView({
	detailData,
	contactData,
	editorData,
	depotEditorData,
	loadError,
	navigatingToRouteId
}: SidebarViewInput): SidebarView {
	const showDetail = !!detailData;
	const showContact = !!contactData;
	const showEditor = !!editorData;
	const showDepotEditor = !!depotEditorData;
	const isEditorMode = showEditor || showDepotEditor;

	return {
		showDetail,
		showContact,
		showEditor,
		showDepotEditor,
		isNonListMode: showDetail || showContact || showEditor || showDepotEditor,
		isEditorMode,
		// Task levels (editors and the contact form) are focused tasks, not browse
		// levels: no search header, mobile sheet at full, collapse forbidden.
		isTaskLevel: isEditorMode || showContact,
		// Profile inline edit (Feature 4 & 9): farms and initiatives render their
		// section-based FarmProfile/InitiativeProfile for read, edit, and create.
		// Creation is the same section form as editing with no existing entry to
		// hydrate — the standalone 3-step creation wizard was removed (Feature 9).
		isFarmEditor: showEditor && editorData?.entryType === 'Farm',
		isFarmDetail: showDetail && !showEditor && detailData?.properties.type === 'Farm',
		isInitiativeEditor: showEditor && editorData?.entryType === 'Initiative',
		isInitiativeDetail: showDetail && !showEditor && detailData?.properties.type === 'Initiative',
		isNavigatingToDataRoute: DATA_ROUTE_IDS.has(navigatingToRouteId ?? ''),
		// A failed load counts as 'detail' so the shell expands (mobile sheet rises
		// from peek, desktop card uncollapses) and the error state is actually
		// visible instead of clipped inside the peek-height sheet.
		shellMode: isEditorMode
			? 'editor'
			: showContact
				? 'task'
				: showDetail || loadError
					? 'detail'
					: 'list',
		// The contact route frames its entry exactly like the detail route, so a deep
		// link into contact focuses the map the same way (and detail↔contact for the
		// same entry keeps the camera put).
		focusedEntry: detailData ?? contactData
	};
}
