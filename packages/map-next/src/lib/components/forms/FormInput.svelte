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
	import { Eye, EyeOff } from '@lucide/svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { translateErrors } from '$lib/utils/translate-error';
	import * as m from '$lib/paraglide/messages.js';

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

	// Password fields get a show/hide toggle (password-manager users excepted,
	// typos in masked fields are the top sign-in failure).
	let passwordVisible = $state(false);
	const isPasswordField = $derived(type === 'password');
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
	{#if isPasswordField}
		<InputGroup.Root>
			<InputGroup.Input
				{id}
				type={passwordVisible ? 'text' : 'password'}
				bind:value
				aria-required={required || undefined}
				aria-invalid={!!error || undefined}
				{...inputProps}
			/>
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					size="icon-xs"
					aria-label={passwordVisible ? m.user_form_hide_password() : m.user_form_show_password()}
					aria-pressed={passwordVisible}
					data-testid="password-visibility-toggle"
					onclick={() => (passwordVisible = !passwordVisible)}
				>
					{#if passwordVisible}
						<EyeOff aria-hidden="true" />
					{:else}
						<Eye aria-hidden="true" />
					{/if}
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
	{:else}
		<Input
			{id}
			{type}
			bind:value
			aria-required={required || undefined}
			aria-invalid={!!error || undefined}
			{...inputProps}
		/>
	{/if}
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
