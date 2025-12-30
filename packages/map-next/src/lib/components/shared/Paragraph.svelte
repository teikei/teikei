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
			}
		},
		defaultVariants: {
			size: 'regular',
			muted: false
		}
	});

	export type ParagraphSize = VariantProps<typeof paragraphVariants>['size'];

	export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
		size?: ParagraphSize;
		muted?: boolean;
		children: Snippet;
	}
</script>

<script lang="ts">
	let {
		size = 'regular',
		muted = false,
		children,
		class: className,
		...restProps
	}: ParagraphProps = $props();
</script>

<p class={cn(paragraphVariants({ size, muted }), className)} {...restProps}>{@render children()}</p>
