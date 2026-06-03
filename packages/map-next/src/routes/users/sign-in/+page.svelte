<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signIn } from '$lib/api/auth';
	import Heading from '$lib/components/typography/Heading.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/TwoColumnLayout.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages.js';
	import SignInForm from './SignInForm.svelte';
	import type { SignInFormData } from './schema';
	import { getRedirectUrl, isRedirect } from '$lib/utils/redirect';
	import { routeBuilders } from '$lib/utils/routes';

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Dialog is open when we're on this route
	let open = $state(true);

	async function handleSubmit(values: SignInFormData) {
		isLoading = true;
		error = null;

		try {
			const response = await signIn(values);
			if (response.user?.email === values.email) {
				// Success - close modal and redirect
				const targetUrl = getRedirectUrl(page);
				await goto(targetUrl);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_sign_in_failed();
		} finally {
			isLoading = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			goto(routeBuilders.home());
		}
		open = newOpen;
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content
		class="h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none overflow-hidden  md:h-auto md:max-h-[90vh] md:w-[90vw] md:max-w-4xl"
	>
		<Dialog.Title class="sr-only">{m.user_form_sign_in_title()}</Dialog.Title>
		<TwoColumnLayout class="h-full overflow-y-auto">
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
				<SignInForm onSubmit={handleSubmit} {isLoading} {error} />
			{/snippet}
		</TwoColumnLayout>
	</Dialog.Content>
</Dialog.Root>
