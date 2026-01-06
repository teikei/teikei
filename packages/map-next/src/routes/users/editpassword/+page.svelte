<script lang="ts">
	import { goto } from '$app/navigation';
	import { updatePassword } from '$lib/api/auth';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/two-column-layout.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import EditPasswordForm from './EditPasswordForm.svelte';
	import type { EditPasswordFormData } from './schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: EditPasswordFormData) {
		isLoading = true;
		error = undefined;

		try {
			await updatePassword({
				oldPassword: values.oldPassword,
				password: values.password,
				email: data.user.email
			});
			// Success - redirect to map
			goto('#/');
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_password_change_failed();
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
		<EditPasswordForm onSubmit={handleSubmit} {isLoading} {error} />
	{/snippet}
</TwoColumnLayout>
