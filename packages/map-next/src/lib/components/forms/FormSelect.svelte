<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import * as Select from '$lib/components/ui/select';
	import { translateErrors } from '$lib/utils/translate-error';

	interface SelectOption {
		value: string;
		label: string;
	}

	interface Props {
		id: string;
		label: string;
		options: SelectOption[];
		value?: string;
		placeholder?: string;
		description?: string;
		error?: string | string[];
	}

	let {
		id,
		label,
		options,
		value = $bindable(),
		placeholder = 'Select...',
		description,
		error
	}: Props = $props();

	const errorMessage = $derived(translateErrors(error));
	const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);
</script>

<Field.Field data-invalid={!!error}>
	<Field.Label for={id}>{label}</Field.Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger {id}>
			{selectedLabel}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each options as option (option.value)}
					<Select.Item value={option.value} label={option.label} />
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
	{#if description}
		<Field.Description>{description}</Field.Description>
	{/if}
	<Field.Error>{errorMessage}</Field.Error>
</Field.Field>
