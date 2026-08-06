<script lang="ts" module>
	export interface MultiSelectOption {
		value: string;
		label: string;
	}

	export interface MultiSelectComboboxProps {
		/** Id for the text input, so an external `<label>` can point at it. */
		id?: string;
		/** All selectable options. */
		options: MultiSelectOption[];
		/** Selected option values (bindable). */
		value?: string[];
		/** Placeholder shown in the text input when nothing is typed. */
		placeholder?: string;
		/** Message shown when the typeahead matches no remaining option. */
		emptyText?: string;
		/** Accessible label prefix for a chip's remove control (e.g. "Entfernen"). */
		removeLabel?: string;
		disabled?: boolean;
		/** Marks the control invalid (destructive border, `aria-invalid`). */
		invalid?: boolean;
		'data-testid'?: string;
	}
</script>

<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import * as Command from '$lib/components/ui/command';
	import { Badge } from '$lib/components/ui/badge';
	import XIcon from '@lucide/svelte/icons/x';
	import { cn } from '$lib/utils/tailwind.js';

	let {
		id,
		options,
		value = $bindable([]),
		placeholder,
		emptyText,
		removeLabel,
		disabled = false,
		invalid = false,
		'data-testid': testId
	}: MultiSelectComboboxProps = $props();

	let search = $state('');
	let open = $state(false);
	let wrapperEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);

	const selectedOptions = $derived(
		value
			.map((selected) => options.find((option) => option.value === selected))
			.filter((option): option is MultiSelectOption => option !== undefined)
	);
	// Selected values become chips, so they drop out of the typeahead list.
	const availableOptions = $derived(options.filter((option) => !value.includes(option.value)));

	function select(optionValue: string) {
		if (!value.includes(optionValue)) {
			value = [...value, optionValue];
		}
		search = '';
		inputEl?.focus();
	}

	function remove(optionValue: string) {
		value = value.filter((selected) => selected !== optionValue);
		inputEl?.focus();
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Backspace' && search === '' && selectedOptions.length > 0) {
			// Empty input + Backspace removes the last visible chip (legacy-app
			// parity). Target the last rendered chip rather than the raw last id so
			// an unresolved/stale id in `value` can't hide the removal.
			remove(selectedOptions[selectedOptions.length - 1].value);
		} else if (event.key === 'Escape') {
			open = false;
		}
	}

	function handleFocusOut(event: FocusEvent) {
		// Only close once focus actually leaves the whole control (selecting an
		// option keeps focus on the input via the list's pointerdown guard).
		if (wrapperEl && !wrapperEl.contains(event.relatedTarget as Node | null)) {
			open = false;
		}
	}
</script>

<CommandPrimitive.Root class="w-full">
	<div
		bind:this={wrapperEl}
		data-slot="multi-select"
		class={cn(
			'relative flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-input/50 p-1.5 text-sm transition-[color,box-shadow,background-color]',
			'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30',
			invalid &&
				'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
			disabled && 'pointer-events-none opacity-50'
		)}
		onfocusin={() => (open = true)}
		onfocusout={handleFocusOut}
	>
		{#each selectedOptions as option (option.value)}
			<Badge variant="secondary" class="gap-1 pr-1">
				{option.label}
				<button
					type="button"
					tabindex={-1}
					class="flex items-center justify-center rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
					aria-label={removeLabel ? `${removeLabel}: ${option.label}` : undefined}
					onclick={() => remove(option.value)}
				>
					<XIcon class="size-3" />
				</button>
			</Badge>
		{/each}

		<CommandPrimitive.Input
			bind:ref={inputEl}
			bind:value={search}
			{id}
			{placeholder}
			{disabled}
			data-testid={testId}
			aria-invalid={invalid || undefined}
			class="h-6 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
			onkeydown={handleInputKeydown}
		/>

		{#if open}
			<div
				class="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5"
			>
				<Command.List class="max-h-56">
					<Command.Empty>{emptyText}</Command.Empty>
					<!--
						Items are non-focusable `<div role="option">`; without preventing the
						pointer default, pressing one blurs the input and `handleFocusOut`
						unmounts this list before the click can select. preventDefault keeps
						focus on the input so `onSelect` fires.
					-->
					{#each availableOptions as option (option.value)}
						<Command.Item
							value={option.value}
							keywords={[option.label]}
							onSelect={() => select(option.value)}
							onpointerdown={(event) => event.preventDefault()}
						>
							{option.label}
						</Command.Item>
					{/each}
				</Command.List>
			</div>
		{/if}
	</div>
</CommandPrimitive.Root>
