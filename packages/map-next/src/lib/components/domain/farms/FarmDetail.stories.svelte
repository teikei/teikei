<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FarmDetail from './FarmDetail.svelte';
	import { storyFarmProperties } from '../entries/story-fixtures';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/FarmDetail',
		component: FarmDetail,
		tags: ['autodocs'],
		args: {
			properties: storyFarmProperties
		}
	});
</script>

<Story name="Complete">
	<div class="w-md rounded-md border bg-background p-4">
		<FarmDetail properties={storyFarmProperties} />
	</div>
</Story>

<Story name="Minimal">
	<div class="w-md rounded-md border bg-background p-4">
		<FarmDetail
			properties={{
				...storyFarmProperties,
				products: [],
				depots: undefined,
				badges: null,
				maximumMembers: null,
				additionalProductInformation: '',
				participation: '',
				actsEcological: false,
				economicalBehavior: ''
			}}
		/>
	</div>
</Story>
