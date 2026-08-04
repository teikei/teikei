<script lang="ts">
	import { goto } from '$app/navigation';
	import XIcon from '@lucide/svelte/icons/x';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton, IconButton } from '$lib/components/actions';
	import { Paragraph } from '$lib/components/typography';
	import { EditorAccountInfo, EditorSaveBar } from '$lib/components/forms';
	import {
		IdentitySection,
		DescriptionSection,
		BadgesSection
	} from '$lib/components/domain/entries';
	import { formatFoundedLine, formatEntryAddress } from '$lib/utils/entry-format';
	import { safeHttpUrl } from '$lib/utils/url';
	import { copyProfileLink } from '$lib/utils/share';
	import { routeBuilders } from '$lib/utils/routes';
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
	const { errors, tainted, validateForm } = form;

	let isSaving = $state(false);

	const isCreate = $derived(!entry);
	const properties = $derived(entry?.properties.type === 'Farm' ? entry.properties : undefined);
	const icon = $derived(getPlaceIcon('Farm'));
	const products = $derived(editorData?.products ?? []);
	const badges = $derived(editorData?.badges ?? []);
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));
	// Header meta (F12.1): founded line, location, and website live in the drawer
	// header. The membership status chip moved into the Membership section.
	const foundedLine = $derived(properties ? formatFoundedLine(properties) : '');
	const address = $derived(properties ? formatEntryAddress(properties) : '');
	const websiteUrl = $derived(properties?.url ? safeHttpUrl(properties.url) : undefined);

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
	// titles match the canonical section headings (DESIGN.md, F4.1).
	const sectionErrors = $derived(
		sectionsWithErrors($errors as Record<string, unknown>, [
			{ title: m.editor_section_identity(), fields: IDENTITY_FIELD_KEYS },
			{ title: m.editor_section_description(), fields: ['description'] },
			{ title: m.editor_section_products(), fields: ['additionalProductInformation'] },
			{ title: m.editor_section_economic(), fields: ['economicalBehavior'] },
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

<Sidebar.Header class="border-b border-separator p-2">
	<div class="flex items-start justify-between gap-2">
		<div class="flex min-w-0 flex-1 items-start gap-3">
			<div class="shrink-0 text-muted-foreground">
				<img class="size-9 object-contain" src={icon} alt={title} />
			</div>
			<div class="mt-1 flex min-w-0 flex-1 flex-col gap-1">
				<!-- The entry name is the header heading in both modes (F4.2); the
				     editable name field lives inside the Identity section. -->
				<h2 class="text-lg leading-tight font-semibold text-foreground">{title}</h2>
				{#if mode === 'read'}
					{#if address}
						<Paragraph size="small" muted data-testid="entry-detail-address">
							{address}
						</Paragraph>
					{/if}
					{#if websiteUrl}
						<a
							href={websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							data-testid="entry-detail-website"
							class="flex w-fit max-w-full items-center gap-1 text-sm text-primary hover:underline"
						>
							<span class="truncate">{websiteUrl}</span>
							<ExternalLinkIcon class="size-3 shrink-0" />
						</a>
					{/if}
					{#if foundedLine}
						<Paragraph size="small" muted>{foundedLine}</Paragraph>
					{/if}
				{/if}
			</div>
		</div>
		<!-- Edit mode keeps a single Cancel affordance in the sticky save bar (F4.3). -->
		{#if mode === 'read'}
			<div class="flex shrink-0 items-center gap-1">
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
			</div>
		{/if}
	</div>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	{#if mode === 'edit'}
		<form class="flex flex-col p-4 pb-24" data-testid="entry-editor" onsubmit={handleFormSubmit}>
			<Paragraph size="small" class="pb-6">{m.user_form_required_fields()}</Paragraph>

			<!-- Same section sequence and divider rhythm as read mode (F4.2 parity);
			     only the section bodies swap to form controls. -->
			<div class="flex flex-col divide-y [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
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
			</div>

			<EditorSaveBar {isSaving} {sectionErrors} onCancel={() => void handleCancel()} />
		</form>
	{:else}
		<!-- Identity (name/location/website) lives in the drawer header in read
		     mode; the Identity section only appears in edit mode. `divide-y`
		     draws separators only between rendered sections, so empty sections
		     produce no stray dividers (F12.2). -->
		<div class="flex flex-col p-4 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
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
	<Sidebar.Footer class="border-t border-separator p-2">
		<AppButton
			type="button"
			class="w-full"
			data-testid="entry-contact-toggle"
			onclick={() => void goto(routeBuilders.farm.contact(properties.id))}
		>
			{m.entry_contact_button()}
		</AppButton>
	</Sidebar.Footer>
{/if}
