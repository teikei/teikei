<script lang="ts">
	import UsersIcon from '@lucide/svelte/icons/users';
	import LandPlotIcon from '@lucide/svelte/icons/land-plot';
	import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list';
	import SproutIcon from '@lucide/svelte/icons/sprout';
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Chip } from '$lib/components/display';
	import { translateGoal } from '$lib/utils/translations';
	import { toggleSelection } from '$lib/utils/editor-form';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { Goal, InitiativeProperties } from '$lib/types/entries';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: InitiativeProperties;
		form: SuperForm<MainEntryFormData>;
		goals?: Goal[];
	}

	let { mode, properties, form, goals = [] }: Props = $props();

	// The four catalog goals are stable (see goalTranslations); unknown names
	// render without an icon.
	const GOAL_ICONS: Record<string, typeof UsersIcon | undefined> = {
		consumers: UsersIcon,
		land: LandPlotIcon,
		organizers: ClipboardListIcon,
		staff: SproutIcon
	};

	const formData = $derived(form.form);

	function handleGoalToggle(goalId: string, checked: boolean) {
		$formData.goals = toggleSelection($formData.goals, goalId, checked);
	}
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-goals" title={m.editor_section_goals()}>
		<Field.Set>
			<Field.Legend variant="label" class="sr-only">{m.editor_section_goals()}</Field.Legend>
			<Field.Group class="gap-2">
				{#each goals as goal (goal.id)}
					<Field.Field orientation="horizontal">
						<Checkbox
							id={`goal-${goal.id}`}
							checked={$formData.goals.includes(String(goal.id))}
							onCheckedChange={(checked) => handleGoalToggle(String(goal.id), checked === true)}
						/>
						<Field.Label for={`goal-${goal.id}`} class="font-normal">
							{translateGoal(goal.name)}
						</Field.Label>
					</Field.Field>
				{/each}
			</Field.Group>
		</Field.Set>
	</ProfileSection>
{:else if properties && properties.goals?.length}
	<ProfileSection testId="profile-section-goals" title={m.editor_section_goals()}>
		<div class="flex flex-wrap gap-2">
			{#each properties.goals as goal (goal.id)}
				{@const GoalIcon = GOAL_ICONS[goal.name]}
				<Chip tint="success" data-testid="goal-chip">
					{#if GoalIcon}
						<GoalIcon aria-hidden="true" />
					{/if}
					{translateGoal(goal.name)}
				</Chip>
			{/each}
		</div>
	</ProfileSection>
{/if}
