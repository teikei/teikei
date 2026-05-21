<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Heading from './Heading.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Typography/Heading',
		component: Heading,
		tags: ['autodocs'],
		argTypes: {
			level: {
				control: 'inline-radio',
				options: [1, 2, 3, 4, 5, 6]
			}
		}
	});
</script>

<Story name="Default" args={{ level: 1 }}>
	{#snippet template(args)}
		<Heading {...args}>Community supported agriculture</Heading>
	{/snippet}
</Story>

<Story name="Scale">
	<div class="flex flex-col gap-3">
		{#each [1, 2, 3, 4, 5, 6] as level (level)}
			<Heading {level}>Heading level {level}</Heading>
		{/each}
	</div>
</Story>
