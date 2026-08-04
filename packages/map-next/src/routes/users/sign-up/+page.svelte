<script lang="ts">
	import { page } from '$app/state';
	import { signUp } from '$lib/api/auth';
	import config from '$lib/config/app-configuration';
	import { AuthDialog } from '$lib/components/layout';
	import { Paragraph } from '$lib/components/typography';
	import { toastSuccess } from '$lib/utils/toast';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import SignUpForm from './SignUpForm.svelte';
	import type { SignUpFormData } from './schema';
	import { isRedirect } from '$lib/utils/redirect';

	let isLoading = $state(false);
	let signUpSuccess = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: SignUpFormData) {
		isLoading = true;
		error = undefined;

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
				toastSuccess(m.users_signup_success_text());
			}
		} catch (err) {
			error = resolveApiErrorMessage(err, m.errors_sign_up_failed());
		} finally {
			isLoading = false;
		}
	}
</script>

<AuthDialog title={m.user_form_sign_up_title()}>
	{#snippet intro()}
		<Paragraph>
			{#if isRedirect(page)}
				{m.user_onboarding_protected_view_info()}
			{:else}
				{m.user_onboarding_intro()}
			{/if}
		</Paragraph>
	{/snippet}

	<SignUpForm onSubmit={handleSubmit} {signUpSuccess} {isLoading} {error} />
</AuthDialog>
