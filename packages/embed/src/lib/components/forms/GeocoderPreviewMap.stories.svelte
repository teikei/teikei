<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GeocoderPreviewMap from './GeocoderPreviewMap.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/GeocoderPreviewMap',
		component: GeocoderPreviewMap,
		tags: ['autodocs'],
		argTypes: {
			markerType: {
				control: 'inline-radio',
				options: ['Farm', 'Depot', 'Initiative']
			}
		}
	});
</script>

<Story name="Farm" args={{ latitude: 53.12, longitude: 13.51, markerType: 'Farm' }}>
	{#snippet template(args)}
		<div class="w-sm">
			<GeocoderPreviewMap {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Depot" args={{ latitude: 52.52, longitude: 13.4, markerType: 'Depot' }}>
	{#snippet template(args)}
		<div class="w-sm">
			<GeocoderPreviewMap {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Initiative" args={{ latitude: 48.14, longitude: 11.58, markerType: 'Initiative' }}>
	{#snippet template(args)}
		<div class="w-sm">
			<GeocoderPreviewMap {...args} />
		</div>
	{/snippet}
</Story>
