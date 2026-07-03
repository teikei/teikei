<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/tailwind.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.LoadingProps = $props();
</script>

<CommandPrimitive.Loading
	bind:ref
	data-slot="command-loading"
	class={cn('py-6 text-center text-sm text-muted-foreground', className)}
	{...restProps}
/>
