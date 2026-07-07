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
		EntryContactView,
		MembershipStatus,
		IdentitySection,
		DescriptionSection,
		BadgesSection
	} from '$lib/components/domain/entries';
	import { authStore } from '$lib/stores/auth.svelte';
	import { formatFoundedLine } from '$lib/utils/entry-format';
	import { copyProfileLink } from '$lib/utils/share';
	import {
		FarmProductsSection,
		FarmEconomicBehaviorSection,
		FarmMembershipSection,
		FarmDepotsSection
	} from './sections';
	import * as m from '$lib/paraglide/messages.js';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import type { DepotFeature, MainEntryFeature } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';
	import { createFarm, updateFarm } from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField, sectionsWithErrors, IDENTITY_FIELD_KEYS } from '$lib/utils/editor-form';
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
	// Header meta (F12.1): founded line and membership status chip live in the
	// header, consistent with the entry-card styling.
	const foundedLine = $derived(properties ? formatFoundedLine(properties) : '');
	const acceptsNewMembers = $derived(properties?.acceptsNewMembers);

	async function handleShare() {
		const ok = await copyProfileLink();
		if (ok) {
			toastSuccess(m.entry_share_copied());
		} else {
			toastError(m.entry_share_failed());
		}
	}

	// Save-bar error indicator (Feature 9.4): map each section to its fields so
	// the sticky bar can name which sections still have validation errors. The
	// name input lives in the header but belongs to the identity section.
	const sectionErrors = $derived(
		sectionsWithErrors($errors as Record<string, unknown>, [
			{ title: m.editor_section_identity(), fields: IDENTITY_FIELD_KEYS },
			{ title: m.editor_field_description(), fields: ['description'] },
			{ title: m.editor_field_products(), fields: ['additionalProductInformation'] },
			{ title: m.editor_field_economical_behavior(), fields: ['economicalBehavior'] },
			{
				title: m.editor_section_membership(),
				fields: ['foundedAtMonth', 'maximumMembers', 'participation']
			}
		])
	);

	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

	// Feature 5: the contact CTA opens a dedicated drawer view (not an appended
	// section). Sender fields prefill from the session but stay editable.
	let showContactForm = $state(false);
	const contactPrefillName = $derived(authStore.user?.name ?? '');
	const contactPrefillEmail = $derived(authStore.user?.email ?? '');

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

<!-- `!canEdit` also gates the view (not just the CTA): ownership resolves async
     (myEntries load), so an owner can open contact before `canEdit` flips true —
     re-checking here unmounts the view the moment ownership is known (F5.3). -->
{#if mode === 'read' && showContactForm && properties && !canEdit}
	<EntryContactView
		entryId={properties.id}
		entryType="Farm"
		entryName={properties.name}
		initialName={contactPrefillName}
		initialEmail={contactPrefillEmail}
		onBack={() => (showContactForm = false)}
	/>
{:else}
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
						{#if foundedLine}
							<Paragraph size="small" muted>{foundedLine}</Paragraph>
						{/if}
						{#if acceptsNewMembers}
							<MembershipStatus {acceptsNewMembers} detailed />
						{/if}
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

				<IdentitySection mode="edit" {form} markerType="Farm" />
				<DescriptionSection mode="edit" {form} />
				<EditorAccountInfo />
				<FarmProductsSection mode="edit" {form} {products} />
				<FarmEconomicBehaviorSection mode="edit" {form} />
				<FarmMembershipSection mode="edit" {form} />
				<BadgesSection mode="edit" {form} {badges} idPrefix="farm-badge" />
				<FarmDepotsSection
					{properties}
					{ownedDepotIds}
					isFarmOwner={canEdit}
					{onDepotSelect}
					{onDepotEdit}
					{onDepotDelete}
					{onAddDepot}
				/>

				<EditorSaveBar {isSaving} {sectionErrors} onCancel={() => void handleCancel()} />
			</form>
		{:else}
			<!-- `divide-y` draws separators only between rendered sections; empty
		     sections render no element, so no stray dividers appear (F12.2). -->
			<div
				class="flex flex-col divide-y divide-border p-4 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0"
			>
				<IdentitySection mode="read" {properties} {form} markerType="Farm" />
				<DescriptionSection mode="read" {properties} {form} />
				<FarmProductsSection mode="read" {properties} {form} />
				<FarmEconomicBehaviorSection mode="read" {properties} {form} />
				<FarmMembershipSection mode="read" {properties} {form} />
				<BadgesSection mode="read" {properties} {form} idPrefix="farm-badge" />
				<FarmDepotsSection
					{properties}
					{ownedDepotIds}
					isFarmOwner={canEdit}
					{onDepotSelect}
					{onDepotEdit}
					{onDepotDelete}
					{onAddDepot}
				/>
			</div>
		{/if}
	</Sidebar.Content>

	<!-- Feature 5.3: the CTA is hidden on entries the current account owns
	     (`canEdit`), who edit rather than contact themselves. -->
	{#if mode === 'read' && properties && !canEdit}
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
{/if}
