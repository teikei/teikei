<script lang="ts">
	import LeafIcon from '@lucide/svelte/icons/leaf';
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { FormTextarea } from '$lib/components/forms';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { FarmProperties } from '$lib/types/entries';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: FarmProperties;
		form: SuperForm<MainEntryFormData>;
	}

	let { mode, properties, form }: Props = $props();

	const formData = $derived(form.form);
	const errors = $derived(form.errors);
</script>

{#if mode === 'edit'}
	<ProfileSection card testId="profile-section-economic" title={m.editor_section_economic()}>
		<Field.Field orientation="horizontal">
			<Checkbox id="acts-ecological" bind:checked={$formData.actsEcological} />
			<Field.Label for="acts-ecological" class="font-normal">
				{m.editor_field_acts_ecological()}
			</Field.Label>
		</Field.Field>

		<FormTextarea
			id="entry-editor-economical-behavior"
			label={m.editor_field_economical_behavior()}
			rows={4}
			bind:value={$formData.economicalBehavior}
			error={$errors.economicalBehavior}
		/>
	</ProfileSection>
{:else if properties && (properties.actsEcological || properties.economicalBehavior)}
	<ProfileSection card testId="profile-section-economic" title={m.editor_section_economic()}>
		{#if properties.actsEcological}
			<div class="flex items-center gap-2">
				<LeafIcon class="size-4 shrink-0 text-primary" aria-hidden="true" />
				<Paragraph>{m.places_farmdescription_biocertification()}</Paragraph>
			</div>
		{/if}
		{#if properties.economicalBehavior}
			<Paragraph>{properties.economicalBehavior}</Paragraph>
		{/if}
	</ProfileSection>
{/if}
