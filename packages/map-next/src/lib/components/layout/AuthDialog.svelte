<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import TwoColumnLayout from '$lib/components/layout/TwoColumnLayout.svelte';
	import Heading from '$lib/components/typography/Heading.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';
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
	}

	let { title, children, intro, onClose }: Props = $props();

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
	<Dialog.Content
		class="h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none overflow-hidden md:h-auto md:max-h-[90vh] md:w-[90vw] md:max-w-4xl"
	>
		<Dialog.Title class="sr-only">{title}</Dialog.Title>
		<TwoColumnLayout class="h-full overflow-y-auto">
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
</Dialog.Root>
