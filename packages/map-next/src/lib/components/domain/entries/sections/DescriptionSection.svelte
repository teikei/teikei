<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import { FormTextarea } from '$lib/components/forms';
	import { Paragraph } from '$lib/components/typography';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { MainEntryProperties } from '$lib/types/entries';
	import ProfileSection from './ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: MainEntryProperties;
		form: SuperForm<MainEntryFormData>;
	}

	let { mode, properties, form }: Props = $props();

	const formData = $derived(form.form);
	const errors = $derived(form.errors);
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-description" title={m.editor_section_description()}>
		<FormTextarea
			id="entry-editor-description"
			label={m.editor_field_description()}
			hideLabel
			rows={4}
			bind:value={$formData.description}
			error={$errors.description}
		/>
	</ProfileSection>
{:else if properties?.description}
	<!-- Read mode shows the description as plain prose without a heading; the
	     "Beschreibung" heading is kept only in edit mode to label the field. -->
	<ProfileSection testId="profile-section-description">
		<Paragraph class="whitespace-pre-line">{properties.description}</Paragraph>
	</ProfileSection>
{/if}
