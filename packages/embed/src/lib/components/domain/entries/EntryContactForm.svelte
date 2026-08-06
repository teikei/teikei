<script lang="ts">
	import { AppButton } from '$lib/components/actions';
	import * as Alert from '$lib/components/ui/alert';
	import { Spinner } from '$lib/components/ui/spinner';
	import { FormInput, FormTextarea } from '$lib/components/forms';
	import { Heading } from '$lib/components/typography';
	import { sendEntryContactMessage } from '$lib/api/entry-contact';
	import type { MainEntryType } from '$lib/types/entries';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';

	interface EntryContactFormProps {
		entryId: string;
		entryType: MainEntryType;
		/** Prefill the sender fields (e.g. from the authenticated session); stays editable. */
		initialName?: string;
		initialEmail?: string;
		/**
		 * Called after a message is sent successfully. When provided, the parent owns
		 * the success feedback (toast + navigation) and no inline success alert renders.
		 */
		onSent?: () => void;
	}

	let {
		entryId,
		entryType,
		initialName = '',
		initialEmail = '',
		onSent
	}: EntryContactFormProps = $props();

	// Prefilled from props (session) but freely editable afterwards; the component is
	// remounted per contact view so initialising state directly from props is safe.
	// svelte-ignore state_referenced_locally
	let senderName = $state(initialName);
	// svelte-ignore state_referenced_locally
	let senderEmail = $state(initialEmail);
	let messageText = $state('');
	let isSubmitting = $state(false);
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

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
			messageText = '';
			if (onSent) {
				// Parent handles success feedback (toast) and returns to the profile.
				onSent();
			} else {
				successMessage = m.entry_contact_success();
			}
		} catch (error) {
			errorMessage = resolveApiErrorMessage(error, m.entry_contact_error());
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col gap-3" data-testid="entry-contact-form">
	<Heading level={5}>{m.entry_contact_title()}</Heading>

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

	<form class="flex flex-col gap-3" onsubmit={handleSubmit}>
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
		<FormTextarea
			id="entry-contact-message"
			data-testid="entry-contact-message"
			label={m.entry_contact_message()}
			bind:value={messageText}
		/>
		<div class="flex justify-end">
			<AppButton type="submit" disabled={isSubmitting} data-testid="entry-contact-submit">
				{#if isSubmitting}
					<Spinner data-icon="inline-start" />
				{/if}
				{isSubmitting ? m.entry_contact_sending() : m.entry_contact_submit()}
			</AppButton>
		</div>
	</form>
</div>
