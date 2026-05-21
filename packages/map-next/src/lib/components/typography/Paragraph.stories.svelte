<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Paragraph from './Paragraph.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Typography/Paragraph',
		component: Paragraph,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: 'inline-radio',
				options: ['regular', 'small']
			},
			muted: {
				control: 'boolean'
			}
		}
	});
</script>

<Story name="Default" args={{ size: 'regular', muted: false }}>
	{#snippet template(args)}
		<div class="max-w-md">
			<Paragraph size={args.size} muted={args.muted}>
				Use paragraph text for body copy, short explanations, and supporting content.
			</Paragraph>
		</div>
	{/snippet}
</Story>

<Story name="Muted Small" args={{ size: 'small', muted: true }}>
	{#snippet template(args)}
		<div class="max-w-md">
			<Paragraph size={args.size} muted={args.muted}>
				Secondary text for helper copy and compact form explanations.
			</Paragraph>
		</div>
	{/snippet}
</Story>
