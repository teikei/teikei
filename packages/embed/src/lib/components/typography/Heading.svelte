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
		1: 'font-heading text-2xl font-bold text-primary',
		2: 'font-heading text-2xl font-semibold text-primary',
		3: 'font-heading text-2xl font-semibold text-primary',
		4: 'font-heading text-xl font-semibold text-primary',
		5: 'font-heading text-lg font-semibold text-primary',
		6: 'font-heading text-sm font-semibold text-muted-foreground'
	};
</script>

<svelte:element this={`h${level}`} class={cn(levelStyles[level], className)} {...restProps}>
	{@render children()}
</svelte:element>
