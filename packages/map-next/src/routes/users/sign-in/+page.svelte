<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signIn } from '$lib/api/auth';
	import { Heading, Paragraph } from '$lib/components/shared';
	import { TwoColumnLayout } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import SignInForm from './SignInForm.svelte';
	import type { SignInFormData } from './schema';
	import { getRedirectUrl, isRedirect } from '$lib/utils/redirect';

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(values: SignInFormData) {
		isLoading = true;
		error = null;

		try {
			const response = await signIn(values);
			if (response.user?.email === values.email) {
				// Success - redirect to target page
				const targetUrl = getRedirectUrl(page);
				await goto(targetUrl);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_sign_in_failed();
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
		{#if error}
			<div class="mb-4 rounded-md bg-destructive/10 p-4 text-destructive">
				{error}
			</div>
		{/if}
		<SignInForm onSubmit={handleSubmit} {isLoading} />
	{/snippet}
</TwoColumnLayout>
