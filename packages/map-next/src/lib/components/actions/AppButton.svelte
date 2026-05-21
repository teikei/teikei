<script lang="ts" module>
	import type { ButtonProps as PrimitiveButtonProps } from '$lib/components/ui/button';

	export type AppButtonVariant = 'default' | 'outline';

	export type AppButtonProps = Omit<PrimitiveButtonProps, 'variant' | 'size'> & {
		variant?: AppButtonVariant;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { variant = 'default', children, ...restProps }: AppButtonProps = $props();
</script>

<Button {variant} size="default" {...restProps}>
	{@render children?.()}
</Button>
