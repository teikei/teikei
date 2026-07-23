<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	// The one profile chip look (products, initiative goals, membership status):
	// filled tag on the nested rounded-md tier (DESIGN.md), the tint carries the
	// semantic — food category or success/warning/destructive status.
	export const chipVariants = tv({
		base: 'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium [&>svg]:size-3.5 [&>svg]:shrink-0',
		variants: {
			tint: {
				food: 'bg-chip-food text-chip-food-foreground',
				success: 'bg-success-muted text-success-foreground',
				warning: 'bg-warning/15 text-warning',
				destructive: 'bg-destructive/10 text-destructive'
			}
		},
		defaultVariants: {
			tint: 'success'
		}
	});

	export type ChipTint = VariantProps<typeof chipVariants>['tint'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils/tailwind.js';

	let {
		ref = $bindable(null),
		class: className,
		tint = 'success',
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		tint?: ChipTint;
	} = $props();
</script>

<span bind:this={ref} data-slot="chip" class={cn(chipVariants({ tint }), className)} {...restProps}>
	{@render children?.()}
</span>
