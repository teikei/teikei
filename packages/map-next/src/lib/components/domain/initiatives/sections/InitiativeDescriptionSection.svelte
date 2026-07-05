<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import { FormTextarea } from '$lib/components/forms';
	import { Paragraph } from '$lib/components/typography';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { InitiativeProperties } from '$lib/types/entries';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: InitiativeProperties;
		form: SuperForm<MainEntryFormData>;
	}

	let { mode, properties, form }: Props = $props();

	const formData = $derived(form.form);
	const errors = $derived(form.errors);
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-description">
		<FormTextarea
			id="entry-editor-description"
			label={m.editor_field_description()}
			rows={4}
			bind:value={$formData.description}
			error={$errors.description}
		/>
	</ProfileSection>
{:else if properties?.description}
	<ProfileSection testId="profile-section-description">
		<Paragraph size="small" muted class="whitespace-pre-line">{properties.description}</Paragraph>
	</ProfileSection>
{/if}
