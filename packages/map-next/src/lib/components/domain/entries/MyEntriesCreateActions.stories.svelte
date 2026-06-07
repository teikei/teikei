<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MyEntriesCreateActions from './MyEntriesCreateActions.svelte';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/MyEntriesCreateActions',
		component: MyEntriesCreateActions,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Sticky action bar shown above the "my entries" list, offering shortcuts to create a new farm, depot, or initiative.'
				}
			}
		}
	});

	const noop = () => {};
</script>

<Story name="Default" asChild>
	<div class="w-sm bg-sidebar">
		<MyEntriesCreateActions onCreate={noop} />
	</div>
</Story>
