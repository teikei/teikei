<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';

	interface Props {
		id: string;
		label: string;
		type?: string;
		value: string | undefined;
		error?: string | string[];
		labelExtra?: any;
	}

	let { id, label, type = 'text', value = $bindable(''), error, labelExtra }: Props = $props();

	const errorMessage = $derived(Array.isArray(error) ? error.join(', ') : error);
</script>

<Field.Field data-invalid={!!error}>
	{#if labelExtra}
		<div class="flex items-center justify-between">
			<Field.Label for={id}>{label}</Field.Label>
			{@render labelExtra?.()}
		</div>
	{:else}
		<Field.Label for={id}>{label}</Field.Label>
	{/if}
	<Input {id} {type} bind:value />
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
