<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import { FormInput, GeocoderField } from '$lib/components/forms';
	import { Paragraph } from '$lib/components/typography';
	import type { CommonFormState } from '$lib/utils/editor-form';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { MainEntryProperties, MainEntryType } from '$lib/types/entries';
	import { safeHttpUrl } from '$lib/utils/url';
	import ProfileSection from './ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: MainEntryProperties;
		form: SuperForm<MainEntryFormData>;
		markerType: MainEntryType;
	}

	let { mode, properties, form, markerType }: Props = $props();

	const formData = $derived(form.form);
	const errors = $derived(form.errors);

	function setCommonField(field: keyof CommonFormState, value: string) {
		$formData[field] = value;
	}

	function readAddress(p: MainEntryProperties): string {
		const line = [p.postalcode, p.city].filter(Boolean).join(' ');
		return [p.address, line].filter(Boolean).join(', ');
	}
</script>

<ProfileSection testId="profile-section-identity">
	{#if mode === 'edit'}
		<FormInput
			id="entry-editor-name"
			data-testid="editor-input-name"
			label={m.editor_field_name()}
			required
			bind:value={$formData.name}
			error={$errors.name}
		/>
		<FormInput
			id="entry-editor-url"
			label={m.editor_field_url()}
			bind:value={$formData.url}
			error={$errors.url}
		/>
		<GeocoderField
			id="entry-editor-address"
			label={m.editor_field_address()}
			testIdPrefix="editor-input"
			{markerType}
			required
			fields={$formData}
			onFieldChange={setCommonField}
			error={$errors.city ?? $errors.latitude ?? $errors.longitude}
		/>
	{:else if properties}
		{#if readAddress(properties)}
			<Paragraph size="small" muted>{readAddress(properties)}</Paragraph>
		{/if}
		{#if properties.url}
			{@const websiteUrl = safeHttpUrl(properties.url)}
			{#if websiteUrl}
				<a
					href={websiteUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
				>
					{websiteUrl}
					<ExternalLinkIcon class="size-3" />
				</a>
			{/if}
		{/if}
	{/if}
</ProfileSection>
