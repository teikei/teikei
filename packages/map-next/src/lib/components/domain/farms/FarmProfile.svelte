<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton, IconButton } from '$lib/components/actions';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Paragraph } from '$lib/components/typography';
	import { EditorAccountInfo, FormInput } from '$lib/components/forms';
	import { EntryContactForm } from '$lib/components/domain/entries';
	import {
		FarmIdentitySection,
		FarmDescriptionSection,
		FarmProductsSection,
		FarmEconomicBehaviorSection,
		FarmMembershipSection,
		FarmBadgesSection,
		FarmDepotsSection
	} from './sections';
	import * as m from '$lib/paraglide/messages.js';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import type { DepotFeature, MainEntryFeature } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';
	import { createFarm, updateFarm } from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField } from '$lib/utils/editor-form';
	import { toastSuccess, toastError } from '$lib/utils/toast';
	import {
		mainEntryFormFromFeature,
		mainEntryFormSchema,
		mapFarmPayload
	} from '$lib/utils/editor-schema';

	interface FarmProfileProps {
		/** The farm feature; undefined only when creating a new farm. */
		entry?: MainEntryFeature;
		mode: 'read' | 'edit';
		/** Catalog data (products/badges) — present in edit/create mode. */
		editorData?: EntryEditorData;
		/** Whether the signed-in user owns this farm (Edit action + depot affordances). */
		canEdit?: boolean;
		ownedDepotIds?: ReadonlySet<string>;
		onClose: () => void;
		onEdit?: () => void;
		onCancel?: () => void | Promise<void>;
		onSaved?: (entry: MainEntryFeature) => void | Promise<void>;
		onDepotSelect?: (depot: DepotFeature) => void;
		onDepotEdit?: (depot: DepotFeature) => void;
		onDepotDelete?: (depot: DepotFeature) => void;
		onAddDepot?: () => void;
	}

	let {
		entry,
		mode,
		editorData,
		canEdit = false,
		ownedDepotIds,
		onClose,
		onEdit,
		onCancel,
		onSaved,
		onDepotSelect,
		onDepotEdit,
		onDepotDelete,
		onAddDepot
	}: FarmProfileProps = $props();

	// Remounted (via `{#key}` in the parent) whenever the farm or mode changes,
	// so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(mainEntryFormFromFeature(entry), zod4(mainEntryFormSchema)), {
		validators: zod4Client(mainEntryFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { form: formData, errors, tainted, validateForm } = form;

	let isSaving = $state(false);

	const isCreate = $derived(!entry);
	const properties = $derived(entry?.properties.type === 'Farm' ? entry.properties : undefined);
	const icon = $derived(getPlaceIcon('Farm'));
	const products = $derived(editorData?.products ?? []);
	const badges = $derived(editorData?.badges ?? []);
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));

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
			const payload = mapFarmPayload(result.data);
			let saved: MainEntryFeature;
			if (isCreate) {
				saved = await createFarm(payload);
			} else {
				const id = entry?.properties.id;
				if (!id) {
					throw new Error(m.editor_error_missing_entry_id());
				}
				saved = await updateFarm(id, payload);
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
		isCreate ? m.editor_create_farm_title() : (properties?.name ?? m.editor_edit_farm_title())
	);
</script>

<Sidebar.Header class="border-b">
	<div class="flex items-start justify-between gap-2">
		<div class="flex min-w-0 flex-1 items-start gap-3">
			<div class="mt-1 shrink-0 text-muted-foreground">
				<img class="size-9 object-contain" src={icon} alt={title} />
			</div>
			<div class="min-w-0 flex-1">
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
					<h2 class="text-lg leading-tight font-semibold">{properties?.name}</h2>
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

			<FarmIdentitySection mode="edit" {form} />
			<FarmDescriptionSection mode="edit" {form} />
			<EditorAccountInfo />
			<FarmProductsSection mode="edit" {form} {products} />
			<FarmEconomicBehaviorSection mode="edit" {form} />
			<FarmMembershipSection mode="edit" {form} />
			<FarmBadgesSection mode="edit" {form} {badges} />
			<FarmDepotsSection
				{properties}
				{ownedDepotIds}
				isFarmOwner={canEdit}
				{onDepotSelect}
				{onDepotEdit}
				{onDepotDelete}
				{onAddDepot}
			/>

			<div
				class="sticky bottom-0 -mx-4 mt-4 flex items-center justify-end gap-2 border-t bg-sidebar/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80"
			>
				<AppButton
					type="button"
					variant="outline"
					data-testid="entry-editor-cancel-footer"
					onclick={() => void handleCancel()}
				>
					{m.editor_cancel()}
				</AppButton>
				<AppButton type="submit" data-testid="entry-editor-save" disabled={isSaving}>
					{#if isSaving}
						<Spinner data-icon="inline-start" />
					{/if}
					{isSaving ? m.editor_saving() : m.editor_save()}
				</AppButton>
			</div>
		</form>
	{:else}
		<div class="flex flex-col gap-4 p-4">
			<FarmIdentitySection mode="read" {properties} {form} />
			<FarmDescriptionSection mode="read" {properties} {form} />
			<FarmProductsSection mode="read" {properties} {form} />
			<FarmEconomicBehaviorSection mode="read" {properties} {form} />
			<FarmMembershipSection mode="read" {properties} {form} />
			<FarmBadgesSection mode="read" {properties} {form} />
			<FarmDepotsSection
				{properties}
				{ownedDepotIds}
				isFarmOwner={canEdit}
				{onDepotSelect}
				{onDepotEdit}
				{onDepotDelete}
				{onAddDepot}
			/>

			{#if properties}
				<div class="rounded-md border p-3">
					{#if showContactForm}
						<EntryContactForm entryId={properties.id} entryType="Farm" />
					{:else}
						<AppButton
							type="button"
							variant="outline"
							data-testid="entry-contact-toggle"
							onclick={() => (showContactForm = true)}
						>
							{m.entry_contact_button()}
						</AppButton>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</Sidebar.Content>
