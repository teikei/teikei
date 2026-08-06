<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	export type FormTextareaProps = Omit<HTMLTextareaAttributes, 'id' | 'value'> & {
		id: string;
		label: string;
		/** Keep the label for screen readers only (e.g. when a section heading already names the field). */
		hideLabel?: boolean;
		value?: string;
		error?: string | string[];
		description?: string;
		labelExtra?: Snippet;
	};
</script>

<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Textarea } from '$lib/components/ui/textarea';
	import { translateErrors } from '$lib/utils/translate-error';

	let {
		id,
		label,
		hideLabel = false,
		value = $bindable(),
		error,
		description,
		labelExtra,
		rows = 4,
		...textareaProps
	}: FormTextareaProps = $props();

	const errorMessage = $derived(translateErrors(error));
</script>

<Field.Field data-invalid={!!error}>
	{#if labelExtra}
		<div class="flex items-center justify-between">
			<Field.Label for={id} class={hideLabel ? 'sr-only' : undefined}>{label}</Field.Label>
			{@render labelExtra?.()}
		</div>
	{:else}
		<Field.Label for={id} class={hideLabel ? 'sr-only' : undefined}>{label}</Field.Label>
	{/if}
	<Textarea {id} bind:value {rows} aria-invalid={!!error || undefined} {...textareaProps} />
	{#if description}
		<Field.Description>{description}</Field.Description>
	{/if}
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
