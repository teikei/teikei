<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type ParagraphSize = 'regular' | 'small';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		size?: ParagraphSize;
		children: Snippet;
	}

	let { size = 'regular', children, class: className, ...restProps }: Props = $props();

	const sizeStyles: Record<ParagraphSize, string> = {
		regular: 'text-foreground',
		small: 'text-sm text-foreground'
	};
</script>

<p class="{sizeStyles[size]} {className ?? ''}" {...restProps}>{@render children()}</p>
