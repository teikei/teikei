<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BottomSheet from './BottomSheet.svelte';
	import { Heading, Paragraph } from '$lib/components/typography';

	const { Story } = defineMeta({
		title: 'Design System/Layout/BottomSheet',
		component: BottomSheet,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			viewport: { defaultViewport: 'mobile1' },
			docs: {
				story: { inline: false, height: '640px' },
				description: {
					component:
						'Mobile sheet with peek / half / full snap points. Drag the handle or use the arrow keys.'
				}
			}
		},
		argTypes: {
			snap: { control: 'inline-radio', options: ['peek', 'half', 'full'] }
		}
	});
</script>

<Story name="Interactive" args={{ snap: 'half' }}>
	{#snippet template(args)}
		<div class="h-screen bg-muted">
			<BottomSheet snap={args.snap} onSnap={(next) => (args.snap = next)}>
				<div class="flex flex-col gap-2 px-4">
					<Heading level={2}>Betriebe in der Nähe</Heading>
					<Paragraph muted>Ziehe den Griff, um die Höhe zu ändern.</Paragraph>
				</div>
			</BottomSheet>
		</div>
	{/snippet}
</Story>

<Story name="Peek" args={{ snap: 'peek' }}>
	{#snippet template(args)}
		<div class="h-screen bg-muted">
			<BottomSheet snap={args.snap}>
				<Paragraph class="px-4">Peek</Paragraph>
			</BottomSheet>
		</div>
	{/snippet}
</Story>

<Story name="Full" args={{ snap: 'full' }}>
	{#snippet template(args)}
		<div class="h-screen bg-muted">
			<BottomSheet snap={args.snap}>
				<Paragraph class="px-4">Full</Paragraph>
			</BottomSheet>
		</div>
	{/snippet}
</Story>
