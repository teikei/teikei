<script lang="ts">
	import { BadgesSection, EntryProfile } from '$lib/components/domain/entries';
	import type { EntryProfileSectionContext } from '$lib/components/domain/entries';
	import { InitiativeGoalsSection } from './sections';
	import type { MainEntryFeature, MainEntryProperties } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';

	interface InitiativeProfileProps {
		/** The initiative feature; undefined only when creating a new initiative. */
		entry?: MainEntryFeature;
		mode: 'read' | 'edit';
		/** Catalog data (goals/badges) — present in edit/create mode. */
		editorData?: EntryEditorData;
		/** Whether the signed-in user owns this initiative (Edit action). */
		canEdit?: boolean;
		onClose: () => void;
		onEdit?: () => void;
		onCancel?: () => void | Promise<void>;
		onSaved?: (entry: MainEntryFeature) => void | Promise<void>;
	}

	let {
		entry,
		mode,
		editorData,
		canEdit = false,
		onClose,
		onEdit,
		onCancel,
		onSaved
	}: InitiativeProfileProps = $props();

	const goals = $derived(editorData?.goals ?? []);
	const badges = $derived(editorData?.badges ?? []);

	const initiativeProperties = (properties?: MainEntryProperties) =>
		properties?.type === 'Initiative' ? properties : undefined;
</script>

<EntryProfile
	entryType="Initiative"
	{entry}
	{mode}
	{canEdit}
	{onClose}
	{onEdit}
	{onCancel}
	{onSaved}
>
	{#snippet editSections({ form }: EntryProfileSectionContext)}
		<InitiativeGoalsSection mode="edit" {form} {goals} />
		<BadgesSection mode="edit" {form} {badges} idPrefix="initiative-badge" />
	{/snippet}

	{#snippet readSections({ form, properties }: EntryProfileSectionContext)}
		<InitiativeGoalsSection mode="read" properties={initiativeProperties(properties)} {form} />
		<BadgesSection mode="read" {properties} {form} idPrefix="initiative-badge" />
	{/snippet}
</EntryProfile>
