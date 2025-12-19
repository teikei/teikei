import SearchWidget from '$lib/components/page/SearchWidget.svelte';
import { mount, unmount } from 'svelte';
import type { SearchWidgetProps } from '$lib/components/page/SearchWidget.svelte';

export interface WidgetInstance {
	destroy: () => void;
}

function parseDataProps(element: HTMLElement): Partial<SearchWidgetProps> {
	const props: Partial<SearchWidgetProps> = {};

	if (element.dataset.placeholder) {
		props.placeholder = element.dataset.placeholder;
	}

	if (element.dataset.apiBaseUrl) {
		props.apiBaseUrl = element.dataset.apiBaseUrl;
	}

	return props;
}

export function init(target: HTMLElement): WidgetInstance {
	const props = parseDataProps(target);
	const component = mount(SearchWidget, { target, props });

	return {
		destroy: () => {
			unmount(component);
		}
	};
}
