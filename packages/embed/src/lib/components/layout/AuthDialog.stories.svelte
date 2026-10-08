<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthDialog from './AuthDialog.svelte';
	import AppButton from '$lib/components/actions/AppButton.svelte';
	import { FormInput } from '$lib/components/forms';
	import { Paragraph } from '$lib/components/typography';

	const { Story } = defineMeta({
		title: 'Design System/Layout/AuthDialog',
		component: AuthDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: { story: { inline: false, height: '640px' } }
		},
		args: {
			title: 'Anmelden',
			onClose: () => {}
		}
	});
</script>

{#snippet signInForm()}
	<div class="flex flex-col gap-4">
		<FormInput id="story-auth-email" label="E-Mail" type="email" value="mail@example.org" />
		<FormInput id="story-auth-password" label="Passwort" type="password" value="" />
		<AppButton>Anmelden</AppButton>
	</div>
{/snippet}

<Story name="Onboarding" args={{ variant: 'onboarding' }}>
	{#snippet template(args)}
		<AuthDialog title={args.title} variant={args.variant} onClose={args.onClose}>
			{@render signInForm()}
		</AuthDialog>
	{/snippet}
</Story>

<Story name="Plain" args={{ variant: 'plain', title: 'Passwort ändern' }}>
	{#snippet template(args)}
		<AuthDialog title={args.title} variant={args.variant} onClose={args.onClose}>
			<Paragraph>Single-column variant for account management pages.</Paragraph>
			{@render signInForm()}
		</AuthDialog>
	{/snippet}
</Story>
