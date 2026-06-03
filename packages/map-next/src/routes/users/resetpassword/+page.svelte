<script lang="ts">
	import { goto } from '$app/navigation';
	import { resetPassword } from '$lib/api/auth';
	import Heading from '$lib/components/typography/Heading.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/TwoColumnLayout.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages.js';
	import ResetPasswordForm from './ResetPasswordForm.svelte';
	import type { ResetPasswordFormData } from './schema';
	import type { PageData } from './$types';
	import { routeBuilders } from '$lib/utils/routes';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

	// Dialog is open when we're on this route
	let open = $state(true);

	async function handleSubmit(values: ResetPasswordFormData) {
		isLoading = true;
		error = undefined;

		try {
			await resetPassword({
				resetPasswordToken: data.resetToken,
				password: values.password
			});
			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_reset_password_failed();
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
		<Dialog.Title class="sr-only">{m.users_reset_password_title()}</Dialog.Title>
		<TwoColumnLayout class="h-full overflow-y-auto">
			{#snippet leftColumn()}
				<Heading level={2}>{m.user_onboarding_title()}</Heading>
				<Paragraph>{m.user_onboarding_intro()}</Paragraph>
			{/snippet}

			{#snippet rightColumn()}
				<ResetPasswordForm onSubmit={handleSubmit} {success} {isLoading} {error} />
			{/snippet}
		</TwoColumnLayout>
	</Dialog.Content>
</Dialog.Root>
