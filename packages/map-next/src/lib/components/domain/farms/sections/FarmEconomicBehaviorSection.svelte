<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { FormTextarea } from '$lib/components/forms';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { FarmProperties } from '$lib/types/entries';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

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
	<ProfileSection testId="profile-section-economic" title={m.editor_section_economic()}>
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
	<ProfileSection testId="profile-section-economic" title={m.editor_section_economic()}>
		{#if properties.actsEcological && properties.economicalBehavior}
			<ul class="text-md list-inside list-disc text-muted-foreground">
				<li>{m.places_farmdescription_biocertification()}</li>
				<li>{properties.economicalBehavior}</li>
			</ul>
		{:else}
			<p class="text-md text-muted-foreground">
				{properties.actsEcological
					? m.places_farmdescription_biocertification()
					: properties.economicalBehavior}
			</p>
		{/if}
	</ProfileSection>
{/if}
