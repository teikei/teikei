<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { AppButton } from '$lib/components/actions';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Heading, Paragraph } from '$lib/components/typography';
	import { EditorAccountInfo } from '$lib/components/forms';
	import {
		FarmProductsSection,
		FarmEconomicBehaviorSection,
		FarmMembershipSection
	} from '$lib/components/domain/farms/sections';
	import { InitiativeGoalsSection } from '$lib/components/domain/initiatives/sections';
	import IdentitySection from './sections/IdentitySection.svelte';
	import DescriptionSection from './sections/DescriptionSection.svelte';
	import BadgesSection from './sections/BadgesSection.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { MainEntryFeature } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';
	import { createFarm, createInitiative } from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import {
		hasTaintedField,
		fieldsHaveErrors,
		sectionsWithErrors,
		IDENTITY_FIELD_KEYS
	} from '$lib/utils/editor-form';
	import { toastSuccess, toastError } from '$lib/utils/toast';
	import {
		mainEntryFormFromFeature,
		mainEntryFormSchema,
		mapFarmPayload,
		mapInitiativePayload
	} from '$lib/utils/editor-schema';

	interface EntryCreationWizardProps {
		editorData: EntryEditorData;
		onCancel: () => void | Promise<void>;
		onCreated: (entry: MainEntryFeature) => void | Promise<void>;
	}

	let { editorData, onCancel, onCreated }: EntryCreationWizardProps = $props();

	const isFarm = $derived(editorData.entryType === 'Farm');

	// Fresh form for a new entry; the component is remounted per create route.
	const form = superForm(defaults(mainEntryFormFromFeature(undefined), zod4(mainEntryFormSchema)), {
		validators: zod4Client(mainEntryFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { errors, tainted, validateForm } = form;

	let isSaving = $state(false);
	let step = $state(0);

	const products = $derived(editorData.products);
	const goals = $derived(editorData.goals);
	const badges = $derived(editorData.badges);

	// Type-specific step definitions: identity & location → details →
	// membership (farm) / goals (initiative). `fields` gate step advancement.
	const farmSteps = $derived([
		{ title: m.editor_section_identity(), fields: IDENTITY_FIELD_KEYS },
		{
			title: m.editor_wizard_step_details(),
			fields: ['description', 'additionalProductInformation', 'economicalBehavior']
		},
		{
			title: m.editor_section_membership(),
			fields: ['foundedAtMonth', 'maximumMembers', 'participation']
		}
	]);
	const initiativeSteps = $derived([
		{ title: m.editor_section_identity(), fields: IDENTITY_FIELD_KEYS },
		{ title: m.editor_wizard_step_details(), fields: ['description'] },
		{ title: m.editor_section_goals(), fields: [] as string[] }
	]);
	const steps = $derived(isFarm ? farmSteps : initiativeSteps);
	const isLastStep = $derived(step >= steps.length - 1);

	const hasUnsavedChanges = $derived(hasTaintedField($tainted));
	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

	const title = $derived(
		isFarm ? m.editor_create_farm_title() : m.editor_create_initiative_title()
	);
	const sectionErrors = $derived(
		sectionsWithErrors(
			$errors as Record<string, unknown>,
			steps.map((s) => ({ title: s.title, fields: s.fields }))
		)
	);

	async function handleNext() {
		const result = await validateForm({ update: false });
		if (fieldsHaveErrors(result.errors as Record<string, unknown>, steps[step].fields)) {
			// Surface the current step's errors inline before blocking advancement.
			await validateForm({ update: true });
			return;
		}
		if (!isLastStep) {
			step += 1;
		}
	}

	async function handleCreate() {
		if (isSaving) {
			return;
		}

		const result = await validateForm({ update: true });
		if (!result.valid) {
			// Jump back to the first step still carrying an error.
			const firstBadStep = steps.findIndex((s) =>
				fieldsHaveErrors(result.errors as Record<string, unknown>, s.fields)
			);
			if (firstBadStep >= 0) {
				step = firstBadStep;
			}
			return;
		}

		isSaving = true;
		try {
			const saved: MainEntryFeature = isFarm
				? await createFarm(mapFarmPayload(result.data))
				: await createInitiative(mapInitiativePayload(result.data));

			guard.allowNavigation();
			toastSuccess(m.editor_entry_saved_created());
			await onCreated(saved);
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
			await onCancel();
		} catch (error) {
			guard.blockNavigation();
			throw error;
		}
	}

	function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isLastStep) {
			void handleCreate();
		} else {
			void handleNext();
		}
	}
</script>

<Sidebar.Header class="border-b">
	<div class="flex items-center justify-between gap-2">
		<div class="flex min-w-0 flex-col">
			<h2 class="text-lg font-semibold">{title}</h2>
			<p class="text-sm text-muted-foreground">
				{m.editor_wizard_progress({ current: step + 1, total: steps.length })}
			</p>
		</div>
		<AppButton
			type="button"
			variant="outline"
			data-testid="entry-editor-cancel"
			onclick={() => void handleCancel()}
		>
			{m.editor_cancel()}
		</AppButton>
	</div>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<form
		class="flex flex-col gap-4 p-4 pb-24"
		data-testid="entry-editor"
		data-wizard-step={step}
		onsubmit={handleFormSubmit}
	>
		<Paragraph size="small">{m.user_form_required_fields()}</Paragraph>

		<!-- Only the identity step needs its own caption: the later steps' sections
		     carry canonical ProfileSection headings (F4), which would duplicate. -->
		{#if step === 0}
			<Heading level={5} data-testid="wizard-step-title">{steps[step].title}</Heading>
		{/if}

		{#if step === 0}
			{#if isFarm}
				<IdentitySection mode="edit" {form} markerType="Farm" />
			{:else}
				<Paragraph size="small">{m.editor_initiative_intro()}</Paragraph>
				<IdentitySection mode="edit" {form} markerType="Initiative" />
			{/if}
			<EditorAccountInfo />
		{:else if step === 1}
			{#if isFarm}
				<DescriptionSection mode="edit" {form} />
				<FarmProductsSection mode="edit" {form} {products} />
				<FarmEconomicBehaviorSection mode="edit" {form} />
			{:else}
				<DescriptionSection mode="edit" {form} />
			{/if}
		{:else if isFarm}
			<FarmMembershipSection mode="edit" {form} />
			<BadgesSection mode="edit" {form} {badges} idPrefix="farm-badge" />
		{:else}
			<InitiativeGoalsSection mode="edit" {form} {goals} />
			<BadgesSection mode="edit" {form} {badges} idPrefix="initiative-badge" />
		{/if}

		<div
			class="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center justify-end gap-2 border-t bg-sidebar/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80"
		>
			{#if isLastStep && sectionErrors.length > 0}
				<p
					role="alert"
					data-testid="editor-error-summary"
					class="mr-auto w-full text-sm text-destructive sm:w-auto"
				>
					{m.editor_error_summary({ sections: sectionErrors.join(', ') })}
				</p>
			{/if}
			{#if step > 0}
				<AppButton
					type="button"
					variant="outline"
					data-testid="wizard-back"
					onclick={() => (step -= 1)}
				>
					{m.editor_wizard_back()}
				</AppButton>
			{/if}
			{#if isLastStep}
				<AppButton type="submit" data-testid="wizard-create" disabled={isSaving}>
					{#if isSaving}
						<Spinner data-icon="inline-start" />
					{/if}
					{isSaving ? m.editor_saving() : m.editor_wizard_create()}
				</AppButton>
			{:else}
				<AppButton type="submit" data-testid="wizard-next">
					{m.editor_wizard_next()}
				</AppButton>
			{/if}
		</div>
	</form>
</Sidebar.Content>
