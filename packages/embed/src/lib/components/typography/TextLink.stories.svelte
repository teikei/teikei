<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextLink from './TextLink.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Typography/TextLink',
		component: TextLink,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'inline-radio',
				options: ['default', 'muted']
			},
			href: {
				control: 'text'
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default', href: '#' }}>
	{#snippet template(args)}
		<TextLink {...args}>Visit the farm profile</TextLink>
	{/snippet}
</Story>

<Story name="Muted" args={{ variant: 'muted', href: '#' }}>
	{#snippet template(args)}
		<TextLink {...args}>Secondary navigation link</TextLink>
	{/snippet}
</Story>

<Story name="In Paragraph" asChild>
	<p class="max-w-prose text-sm text-foreground">
		Community supported agriculture connects eaters with nearby farms. Read more in the
		<TextLink href="#">getting started guide</TextLink> or browse the
		<TextLink variant="muted" href="#">regional directory</TextLink>.
	</p>
</Story>
