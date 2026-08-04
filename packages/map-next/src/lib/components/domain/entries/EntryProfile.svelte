<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { MainEntryFeature, MainEntryProperties, MainEntryType } from '$lib/types/entries';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { EditorSectionErrorGroup } from '$lib/utils/editor-form';

	/**
	 * Handed to the section snippets. `properties` is the union type, so each
	 * profile narrows it on `type` before passing it to its own domain sections.
	 */
	export interface EntryProfileSectionContext {
		form: SuperForm<MainEntryFormData>;
		properties?: MainEntryProperties;
	}

	export interface EntryProfileProps {
		entryType: MainEntryType;
		/** The feature; undefined only when creating a new entry. */
		entry?: MainEntryFeature;
		mode: 'read' | 'edit';
		/** Whether the signed-in user owns this entry (Edit action, contact CTA). */
		canEdit?: boolean;
		onClose: () => void;
		onEdit?: () => void;
		onCancel?: () => void | Promise<void>;
		onSaved?: (entry: MainEntryFeature) => void | Promise<void>;
		/** Save-bar error sections beyond the shared identity + description ones. */
		extraErrorSections?: EditorSectionErrorGroup[];
		/** Extra read-mode header lines, rendered under the address and website. */
		headerMeta?: Snippet;
		editSections: Snippet<[EntryProfileSectionContext]>;
		readSections: Snippet<[EntryProfileSectionContext]>;
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import XIcon from '@lucide/svelte/icons/x';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { SidebarScrollArea } from '$lib/components/layout';
	import { AppButton, IconButton } from '$lib/components/actions';
	import { Paragraph } from '$lib/components/typography';
	import { EditorAccountInfo, EditorSaveBar } from '$lib/components/forms';
	import IdentitySection from './sections/IdentitySection.svelte';
	import DescriptionSection from './sections/DescriptionSection.svelte';
	import { formatEntryAddress } from '$lib/utils/entry-format';
	import { safeHttpUrl } from '$lib/utils/url';
	import { copyProfileLink } from '$lib/utils/share';
	import { routeBuilders } from '$lib/utils/routes';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import {
		createFarm,
		updateFarm,
		createInitiative,
		updateInitiative
	} from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField, sectionsWithErrors, IDENTITY_FIELD_KEYS } from '$lib/utils/editor-form';
	import { toastSuccess, toastError } from '$lib/utils/toast';
	import {
		mainEntryFormFromFeature,
		mainEntryFormSchema,
		mapFarmPayload,
		mapInitiativePayload
	} from '$lib/utils/editor-schema';

	let {
		entryType,
		entry,
		mode,
		canEdit = false,
		onClose,
		onEdit,
		onCancel,
		onSaved,
		extraErrorSections = [],
		headerMeta,
		editSections,
		readSections
	}: EntryProfileProps = $props();

	// Remounted (via `{#key}` in the parent) whenever the entry or mode changes,
	// so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(mainEntryFormFromFeature(entry), zod4(mainEntryFormSchema)), {
		validators: zod4Client(mainEntryFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { errors, tainted, validateForm } = form;

	let isSaving = $state(false);

	// Everything that differs between the two entry types. Layout does not: both
	// use the same header/footer padding and the same edit-section dividers.
	const config = $derived(
		entryType === 'Farm'
			? {
					createTitle: m.editor_create_farm_title(),
					editTitle: m.editor_edit_farm_title(),
					contactHref: routeBuilders.farm.contact,
					save: (data: MainEntryFormData, id?: string) =>
						id ? updateFarm(id, mapFarmPayload(data)) : createFarm(mapFarmPayload(data)),
					// Farms have no equivalent of the initiative intro copy.
					intro: undefined
				}
			: {
					createTitle: m.editor_create_initiative_title(),
					editTitle: m.editor_edit_initiative_title(),
					contactHref: routeBuilders.initiative.contact,
					save: (data: MainEntryFormData, id?: string) =>
						id
							? updateInitiative(id, mapInitiativePayload(data))
							: createInitiative(mapInitiativePayload(data)),
					intro: m.editor_initiative_intro()
				}
	);

	const isCreate = $derived(!entry);
	const properties = $derived(entry?.properties.type === entryType ? entry.properties : undefined);
	const icon = $derived(getPlaceIcon(entryType));
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));
	// Header meta (F12.1): location and website live in the drawer header.
	const address = $derived(properties ? formatEntryAddress(properties) : '');
	const websiteUrl = $derived(properties?.url ? safeHttpUrl(properties.url) : undefined);
	const sectionContext = $derived({ form, properties });

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
			...extraErrorSections
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
			let saved: MainEntryFeature;
			if (isCreate) {
				saved = await config.save(result.data);
			} else {
				const id = entry?.properties.id;
				if (!id) {
					throw new Error(m.editor_error_missing_entry_id());
				}
				saved = await config.save(result.data, id);
			}

			guard.allowNavigation();
			toastSuccess(isCreate ? m.editor_entry_saved_created() : m.editor_entry_saved_updated());
			await onSaved?.(saved);
		} catch (error) {
			guard.blockNavigation();
			toastError(resolveApiErrorMessage(error, m.editor_save_failed()));
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

	const title = $derived(isCreate ? config.createTitle : (properties?.name ?? config.editTitle));
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
					{@render headerMeta?.()}
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

<SidebarScrollArea>
	{#if mode === 'edit'}
		<form class="flex flex-col p-4 pb-24" data-testid="entry-editor" onsubmit={handleFormSubmit}>
			<Paragraph size="small" class={config.intro ? 'pb-1' : 'pb-6'}>
				{m.user_form_required_fields()}
			</Paragraph>
			{#if config.intro}
				<Paragraph size="small" class="pb-6">{config.intro}</Paragraph>
			{/if}

			<!-- Same section sequence and divider rhythm as read mode (F4.2 parity);
			     only the section bodies swap to form controls. -->
			<div class="flex flex-col [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
				<IdentitySection mode="edit" {form} markerType={entryType} />
				<DescriptionSection mode="edit" {form} />
				<EditorAccountInfo />
				{@render editSections(sectionContext)}
			</div>

			<EditorSaveBar {isSaving} {sectionErrors} onCancel={() => void handleCancel()} />
		</form>
	{:else}
		<!-- Identity (name/location/website) lives in the drawer header in read
		     mode; the Identity section only appears in edit mode. -->
		<div class="flex flex-col p-4 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
			<DescriptionSection mode="read" {properties} {form} />
			{@render readSections(sectionContext)}
		</div>
	{/if}
</SidebarScrollArea>

<!-- Feature 5.3: the CTA is hidden on entries the current account owns
     (`canEdit`), who edit rather than contact themselves. -->
{#if mode === 'read' && properties && !canEdit}
	<Sidebar.Footer class="border-t border-separator p-2">
		<AppButton
			type="button"
			class="w-full"
			data-testid="entry-contact-toggle"
			onclick={() => void goto(config.contactHref(properties.id))}
		>
			{m.entry_contact_button()}
		</AppButton>
	</Sidebar.Footer>
{/if}
