<script lang="ts">
	import { resetPassword } from '$lib/api/auth';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/two-column-layout.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ResetPasswordForm from './ResetPasswordForm.svelte';
	import type { ResetPasswordFormData } from './schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

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
</script>

<TwoColumnLayout>
	{#snippet leftColumn()}
		<Heading level={2}>{m.user_onboarding_title()}</Heading>
		<Paragraph>{m.user_onboarding_intro()}</Paragraph>
	{/snippet}

	{#snippet rightColumn()}
		<ResetPasswordForm onSubmit={handleSubmit} {success} {isLoading} {error} />
	{/snippet}
</TwoColumnLayout>
