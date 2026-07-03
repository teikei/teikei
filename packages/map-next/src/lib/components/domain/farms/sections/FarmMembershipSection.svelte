<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { cn } from '$lib/utils/tailwind';
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

	const MEMBERSHIP_DISPLAY: Record<AcceptsNewMembers, { text: () => string; class: string }> = {
		yes: { text: m.places_details_accepts_new_members_yes, class: 'text-success' },
		no: { text: m.places_details_accepts_new_members_no, class: 'text-destructive' },
		waitlist: { text: m.places_details_accepts_new_members_waitlist, class: 'text-warning' }
	};

	function foundedText(p: FarmProperties): string {
		if (!p.foundedAtYear) {
			return '';
		}
		const monthText = p.foundedAtMonth ? translateMonth(p.foundedAtMonth) : '';
		const foundedAt = new Date(p.foundedAtYear, (p.foundedAtMonth || 1) - 1);
		const temporalWord = foundedAt < new Date() ? m.forms_labels_since() : m.forms_labels_from();
		return `${m.page_header_solawi()} ${temporalWord} ${monthText} ${p.foundedAtYear}`.trim();
	}

	const membership = $derived(
		properties?.acceptsNewMembers ? MEMBERSHIP_DISPLAY[properties.acceptsNewMembers] : undefined
	);
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-membership">
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
			rows={4}
			bind:value={$formData.participation}
		/>
	</ProfileSection>
{:else if properties}
	{@const founded = foundedText(properties)}
	{#if founded || membership || properties.participation || properties.maximumMembers}
		<ProfileSection testId="profile-section-membership">
			{#if founded}
				<p class="text-sm text-muted-foreground">{founded}</p>
			{/if}
			{#if membership}
				<p class={cn('text-sm font-medium', membership.class)}>{membership.text()}</p>
			{/if}
			{#if properties.participation}
				<div class="flex flex-col gap-1">
					<h4 class="text-sm font-semibold">{m.places_farmdescription_participation()}</h4>
					<p class="text-sm text-muted-foreground">{properties.participation}</p>
				</div>
			{/if}
			{#if properties.maximumMembers}
				<p class="text-sm">
					<span class="font-semibold">{m.places_farmdescription_maximummembers()}</span>
					{properties.maximumMembers}
				</p>
			{/if}
		</ProfileSection>
	{/if}
{/if}
