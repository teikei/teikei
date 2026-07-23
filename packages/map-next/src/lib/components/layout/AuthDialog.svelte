<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import TwoColumnLayout from '$lib/components/layout/TwoColumnLayout.svelte';
	import { Heading, Paragraph } from '$lib/components/typography';
	import * as m from '$lib/paraglide/messages.js';
	import { routeBuilders } from '$lib/utils/routes';

	interface Props {
		/** Accessible dialog title. Rendered visually hidden. */
		title: string;
		/** Right-column content, typically the auth form. */
		children: Snippet;
		/** Optional override for the left-column intro body (defaults to the onboarding intro). */
		intro?: Snippet;
		/** Called when the dialog is dismissed. Defaults to navigating to the map. */
		onClose?: () => void;
		/**
		 * Layout variant.
		 * - `onboarding`: two-column sign-in / sign-up with the onboarding intro.
		 * - `plain`: single-column `max-w-md` dialog whose surface is the cream panel
		 *   (no white frame), for account/password management pages.
		 */
		variant?: 'onboarding' | 'plain';
	}

	let { title, children, intro, onClose, variant = 'onboarding' }: Props = $props();

	// The dialog is open whenever this route is mounted.
	let open = $state(true);

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			if (onClose) {
				onClose();
			} else {
				goto(routeBuilders.home());
			}
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	{#if variant === 'plain'}
		<Dialog.Content
			class="flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none flex-col overflow-hidden bg-auth-panel p-0 sm:max-w-none md:h-auto md:max-h-[90vh] md:w-[90vw] md:max-w-md"
		>
			<Dialog.Title class="sr-only">{title}</Dialog.Title>
			<div class="flex styled-scrollbar min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
				<div class="mx-auto flex w-full max-w-md flex-col gap-6 sm:gap-8">
					{@render children()}
				</div>
			</div>
		</Dialog.Content>
	{:else}
		<Dialog.Content
			class="flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none flex-col overflow-hidden p-0 md:h-auto md:max-h-[90vh] md:w-[90vw] md:max-w-4xl"
		>
			<Dialog.Title class="sr-only">{title}</Dialog.Title>
			<TwoColumnLayout class="styled-scrollbar min-h-0 flex-1 overflow-y-auto">
				{#snippet leftColumn()}
					<Heading level={2}>{m.user_onboarding_title()}</Heading>
					{#if intro}
						{@render intro()}
					{:else}
						<Paragraph>{m.user_onboarding_intro()}</Paragraph>
					{/if}
				{/snippet}

				{#snippet rightColumn()}
					{@render children()}
				{/snippet}
			</TwoColumnLayout>
		</Dialog.Content>
	{/if}
</Dialog.Root>
