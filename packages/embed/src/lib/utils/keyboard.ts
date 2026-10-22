function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** `/` and ⌘K/Ctrl+K focus the search, except a literal "/" typed into a field. */
export function isSearchShortcut(event: KeyboardEvent): boolean {
	const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
	const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
	return isCmdK || (isSlash && !isEditableTarget(event.target));
}
