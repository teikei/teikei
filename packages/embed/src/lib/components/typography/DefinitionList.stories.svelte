<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DefinitionList from './DefinitionList.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Typography/DefinitionList',
		component: DefinitionList,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		items: [
			{ term: 'Vertragsdauer:', description: '12 Monate' },
			{ term: 'Kündigungsfrist:', description: '3 Monate zum Vertragsende' },
			{ term: 'Anteilspreis:', description: '85 € pro Monat' }
		]
	}}
/>
