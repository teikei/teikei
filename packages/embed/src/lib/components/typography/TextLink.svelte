<script lang="ts" module>
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	export type TextLinkVariant = 'default' | 'muted';

	export type TextLinkProps = HTMLAnchorAttributes & {
		variant?: TextLinkVariant;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils/tailwind';

	let { variant = 'default', class: className, children, ...restProps }: TextLinkProps = $props();

	const variantStyles: Record<TextLinkVariant, string> = {
		default: 'text-primary underline hover:no-underline',
		muted: 'text-muted-foreground hover:text-primary'
	};
</script>

<a class={cn(variantStyles[variant], className)} {...restProps}>
	{@render children?.()}
</a>
