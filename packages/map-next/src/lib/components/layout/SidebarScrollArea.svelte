<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	interface Props {
		/** Bound by callers that read or restore the scroll position. */
		ref?: HTMLElement | null;
		children: Snippet;
	}

	let { ref = $bindable(null), children }: Props = $props();
</script>

<!--
	`relative` makes this the containing block for absolutely positioned
	descendants. Without it they resolve against the positioned sidebar shell
	outside the scroller, so `overflow` never clips them and their scrollable
	overflow escapes to the document — a long editor form's `sr-only` fieldset
	legends made the whole page scrollable and scrolled the map out of the viewport.
-->
<Sidebar.Content bind:ref class="relative overflow-y-auto">
	{@render children()}
</Sidebar.Content>
