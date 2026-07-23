<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/tailwind';

	type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level: HeadingLevel;
		children: Snippet;
	}

	let { level, children, class: className, ...restProps }: Props = $props();

	const levelStyles: Record<HeadingLevel, string> = {
		1: 'text-4xl font-bold text-primary',
		2: 'text-2xl font-semibold text-primary',
		3: 'text-xl font-semibold text-primary',
		4: 'text-lg font-semibold text-primary',
		5: 'text-lg font-semibold text-primary',
		6: 'text-base font-medium text-primary'
	};
</script>

<svelte:element this={`h${level}`} class={cn(levelStyles[level], className)} {...restProps}>
	{@render children()}
</svelte:element>
