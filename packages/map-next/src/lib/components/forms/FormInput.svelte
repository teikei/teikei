<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';

	type FormInputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	export type FormInputProps = Omit<HTMLInputAttributes, 'files' | 'id' | 'type' | 'value'> & {
		id: string;
		label: string;
		type?: FormInputType;
		value?: string;
		error?: string | string[];
		labelExtra?: Snippet;
	};
</script>

<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { translateErrors } from '$lib/utils/translate-error';

	let {
		id,
		label,
		type = 'text',
		value = $bindable(),
		error,
		labelExtra,
		...inputProps
	}: FormInputProps = $props();

	const errorMessage = $derived(translateErrors(error));
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
	<Input {id} {type} bind:value aria-invalid={!!error || undefined} {...inputProps} />
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
