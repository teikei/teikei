<script lang="ts">
	import { goto } from '$app/navigation';
	import { confirmUser } from '$lib/api/auth';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import TwoColumnLayout from '$lib/components/layout/two-column-layout.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(true);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

	let open = $state(true);

	onMount(() => {
		activateUser();
	});

	async function activateUser() {
		isLoading = true;
		error = undefined;

		try {
			const response = await confirmUser({
				confirmationToken: data.confirmationToken
			});
			if (response.isVerified) {
				success = true;
			} else {
				throw new Error(m.errors_activation_failed());
			}
		} catch (err) {
			error = err instanceof Error ? err.message : m.errors_activation_failed();
		} finally {
			isLoading = false;
		}
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			goto('#/');
		}
		open = newOpen;
	}

	function handleClose() {
		goto('#/');
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-h-[90vh] w-[90vw] max-w-4xl overflow-hidden p-0">
		<Dialog.Title class="sr-only">{m.users_activation_title()}</Dialog.Title>
		<TwoColumnLayout class="h-full max-h-[90vh] min-h-200 overflow-y-auto">
			{#snippet leftColumn()}
				<Heading level={2}>{m.user_onboarding_title()}</Heading>
				<Paragraph>{m.user_onboarding_intro()}</Paragraph>
			{/snippet}

			{#snippet rightColumn()}
				<div class="flex h-full flex-col items-center justify-center space-y-6 p-8">
					{#if isLoading}
						<div class="text-center">
							<div
								class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
							<Paragraph class="mt-4">{m.users_activation_processing()}</Paragraph>
						</div>
					{:else if success}
						<div class="text-center">
							<Heading level={3}>{m.users_activation_success_title()}</Heading>
							<Paragraph class="mt-4">{m.users_activation_success()}</Paragraph>
							<Button class="mt-6" onclick={handleClose}>{m.users_activation_close()}</Button>
						</div>
					{:else if error}
						<div class="text-center">
							<Heading level={3}>{m.users_activation_error_title()}</Heading>
							<Paragraph class="mt-4 text-destructive">{error}</Paragraph>
							<Button class="mt-6" onclick={handleClose}>{m.users_activation_close()}</Button>
						</div>
					{/if}
				</div>
			{/snippet}
		</TwoColumnLayout>
	</Dialog.Content>
</Dialog.Root>
