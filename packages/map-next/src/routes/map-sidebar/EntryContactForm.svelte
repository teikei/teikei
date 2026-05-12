<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import * as Field from '$lib/components/ui/field';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { sendEntryContactMessage } from '$lib/api/entry-contact';
	import type { MainEntryType } from '$lib/types/entries';
	import * as m from '$lib/paraglide/messages.js';

	interface EntryContactFormProps {
		entryId: string;
		entryType: MainEntryType;
	}

	let { entryId, entryType }: EntryContactFormProps = $props();

	let senderName = $state('');
	let senderEmail = $state('');
	let messageText = $state('');
	let isSubmitting = $state(false);
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);
	let lastEntryKey = $state('');

	$effect(() => {
		const nextEntryKey = `${entryType}:${entryId}`;
		if (nextEntryKey === lastEntryKey) {
			return;
		}

		lastEntryKey = nextEntryKey;
		senderName = '';
		senderEmail = '';
		messageText = '';
		successMessage = null;
		errorMessage = null;
		isSubmitting = false;
	});

	function validateForm(): string | null {
		if (!senderName.trim() || !senderEmail.trim() || !messageText.trim()) {
			return m.forms_validation_required();
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(senderEmail.trim())) {
			return m.forms_validation_email();
		}

		return null;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (isSubmitting) {
			return;
		}

		const validationError = validateForm();
		if (validationError) {
			errorMessage = validationError;
			successMessage = null;
			return;
		}

		isSubmitting = true;
		errorMessage = null;
		successMessage = null;

		try {
			await sendEntryContactMessage({
				id: entryId,
				type: entryType,
				senderName: senderName.trim(),
				senderEmail: senderEmail.trim(),
				text: messageText.trim()
			});
			successMessage = m.entry_contact_success();
			messageText = '';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : m.entry_contact_error();
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-3" data-testid="entry-contact-form">
	<h3 class="text-sm font-semibold">{m.entry_contact_title()}</h3>

	{#if successMessage}
		<Alert.Root
			class="border-success-border bg-success-muted text-success-foreground"
			data-testid="entry-contact-success"
		>
			<Alert.Description>{successMessage}</Alert.Description>
		</Alert.Root>
	{/if}

	{#if errorMessage}
		<Alert.Root variant="destructive" data-testid="entry-contact-error">
			<Alert.Description>{errorMessage}</Alert.Description>
		</Alert.Root>
	{/if}

	<form class="space-y-3" onsubmit={handleSubmit}>
		<FormInput
			id="entry-contact-sender-name"
			label={m.entry_contact_name()}
			bind:value={senderName}
		/>
		<FormInput
			id="entry-contact-sender-email"
			label={m.entry_contact_email()}
			type="email"
			bind:value={senderEmail}
		/>
		<Field.Field>
			<Field.Label for="entry-contact-message">{m.entry_contact_message()}</Field.Label>
			<textarea
				id="entry-contact-message"
				data-testid="entry-contact-message"
				class="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
				bind:value={messageText}
			></textarea>
		</Field.Field>
		<div class="flex justify-end">
			<Button type="submit" disabled={isSubmitting} data-testid="entry-contact-submit">
				{isSubmitting ? m.entry_contact_sending() : m.entry_contact_submit()}
			</Button>
		</div>
	</form>
</div>
