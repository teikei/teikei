<script lang="ts">
	import { CircleAlert } from '@lucide/svelte';
	import { AppButton } from '$lib/components/actions';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		/** Defaults to the generic "could not load" copy. */
		title?: string;
		description?: string;
		/** Renders a retry button when set. */
		onRetry?: () => void;
		testId?: string;
	}

	let {
		title = m.errors_load_failed_title(),
		description = m.errors_load_failed_description(),
		onRetry,
		testId = 'error-state'
	}: Props = $props();
</script>

<div class="flex flex-col items-center gap-2 px-4 py-8 text-center" data-testid={testId}>
	<div class="flex size-10 items-center justify-center rounded-full bg-destructive/10">
		<CircleAlert class="size-5 text-destructive" aria-hidden="true" />
	</div>
	<p class="text-sm font-medium text-foreground">{title}</p>
	<p class="text-sm text-muted-foreground">{description}</p>
	{#if onRetry}
		<AppButton type="button" variant="outline" data-testid="error-state-retry" onclick={onRetry}>
			{m.errors_retry()}
		</AppButton>
	{/if}
</div>
