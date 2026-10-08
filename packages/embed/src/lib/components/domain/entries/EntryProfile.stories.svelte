<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { FarmProfile } from '$lib/components/domain/farms';
	import { InitiativeProfile } from '$lib/components/domain/initiatives';
	import { SidebarShell } from '$lib/components/layout';
	import type { InitiativeFeature } from '$lib/types/entries';
	import { storyDepotFeature, storyFarmFeature, storyInitiativeProperties } from './story-fixtures';

	const { Story } = defineMeta({
		title: 'App/Entry Profile/Profiles',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				story: { inline: false, height: '640px' },
				description: {
					component:
						'Read-mode farm and initiative profiles inside the sidebar shell, rendered from static fixtures with no-op handlers.'
				}
			}
		}
	});

	const storyInitiativeFeature: InitiativeFeature = {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [12.37, 51.34] },
		properties: storyInitiativeProperties
	};

	const noop = () => {};
</script>

<Story name="Farm" asChild>
	<div class="relative h-screen bg-muted">
		<SidebarShell mode="detail">
			<FarmProfile entry={storyFarmFeature} mode="read" onClose={noop} />
		</SidebarShell>
	</div>
</Story>

<Story name="Farm Owner" asChild>
	<div class="relative h-screen bg-muted">
		<SidebarShell mode="detail">
			<FarmProfile
				entry={storyFarmFeature}
				mode="read"
				canEdit
				ownedDepotIds={new Set([String(storyDepotFeature.properties.id)])}
				onClose={noop}
				onEdit={noop}
				onAddDepot={noop}
			/>
		</SidebarShell>
	</div>
</Story>

<Story name="Initiative" asChild>
	<div class="relative h-screen bg-muted">
		<SidebarShell mode="detail">
			<InitiativeProfile entry={storyInitiativeFeature} mode="read" onClose={noop} />
		</SidebarShell>
	</div>
</Story>
