<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import XIcon from '@lucide/svelte/icons/x';
	import * as Alert from '$lib/components/ui/alert';
	import { IconButton } from '$lib/components/actions';
	import { cn } from '$lib/utils/tailwind.js';
	import * as m from '$lib/paraglide/messages.js';

	type Props = HTMLAttributes<HTMLDivElement> & {
		status: 'success' | 'error';
		/** Already-localized prose, rendered verbatim. */
		message: string;
		ondismiss: () => void;
	};

	let { status, message, ondismiss, ...restProps }: Props = $props();
</script>

<!-- Floats over the map, so it sits on the elevated card surface (shadow-md) and
     carries the status through the icon instead of a tinted border/fill. -->
<Alert.Root
	variant={status === 'error' ? 'destructive' : 'default'}
	class={cn('py-4 shadow-md', status === 'success' && '*:[svg]:text-success')}
	{...restProps}
>
	{#if status === 'success'}
		<CircleCheckIcon />
	{:else}
		<AlertCircleIcon />
	{/if}
	<Alert.Title>{message}</Alert.Title>
	<Alert.Action class="top-1/2 -translate-y-1/2 text-foreground">
		<IconButton label={m.map_token_feedback_dismiss()} onclick={ondismiss}>
			<XIcon />
		</IconButton>
	</Alert.Action>
</Alert.Root>
