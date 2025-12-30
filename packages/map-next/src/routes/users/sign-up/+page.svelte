<script lang="ts">
	import { page } from '$app/state';
	import { signUp } from '$lib/api/auth';
	import config from '$lib/config/app-configuration';
	import { Heading, Paragraph } from '$lib/components/shared';
	import { TwoColumnLayout } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import SignUpForm from './SignUpForm.svelte';
	import type { SignUpFormData } from './schema';
	import { isRedirect } from '$lib/utils/redirect';

	let isLoading = $state(false);
	let signUpSuccess = $state(false);
	let error = $state<string | null>(null);

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
</script>

<TwoColumnLayout>
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
