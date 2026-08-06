<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/tailwind.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	class={cn('max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
	{...restProps}
>
	<CommandPrimitive.Viewport data-slot="command-viewport">
		{@render children?.()}
	</CommandPrimitive.Viewport>
</CommandPrimitive.List>
