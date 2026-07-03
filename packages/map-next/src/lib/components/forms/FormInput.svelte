<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';

	type FormInputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	export type FormInputProps = Omit<
		HTMLInputAttributes,
		'files' | 'id' | 'type' | 'value' | 'required'
	> & {
		id: string;
		label: string;
		type?: FormInputType;
		value?: string;
		error?: string | string[];
		/** Marks the field as required: appends a visible "*" to the label and sets `aria-required`. */
		required?: boolean;
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
		required = false,
		labelExtra,
		...inputProps
	}: FormInputProps = $props();

	const errorMessage = $derived(translateErrors(error));
</script>

{#snippet fieldLabel()}
	<Field.Label for={id}
		>{label}{#if required}<span aria-hidden="true"> *</span>{/if}</Field.Label
	>
{/snippet}

<Field.Field data-invalid={!!error}>
	{#if labelExtra}
		<div class="flex items-center justify-between">
			{@render fieldLabel()}
			{@render labelExtra?.()}
		</div>
	{:else}
		{@render fieldLabel()}
	{/if}
	<Input
		{id}
		{type}
		bind:value
		aria-required={required || undefined}
		aria-invalid={!!error || undefined}
		{...inputProps}
	/>
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
