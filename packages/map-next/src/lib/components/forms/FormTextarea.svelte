<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	export type FormTextareaProps = Omit<HTMLTextareaAttributes, 'id' | 'value'> & {
		id: string;
		label: string;
		value?: string;
		error?: string | string[];
		description?: string;
		labelExtra?: Snippet;
	};
</script>

<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { cn } from '$lib/utils/tailwind';
	import { translateErrors } from '$lib/utils/translate-error';

	let {
		id,
		label,
		value = $bindable(),
		error,
		description,
		labelExtra,
		rows = 4,
		class: className,
		...textareaProps
	}: FormTextareaProps = $props();

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
	<textarea
		{id}
		bind:value
		{rows}
		aria-invalid={!!error || undefined}
		class={cn(
			'flex min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
			'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
			'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
			className
		)}
		{...textareaProps}
	></textarea>
	{#if description}
		<Field.Description>{description}</Field.Description>
	{/if}
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
