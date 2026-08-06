<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AppButton, type AppButtonProps } from '$lib/components/actions';
	import { Spinner } from '$lib/components/ui/spinner';

	type Props = Omit<AppButtonProps, 'type' | 'disabled' | 'children'> & {
		/** Disables the button and shows a spinner while the submission runs. */
		isLoading?: boolean;
		/** Label shown while loading; defaults to the regular label. */
		loadingLabel?: string;
		children: Snippet;
	};

	let { isLoading = false, loadingLabel, children, ...restProps }: Props = $props();
</script>

<AppButton type="submit" disabled={isLoading} {...restProps}>
	{#if isLoading}
		<Spinner data-icon="inline-start" />
		{#if loadingLabel}{loadingLabel}{:else}{@render children()}{/if}
	{:else}
		{@render children()}
	{/if}
</AppButton>
