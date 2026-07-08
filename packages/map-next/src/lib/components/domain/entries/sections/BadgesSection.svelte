<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { toggleSelection } from '$lib/utils/editor-form';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { Badge as BadgeData, MainEntryProperties } from '$lib/types/entries';
	import { safeHttpUrl } from '$lib/utils/url';
	import BadgesList from '../BadgesList.svelte';
	import ProfileSection from './ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: MainEntryProperties;
		form: SuperForm<MainEntryFormData>;
		badges?: BadgeData[];
		idPrefix: string;
	}

	let { mode, properties, form, badges = [], idPrefix }: Props = $props();

	const formData = $derived(form.form);

	function handleBadgeToggle(badgeId: string, checked: boolean) {
		$formData.badges = toggleSelection($formData.badges, badgeId, checked);
	}
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-badges" title={m.editor_section_badges()}>
		<Field.Set>
			<Field.Legend variant="label" class="sr-only">{m.editor_section_badges()}</Field.Legend>
			<Field.Group class="flex flex-col gap-2">
				{#each badges as badge (badge.id)}
					<Field.Field orientation="horizontal">
						<Checkbox
							id={`${idPrefix}-${badge.id}`}
							checked={$formData.badges.includes(String(badge.id))}
							onCheckedChange={(checked) => handleBadgeToggle(String(badge.id), checked === true)}
						/>
						<Field.Label
							for={`${idPrefix}-${badge.id}`}
							class="flex items-center gap-2 font-normal whitespace-nowrap"
						>
							{#if badge.logo}
								<img src={badge.logo} alt="" class="h-6 w-auto object-contain" />
							{/if}
							{badge.name}
						</Field.Label>
						{@const badgeUrl = safeHttpUrl(badge.url)}
						{#if badgeUrl}
							<a
								href={badgeUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-muted-foreground hover:text-foreground"
								aria-label={badge.name}
							>
								<ExternalLinkIcon class="size-3" />
							</a>
						{/if}
					</Field.Field>
				{/each}
			</Field.Group>
		</Field.Set>
	</ProfileSection>
{:else if properties && properties.badges?.length}
	<ProfileSection testId="profile-section-badges" title={m.editor_section_badges()}>
		<BadgesList badges={properties.badges} category="associations" showTitle={false} />
		<BadgesList badges={properties.badges} category="certifications" />
	</ProfileSection>
{/if}
