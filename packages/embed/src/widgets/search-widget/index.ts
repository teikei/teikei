import SearchWidget from './search-widget.svelte';
import '../../routes/layout.css';
import { mount, unmount } from 'svelte';
import type { SearchWidgetProps } from './search-widget.svelte';

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

export function start(target: HTMLElement): WidgetInstance {
	const props = parseDataProps(target);
	const component = mount(SearchWidget, { target, props });

	return {
		destroy: () => {
			unmount(component);
		}
	};
}
