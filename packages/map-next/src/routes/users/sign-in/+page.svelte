<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signIn } from '$lib/api/auth';
	import { AuthDialog } from '$lib/components/layout';
	import { Paragraph } from '$lib/components/typography';
	import { toastSuccess } from '$lib/utils/toast';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import SignInForm from './SignInForm.svelte';
	import type { SignInFormData } from './schema';
	import { getRedirectUrl, isRedirect } from '$lib/utils/redirect';

	let isLoading = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: SignInFormData) {
		isLoading = true;
		error = undefined;

		try {
			const response = await signIn(values);
			if (response.user?.email === values.email) {
				toastSuccess(m.user_onboarding_sign_in_success({ username: response.user.name }));
				const targetUrl = getRedirectUrl(page);
				await goto(targetUrl);
			}
		} catch (err) {
			error = resolveApiErrorMessage(err, m.errors_sign_in_failed());
		} finally {
			isLoading = false;
		}
	}
</script>

<AuthDialog title={m.user_form_sign_in_title()}>
	{#snippet intro()}
		<Paragraph>
			{#if isRedirect(page)}
				{m.user_onboarding_protected_view_info()}
			{:else}
				{m.user_onboarding_intro()}
			{/if}
		</Paragraph>
	{/snippet}

	<SignInForm onSubmit={handleSubmit} {isLoading} {error} />
</AuthDialog>
