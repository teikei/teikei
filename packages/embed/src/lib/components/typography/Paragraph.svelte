<script lang="ts" module>
	import { cn } from '$lib/utils/tailwind.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { Snippet } from 'svelte';

	export const paragraphVariants = tv({
		base: '',
		variants: {
			size: {
				regular: '',
				small: 'text-sm'
			},
			muted: {
				true: 'text-muted-foreground',
				false: 'text-foreground'
			},
			strong: {
				true: 'text-secondary-foreground font-bold',
				false: ''
			}
		},
		defaultVariants: {
			size: 'regular',
			muted: false,
			strong: false
		}
	});

	export type ParagraphSize = VariantProps<typeof paragraphVariants>['size'];

	export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
		size?: ParagraphSize;
		muted?: boolean;
		strong?: boolean;
		children: Snippet;
	}
</script>

<script lang="ts">
	let {
		size = 'regular',
		muted = false,
		strong = false,
		children,
		class: className,
		...restProps
	}: ParagraphProps = $props();
</script>

<p class={cn(paragraphVariants({ size, muted, strong }), className)} {...restProps}>
	{@render children()}
</p>
