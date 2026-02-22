<script lang="ts">
	import { goto } from '$app/navigation';
	import { recoverPassword } from '$lib/api/auth';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/two-column-layout.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages.js';
	import RecoverPasswordForm from './RecoverPasswordForm.svelte';
	import type { RecoverPasswordFormData } from './schema';
	import { hashRoutes } from '$lib/utils/routes';

	let isLoading = $state(false);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

	// Dialog is open when we're on this route
	let open = $state(true);

	async function handleSubmit(values: RecoverPasswordFormData) {
		isLoading = true;
		error = undefined;

		try {
			await recoverPassword({ email: values.email });
			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_recover_password_failed();
		} finally {
			isLoading = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			goto(hashRoutes.home);
		}
		open = newOpen;
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-h-[90vh] w-[90vw] max-w-4xl overflow-hidden p-0">
		<Dialog.Title class="sr-only">{m.users_recover_password_title()}</Dialog.Title>
		<TwoColumnLayout class="h-full max-h-[90vh] min-h-200 overflow-y-auto">
			{#snippet leftColumn()}
				<Heading level={2}>{m.user_onboarding_title()}</Heading>
				<Paragraph>{m.user_onboarding_intro()}</Paragraph>
			{/snippet}

			{#snippet rightColumn()}
				<RecoverPasswordForm onSubmit={handleSubmit} {success} {isLoading} {error} />
			{/snippet}
		</TwoColumnLayout>
	</Dialog.Content>
</Dialog.Root>
