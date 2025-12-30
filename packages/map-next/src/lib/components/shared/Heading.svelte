<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level: HeadingLevel;
		children: Snippet;
	}

	let { level, children, class: className, ...restProps }: Props = $props();

	const levelStyles: Record<HeadingLevel, string> = {
		1: 'text-4xl font-bold',
		2: 'text-2xl font-semibold',
		3: 'text-xl font-semibold',
		4: 'text-lg font-semibold',
		5: 'text-base font-semibold',
		6: 'text-sm font-semibold'
	};
</script>

{#if level === 1}
	<h1 class="{levelStyles[1]} {className ?? ''}" {...restProps}>{@render children()}</h1>
{:else if level === 2}
	<h2 class="{levelStyles[2]} {className ?? ''}" {...restProps}>{@render children()}</h2>
{:else if level === 3}
	<h3 class="{levelStyles[3]} {className ?? ''}" {...restProps}>{@render children()}</h3>
{:else if level === 4}
	<h4 class="{levelStyles[4]} {className ?? ''}" {...restProps}>{@render children()}</h4>
{:else if level === 5}
	<h5 class="{levelStyles[5]} {className ?? ''}" {...restProps}>{@render children()}</h5>
{:else}
	<h6 class="{levelStyles[6]} {className ?? ''}" {...restProps}>{@render children()}</h6>
{/if}
