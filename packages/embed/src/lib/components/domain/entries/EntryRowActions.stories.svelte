<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EntryRowActions from './EntryRowActions.svelte';
	import { storyFarmFeature } from './story-fixtures';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/EntryRowActions',
		component: EntryRowActions,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Edit/delete actions overlaid on an entry row: inline buttons from the `lg` breakpoint, an overflow menu below it. Resize the viewport to see both.'
				}
			}
		},
		args: {
			feature: storyFarmFeature,
			onEdit: () => {},
			onDelete: () => {},
			onTrigger: () => {}
		}
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<div class="relative h-16 w-lg rounded-md border">
			<EntryRowActions {...args} />
		</div>
	{/snippet}
</Story>
