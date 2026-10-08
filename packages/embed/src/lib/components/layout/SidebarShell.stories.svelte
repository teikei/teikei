<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SidebarShell from './SidebarShell.svelte';
	import SidebarScrollArea from './SidebarScrollArea.svelte';
	import { Heading, Paragraph } from '$lib/components/typography';

	const { Story } = defineMeta({
		title: 'Design System/Layout/SidebarShell',
		component: SidebarShell,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				story: { inline: false, height: '600px' },
				description: {
					component:
						'Floating card on desktop, bottom sheet on mobile. Content is typically wrapped in `SidebarScrollArea`.'
				}
			}
		},
		argTypes: {
			mode: { control: 'inline-radio', options: ['list', 'detail', 'task', 'editor'] },
			collapsed: { control: 'boolean' }
		}
	});
</script>

<Story name="List" args={{ mode: 'list', collapsed: false }}>
	{#snippet template(args)}
		<div class="relative h-screen bg-muted">
			<SidebarShell mode={args.mode} collapsed={args.collapsed}>
				<SidebarScrollArea>
					<div class="flex flex-col gap-2 p-4">
						<Heading level={2}>Betriebe</Heading>
						{#each Array(12) as _, i (i)}
							<Paragraph>Eintrag {i + 1}</Paragraph>
						{/each}
					</div>
				</SidebarScrollArea>
			</SidebarShell>
		</div>
	{/snippet}
</Story>

<Story name="Editor" args={{ mode: 'editor', collapsed: false }}>
	{#snippet template(args)}
		<div class="relative h-screen bg-muted">
			<SidebarShell mode={args.mode} collapsed={args.collapsed}>
				<SidebarScrollArea>
					<div class="p-4">
						<Heading level={2}>Eintrag bearbeiten</Heading>
					</div>
				</SidebarScrollArea>
			</SidebarShell>
		</div>
	{/snippet}
</Story>

<Story name="Collapsed" args={{ mode: 'list', collapsed: true }}>
	{#snippet template(args)}
		<div class="relative h-screen bg-muted">
			<SidebarShell mode={args.mode} collapsed={args.collapsed}>
				<div class="p-4">
					<Paragraph>Suche</Paragraph>
				</div>
			</SidebarShell>
		</div>
	{/snippet}
</Story>
