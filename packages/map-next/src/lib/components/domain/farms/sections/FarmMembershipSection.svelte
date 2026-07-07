<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { DefinitionList, Heading, Paragraph } from '$lib/components/typography';
	import { FormInput, FormSelect, FormTextarea } from '$lib/components/forms';
	import { translateMonth } from '$lib/utils/translations';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { AcceptsNewMembers, FarmProperties } from '$lib/types/entries';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: FarmProperties;
		form: SuperForm<MainEntryFormData>;
	}

	let { mode, properties, form }: Props = $props();

	const formData = $derived(form.form);
	const errors = $derived(form.errors);

	const yearOptions = Array.from({ length: 101 }, (_, index) =>
		String(new Date().getFullYear() - index)
	);
	const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-membership" title={m.editor_section_membership()}>
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<FormSelect
				id="entry-editor-founded-year"
				label={m.editor_field_founded_year()}
				options={[
					{ value: '', label: '' },
					...yearOptions.map((year) => ({ value: year, label: year }))
				]}
				bind:value={$formData.foundedAtYear}
			/>
			<FormSelect
				id="entry-editor-founded-month"
				label={m.editor_field_founded_month()}
				options={[
					{ value: '', label: '' },
					...monthOptions.map((month) => ({ value: String(month), label: translateMonth(month) }))
				]}
				bind:value={$formData.foundedAtMonth}
				error={$errors.foundedAtMonth}
			/>
		</div>

		<Field.Set>
			<Field.Legend variant="label">{m.editor_field_accepts_new_members()}</Field.Legend>
			<RadioGroup.Root
				value={$formData.acceptsNewMembers}
				onValueChange={(value) => ($formData.acceptsNewMembers = value as AcceptsNewMembers)}
			>
				<Field.Field orientation="horizontal">
					<RadioGroup.Item value="yes" id="accepts-yes" />
					<Field.Label for="accepts-yes" class="font-normal">{m.editor_accepts_yes()}</Field.Label>
				</Field.Field>
				<Field.Field orientation="horizontal">
					<RadioGroup.Item value="no" id="accepts-no" />
					<Field.Label for="accepts-no" class="font-normal">{m.editor_accepts_no()}</Field.Label>
				</Field.Field>
				<Field.Field orientation="horizontal">
					<RadioGroup.Item value="waitlist" id="accepts-waitlist" />
					<Field.Label for="accepts-waitlist" class="font-normal">
						{m.editor_accepts_waitlist()}
					</Field.Label>
				</Field.Field>
			</RadioGroup.Root>
		</Field.Set>

		<FormInput
			id="entry-editor-maximum-members"
			label={m.editor_field_maximum_members()}
			bind:value={$formData.maximumMembers}
			error={$errors.maximumMembers}
		/>

		<FormTextarea
			id="entry-editor-participation"
			label={m.editor_field_participation()}
			description={m.editor_field_participation_help()}
			rows={4}
			bind:value={$formData.participation}
		/>
	</ProfileSection>
{:else if properties && (properties.participation || properties.maximumMembers)}
	<!-- Founded line and membership status moved to the profile header (F12.1);
	     this section keeps the longer-form membership details. -->
	<ProfileSection testId="profile-section-membership" title={m.editor_section_membership()}>
		{#if properties.participation}
			<div class="flex flex-col gap-1">
				<Heading level={6}>{m.editor_field_participation()}</Heading>
				<Paragraph size="small" muted>{properties.participation}</Paragraph>
			</div>
		{/if}
		{#if properties.maximumMembers}
			<DefinitionList
				items={[
					{
						term: m.places_farmdescription_maximummembers(),
						description: String(properties.maximumMembers)
					}
				]}
			/>
		{/if}
	</ProfileSection>
{/if}
