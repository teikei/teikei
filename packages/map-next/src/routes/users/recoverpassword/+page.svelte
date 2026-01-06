<script lang="ts">
	import { recoverPassword } from '$lib/api/auth';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/two-column-layout.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import RecoverPasswordForm from './RecoverPasswordForm.svelte';
	import type { RecoverPasswordFormData } from './schema';

	let isLoading = $state(false);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

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
</script>

<TwoColumnLayout>
	{#snippet leftColumn()}
		<Heading level={2}>{m.user_onboarding_title()}</Heading>
		<Paragraph>{m.user_onboarding_intro()}</Paragraph>
	{/snippet}

	{#snippet rightColumn()}
		<RecoverPasswordForm onSubmit={handleSubmit} {success} {isLoading} {error} />
	{/snippet}
</TwoColumnLayout>
