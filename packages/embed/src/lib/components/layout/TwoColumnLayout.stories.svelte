<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppButton from '$lib/components/actions/AppButton.svelte';
	import { FormInput } from '$lib/components/forms';
	import { Heading, Paragraph } from '$lib/components/typography';
	import TwoColumnLayout from './TwoColumnLayout.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Layout/TwoColumnLayout',
		component: TwoColumnLayout,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Auth Form" asChild>
	<TwoColumnLayout class="min-h-[640px]">
		{#snippet leftColumn()}
			<div class="flex flex-col gap-4">
				<Heading level={1}>Manage your entries</Heading>
				<Paragraph muted>
					Sign in to create and maintain farms, depots, and initiatives on the map.
				</Paragraph>
			</div>
		{/snippet}

		{#snippet rightColumn()}
			<div class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<Heading level={2}>Sign in</Heading>
					<Paragraph muted>Use the account connected to your Teikei entries.</Paragraph>
				</div>
				<FormInput id="story-layout-email" label="Email" type="email" value="mail@example.org" />
				<FormInput id="story-layout-password" label="Password" type="password" value="" />
				<AppButton>Sign in</AppButton>
			</div>
		{/snippet}
	</TwoColumnLayout>
</Story>
