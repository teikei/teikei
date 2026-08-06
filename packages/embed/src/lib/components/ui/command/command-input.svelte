<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { cn, type WithoutChild } from '$lib/utils/tailwind.js';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		wrapperClass,
		...restProps
	}: WithoutChild<CommandPrimitive.InputProps> & { wrapperClass?: string } = $props();
</script>

<div class={cn('flex items-center gap-2 px-3', wrapperClass)} data-slot="command-input-wrapper">
	<SearchIcon class="size-4 shrink-0 text-muted-foreground" />
	<CommandPrimitive.Input
		bind:ref
		bind:value
		data-slot="command-input"
		class={cn(
			'flex h-9 w-full min-w-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...restProps}
	/>
</div>
