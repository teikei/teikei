<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';

	interface Props {
		/** Already-localized prose. Not a message key — it is rendered verbatim. */
		error?: string | undefined;
	}

	let { error }: Props = $props();
</script>

{#if error}
	<Alert.Root variant="destructive">
		<AlertCircleIcon />
		<Alert.Title>{error}</Alert.Title>
	</Alert.Root>
{/if}
