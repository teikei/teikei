<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { toggleSelection } from '$lib/utils/editor-form';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { Badge as BadgeData, InitiativeProperties } from '$lib/types/entries';
	import BadgesList from '../../entries/BadgesList.svelte';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: InitiativeProperties;
		form: SuperForm<MainEntryFormData>;
		badges?: BadgeData[];
		idPrefix?: string;
	}

	let { mode, properties, form, badges = [], idPrefix = 'initiative-badge' }: Props = $props();

	const formData = $derived(form.form);

	function handleBadgeToggle(badgeId: string, checked: boolean) {
		$formData.badges = toggleSelection($formData.badges, badgeId, checked);
	}
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-badges">
		<Field.Set>
			<Field.Legend variant="label">{m.editor_field_badges()}</Field.Legend>
			<Field.Group class="grid grid-cols-1 gap-2 md:grid-cols-2">
				{#each badges as badge (badge.id)}
					<Field.Field orientation="horizontal">
						<Checkbox
							id={`${idPrefix}-${badge.id}`}
							checked={$formData.badges.includes(String(badge.id))}
							onCheckedChange={(checked) => handleBadgeToggle(String(badge.id), checked === true)}
						/>
						<Field.Label
							for={`${idPrefix}-${badge.id}`}
							class="flex items-center gap-2 font-normal"
						>
							{#if badge.logo}
								<img src={badge.logo} alt="" class="h-6 w-auto object-contain" />
							{/if}
							{badge.name}
						</Field.Label>
						{#if badge.url}
							<a
								href={badge.url}
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
{:else if properties}
	<ProfileSection testId="profile-section-badges">
		<BadgesList badges={properties.badges} category="associations" />
		<BadgesList badges={properties.badges} category="certifications" />
	</ProfileSection>
{/if}
