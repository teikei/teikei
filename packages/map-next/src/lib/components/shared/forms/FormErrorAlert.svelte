<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import { translateErrorsToArray } from '$lib/utils/translate-error';

	interface Props {
		error?: string | undefined;
	}

	let { error }: Props = $props();

	const translatedErrors = $derived(error ? translateErrorsToArray(error) : []);
</script>

{#if error}
	<Alert.Root variant="destructive">
		<AlertCircleIcon />
		<Alert.Title>
			{#each translatedErrors as message (message)}
				{message}
			{/each}
		</Alert.Title>
	</Alert.Root>
{/if}
