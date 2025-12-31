<script lang="ts">
	import { goto } from '$app/navigation';
	import { updateUser } from '$lib/api/auth';
	import { Heading, Paragraph } from '$lib/components/shared';
	import { TwoColumnLayout } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveHashRoute } from '$lib/utils/resolveHashRoute';
	import EditAccountForm from './EditAccountForm.svelte';
	import type { EditAccountFormData } from './schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: EditAccountFormData) {
		isLoading = true;
		error = undefined;

		try {
			const response = await updateUser({
				id: data.user.id,
				name: values.name,
				email: values.email,
				phone: values.phone,
				locale: values.locale,
				password: values.password
			});

			if (response.id === data.user.id) {
				// Success - redirect to map
				goto(resolveHashRoute('/'));
			} else {
				throw new Error(m.errors_account_update_failed());
			}
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_account_update_failed();
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
		<EditAccountForm user={data.user} onSubmit={handleSubmit} {isLoading} {error} />
	{/snippet}
</TwoColumnLayout>
