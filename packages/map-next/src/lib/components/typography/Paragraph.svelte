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
			/**
			 * Serif accent for editorial long-form content — the "voice" of a farm
			 * or initiative talking about itself (profile descriptions, onboarding
			 * intros). Never use it for controls, labels, or list cards.
			 */
			serif: {
				true: 'font-serif leading-relaxed',
				false: ''
			}
		},
		defaultVariants: {
			size: 'regular',
			muted: false,
			serif: false
		}
	});

	export type ParagraphSize = VariantProps<typeof paragraphVariants>['size'];

	export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
		size?: ParagraphSize;
		muted?: boolean;
		serif?: boolean;
		children: Snippet;
	}
</script>

<script lang="ts">
	let {
		size = 'regular',
		muted = false,
		serif = false,
		children,
		class: className,
		...restProps
	}: ParagraphProps = $props();
</script>

<p class={cn(paragraphVariants({ size, muted, serif }), className)} {...restProps}>
	{@render children()}
</p>
