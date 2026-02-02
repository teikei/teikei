<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signUp } from '$lib/api/auth';
	import config from '$lib/config/app-configuration';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/two-column-layout.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages.js';
	import SignUpForm from './SignUpForm.svelte';
	import type { SignUpFormData } from './schema';
	import { isRedirect } from '$lib/utils/redirect';

	let isLoading = $state(false);
	let signUpSuccess = $state(false);
	let error = $state<string | null>(null);

	// Dialog is open when we're on this route
	let open = $state(true);

	async function handleSubmit(values: SignUpFormData) {
		isLoading = true;
		error = null;

		try {
			const response = await signUp({
				email: values.email,
				password: values.password,
				name: values.name,
				phone: values.phone || '',
				baseurl: config.baseUrl,
				locale: config.userCommunicationLocale
			});

			if (response.type === 'User' || response.id) {
				signUpSuccess = true;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_sign_up_failed();
		} finally {
			isLoading = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			goto('#/');
		}
		open = newOpen;
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-h-[90vh] w-[90vw] max-w-4xl overflow-hidden p-0">
		<Dialog.Title class="sr-only">{m.user_form_sign_up_title()}</Dialog.Title>
		<TwoColumnLayout class="h-full max-h-[90vh] min-h-150 overflow-y-auto">
			{#snippet leftColumn()}
				<div class="space-y-8">
					<Heading level={2}>{m.user_onboarding_title()}</Heading>
					<Paragraph>
						{#if isRedirect(page)}
							{m.user_onboarding_protected_view_info()}
						{:else}
							{m.user_onboarding_intro()}
						{/if}
					</Paragraph>
				</div>
			{/snippet}

			{#snippet rightColumn()}
				<SignUpForm onSubmit={handleSubmit} {signUpSuccess} {isLoading} {error} />
			{/snippet}
		</TwoColumnLayout>
	</Dialog.Content>
</Dialog.Root>
