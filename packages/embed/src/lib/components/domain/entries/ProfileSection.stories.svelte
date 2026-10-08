<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProfileSection from './sections/ProfileSection.svelte';
	import { Paragraph } from '$lib/components/typography';

	const { Story } = defineMeta({
		title: 'App/Entry Profile/ProfileSection',
		component: ProfileSection,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Shared wrapper for read and edit sections of an entry profile: optional heading, optional white card.'
				}
			}
		}
	});
</script>

<Story name="Plain" asChild>
	<div class="w-sm">
		<ProfileSection title="Produkte">
			<Paragraph class="text-sm">Gemüse, Kräuter und gelegentlich Obst.</Paragraph>
		</ProfileSection>
	</div>
</Story>

<Story name="Card" asChild>
	<div class="w-sm bg-sidebar p-4">
		<ProfileSection card title="Ziele">
			<Paragraph class="text-sm">Vernetzung und Bildung.</Paragraph>
		</ProfileSection>
	</div>
</Story>
