<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import LinkIcon from '@lucide/svelte/icons/link';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton, IconButton } from '$lib/components/actions';
	import { Paragraph } from '$lib/components/typography';
	import { EditorAccountInfo, EditorSaveBar, FormInput } from '$lib/components/forms';
	import {
		EntryContactForm,
		IdentitySection,
		DescriptionSection,
		BadgesSection
	} from '$lib/components/domain/entries';
	import { copyProfileLink } from '$lib/utils/share';
	import { InitiativeGoalsSection } from './sections';
	import * as m from '$lib/paraglide/messages.js';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import type { MainEntryFeature } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';
	import { createInitiative, updateInitiative } from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField, sectionsWithErrors, IDENTITY_FIELD_KEYS } from '$lib/utils/editor-form';
	import { toastSuccess, toastError } from '$lib/utils/toast';
	import {
		mainEntryFormFromFeature,
		mainEntryFormSchema,
		mapInitiativePayload
	} from '$lib/utils/editor-schema';

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

	// Remounted (via `{#key}` in the parent) whenever the initiative or mode
	// changes, so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(mainEntryFormFromFeature(entry), zod4(mainEntryFormSchema)), {
		validators: zod4Client(mainEntryFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { form: formData, errors, tainted, validateForm } = form;

	let isSaving = $state(false);

	const isCreate = $derived(!entry);
	const properties = $derived(
		entry?.properties.type === 'Initiative' ? entry.properties : undefined
	);
	const icon = $derived(getPlaceIcon('Initiative'));
	const goals = $derived(editorData?.goals ?? []);
	const badges = $derived(editorData?.badges ?? []);
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));

	async function handleShare() {
		const ok = await copyProfileLink();
		if (ok) {
			toastSuccess(m.entry_share_copied());
		} else {
			toastError(m.entry_share_failed());
		}
	}

	// Save-bar error indicator (Feature 9.4): initiatives only expose the
	// identity and description sections that can carry field-level errors.
	const sectionErrors = $derived(
		sectionsWithErrors($errors as Record<string, unknown>, [
			{ title: m.editor_section_identity(), fields: IDENTITY_FIELD_KEYS },
			{ title: m.editor_field_description(), fields: ['description'] }
		])
	);

	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

	let showContactForm = $state(false);

	async function handleSubmit() {
		if (isSaving) {
			return;
		}

		const result = await validateForm({ update: true });
		if (!result.valid) {
			return;
		}

		isSaving = true;
		try {
			const payload = mapInitiativePayload(result.data);
			let saved: MainEntryFeature;
			if (isCreate) {
				saved = await createInitiative(payload);
			} else {
				const id = entry?.properties.id;
				if (!id) {
					throw new Error(m.editor_error_missing_entry_id());
				}
				saved = await updateInitiative(id, payload);
			}

			guard.allowNavigation();
			toastSuccess(isCreate ? m.editor_entry_saved_created() : m.editor_entry_saved_updated());
			await onSaved?.(saved);
		} catch (error) {
			guard.blockNavigation();
			toastError(error instanceof Error ? error.message : m.editor_save_failed());
		} finally {
			isSaving = false;
		}
	}

	async function handleCancel() {
		if (guard.shouldBlockNavigation && !(await guard.confirmDiscardChanges())) {
			return;
		}

		guard.allowNavigation();
		try {
			await onCancel?.();
		} catch (error) {
			guard.blockNavigation();
			throw error;
		}
	}

	function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		void handleSubmit();
	}

	const title = $derived(
		isCreate
			? m.editor_create_initiative_title()
			: (properties?.name ?? m.editor_edit_initiative_title())
	);
</script>

<Sidebar.Header class="border-b">
	<div class="flex items-start justify-between gap-2">
		<div class="flex min-w-0 flex-1 items-start gap-3">
			<div class="mt-1 shrink-0 text-muted-foreground">
				<img class="size-9 object-contain" src={icon} alt={title} />
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				{#if mode === 'edit'}
					<FormInput
						id="entry-editor-name"
						data-testid="editor-input-name"
						label={m.editor_field_name()}
						required
						bind:value={$formData.name}
						error={$errors.name}
					/>
				{:else}
					<h2 class="text-lg leading-tight font-semibold text-foreground">{properties?.name}</h2>
				{/if}
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-1">
			{#if mode === 'edit'}
				<AppButton
					type="button"
					variant="outline"
					data-testid="entry-editor-cancel"
					onclick={() => void handleCancel()}
				>
					{m.editor_cancel()}
				</AppButton>
			{:else}
				{#if canEdit && onEdit}
					<AppButton variant="outline" data-testid="entry-detail-edit" onclick={onEdit}>
						{m.map_sidebar_action_edit()}
					</AppButton>
				{/if}
				<IconButton
					class="shrink-0"
					data-testid="entry-detail-share"
					label={m.entry_share_action()}
					onclick={() => void handleShare()}
				>
					<LinkIcon />
				</IconButton>
				<IconButton
					class="shrink-0"
					data-testid="entry-detail-close"
					label={m.map_token_feedback_dismiss()}
					onclick={onClose}
				>
					<XIcon />
				</IconButton>
			{/if}
		</div>
	</div>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	{#if mode === 'edit'}
		<form
			class="flex flex-col gap-4 p-4 pb-24"
			data-testid="entry-editor"
			onsubmit={handleFormSubmit}
		>
			<Paragraph size="small">{m.user_form_required_fields()}</Paragraph>
			<Paragraph size="small">{m.editor_initiative_intro()}</Paragraph>

			<IdentitySection mode="edit" {form} markerType="Initiative" />
			<DescriptionSection mode="edit" {form} />
			<EditorAccountInfo />
			<InitiativeGoalsSection mode="edit" {form} {goals} />
			<BadgesSection mode="edit" {form} {badges} idPrefix="initiative-badge" />

			<EditorSaveBar {isSaving} {sectionErrors} onCancel={() => void handleCancel()} />
		</form>
	{:else}
		<!-- `divide-y` draws separators only between rendered sections; empty
		     sections render no element, so no stray dividers appear (F12.2). -->
		<div
			class="flex flex-col divide-y divide-border p-4 [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0"
		>
			<IdentitySection mode="read" {properties} {form} markerType="Initiative" />
			<DescriptionSection mode="read" {properties} {form} />
			<InitiativeGoalsSection mode="read" {properties} {form} />
			<BadgesSection mode="read" {properties} {form} idPrefix="initiative-badge" />

			{#if properties && showContactForm}
				<EntryContactForm entryId={properties.id} entryType="Initiative" />
			{/if}
		</div>
	{/if}
</Sidebar.Content>

{#if mode === 'read' && properties && !showContactForm}
	<Sidebar.Footer class="border-t p-4">
		<AppButton
			type="button"
			class="w-full"
			data-testid="entry-contact-toggle"
			onclick={() => (showContactForm = true)}
		>
			{m.entry_contact_button()}
		</AppButton>
	</Sidebar.Footer>
{/if}
