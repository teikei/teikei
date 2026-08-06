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

	const headingLevels = [1, 2, 3, 4, 5, 6] as const;
</script>

<Story name="Default" args={{ level: 1 }}>
	{#snippet template(args)}
		<Heading level={args.level}>Community supported agriculture</Heading>
	{/snippet}
</Story>

<Story name="Scale" asChild>
	<div class="flex flex-col gap-3">
		{#each headingLevels as level (level)}
			<Heading {level}>Heading level {level}</Heading>
		{/each}
	</div>
</Story>
