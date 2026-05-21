<script lang="ts" module>
	import type { ButtonProps as PrimitiveButtonProps } from '$lib/components/ui/button';

	export type IconButtonVariant = 'default' | 'outline';

	export type IconButtonProps = Omit<PrimitiveButtonProps, 'variant' | 'size' | 'aria-label'> & {
		label: string;
		variant?: IconButtonVariant;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { label, variant = 'outline', children, ...restProps }: IconButtonProps = $props();
</script>

<Button {variant} size="icon" {...restProps} aria-label={label}>
	{@render children?.()}
	<span class="sr-only">{label}</span>
</Button>
