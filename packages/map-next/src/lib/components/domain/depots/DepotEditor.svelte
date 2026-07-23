<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Paragraph } from '$lib/components/typography';
	import {
		EditorAccountInfo,
		EditorSaveBar,
		FormInput,
		FormTextarea,
		GeocoderField,
		MultiSelectCombobox
	} from '$lib/components/forms';
	import type { DepotFeature } from '$lib/types/entries';
	import type { DepotEditorData } from '$lib/types/editor';
	import { createDepot, updateDepot } from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField, type CommonFormState } from '$lib/utils/editor-form';
	import { depotFormFromFeature, depotFormSchema, mapDepotPayload } from '$lib/utils/editor-schema';
	import { translateErrors } from '$lib/utils/translate-error';
	import { toastError } from '$lib/utils/toast';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';

	interface DepotEditorProps {
		editorData: DepotEditorData;
		entry?: DepotFeature;
		/**
		 * When creating a depot in the context of a farm profile, the association
		 * is fixed to this farm and the farm selector is hidden (Feature 8).
		 */
		presetFarmId?: string | null;
		onCancel: () => void | Promise<void>;
		onSaved: (entry: DepotFeature) => void | Promise<void>;
	}

	let { editorData, entry, presetFarmId = null, onCancel, onSaved }: DepotEditorProps = $props();

	// Remounted per depot via `{#key}`, so the initial prop values are the intended ones.
	// svelte-ignore state_referenced_locally
	const isPresetFarm = editorData.mode === 'create' && !!presetFarmId;
	const presetFarmName = $derived(
		presetFarmId
			? editorData.farmOptions.find((option) => option.id === presetFarmId)?.name
			: undefined
	);

	// This component is remounted (via `{#key}` in the parent) whenever the edited
	// depot changes, so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const initialFormData =
		isPresetFarm && presetFarmId
			? { ...depotFormFromFeature(entry), farms: [presetFarmId] }
			: depotFormFromFeature(entry);
	const form = superForm(defaults(initialFormData, zod4(depotFormSchema)), {
		validators: zod4Client(depotFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { form: formData, errors, tainted, validateForm } = form;

	let isSaving = $state(false);
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));
	const farmsError = $derived(translateErrors($errors.farms?._errors));

	// Connecting a foreign farm is a deliberate opt-in; unchecked by default.
	let connectForeignFarms = $state(false);
	// A farm already selected before the checkbox is unchecked stays visible as a
	// removable chip instead of silently remaining in $formData.farms unseen.
	const selectedForeignFarmOptions = $derived(
		editorData.allFarmOptions.filter(
			(option) =>
				$formData.farms.includes(option.id) &&
				!editorData.farmOptions.some((owned) => owned.id === option.id)
		)
	);
	const farmOptionsInScope = $derived(
		connectForeignFarms
			? editorData.allFarmOptions
			: [...editorData.farmOptions, ...selectedForeignFarmOptions]
	);
	const farmComboboxOptions = $derived(
		farmOptionsInScope.map((option) => ({ value: option.id, label: option.name }))
	);

	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

	const title = $derived(
		editorData.mode === 'create' ? m.editor_create_depot_title() : m.editor_edit_depot_title()
	);

	function setCommonField(field: keyof CommonFormState, value: string) {
		$formData[field] = value;
	}

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
			const payload = mapDepotPayload(result.data);
			let saved: DepotFeature;

			if (editorData.mode === 'create') {
				saved = await createDepot(payload);
			} else {
				const depotId = entry?.properties.id;
				if (!depotId) {
					throw new Error(m.editor_error_missing_entry_id());
				}
				saved = await updateDepot(depotId, payload);
			}

			guard.allowNavigation();
			await onSaved(saved);
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
		void handleSubmit();
	}
</script>

<Sidebar.Header class="border-b border-separator">
	<!-- Edit mode keeps a single Cancel affordance in the sticky save bar (F4.3). -->
	<h2 class="text-lg font-semibold">{title}</h2>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<form
		class="flex flex-col gap-4 p-4 pb-24"
		data-testid="depot-editor"
		onsubmit={handleFormSubmit}
	>
		<Paragraph size="small">{m.user_form_required_fields()}</Paragraph>

		<div class="grid grid-cols-1 gap-4">
			<FormInput
				id="depot-editor-name"
				data-testid="depot-input-name"
				label={m.editor_field_name()}
				required
				bind:value={$formData.name}
				error={$errors.name}
			/>

			<FormInput
				id="depot-editor-url"
				label={m.editor_field_url()}
				bind:value={$formData.url}
				error={$errors.url}
			/>

			{#if isPresetFarm}
				<Field.Set class="rounded-md border p-3">
					<Field.Legend variant="label">{m.editor_depot_field_farms()}</Field.Legend>
					<Field.Description data-testid="depot-preset-farm">
						{presetFarmName ?? ''}
					</Field.Description>
				</Field.Set>
			{:else}
				<Field.Field data-invalid={!!farmsError}>
					<Field.Label for="depot-editor-farms">{m.editor_depot_field_farms()}</Field.Label>
					{#if editorData.mode === 'create'}
						<Field.Description>{m.editor_depot_own_farm_hint()}</Field.Description>
					{/if}
					{#if farmOptionsInScope.length === 0}
						<Field.Description>{m.editor_depot_no_farms_available()}</Field.Description>
					{:else}
						<MultiSelectCombobox
							id="depot-editor-farms"
							data-testid="depot-input-farms"
							options={farmComboboxOptions}
							bind:value={$formData.farms}
							placeholder={m.editor_depot_farms_placeholder()}
							emptyText={m.editor_depot_farms_empty()}
							removeLabel={m.editor_depot_farms_remove()}
							invalid={!!farmsError}
						/>
					{/if}
					{#if farmsError}
						<Field.Error>{farmsError}</Field.Error>
					{/if}
				</Field.Field>
				{#if editorData.mode === 'create'}
					<Field.Field orientation="horizontal">
						<Checkbox
							id="depot-editor-connect-foreign-farms"
							data-testid="depot-input-connect-foreign-farms"
							bind:checked={connectForeignFarms}
						/>
						<Field.Label for="depot-editor-connect-foreign-farms" class="font-normal">
							{m.editor_depot_connect_foreign_farms()}
						</Field.Label>
					</Field.Field>
				{/if}
			{/if}

			<GeocoderField
				id="depot-editor-address"
				label={m.editor_field_address()}
				testIdPrefix="depot-input"
				markerType="Depot"
				required
				fields={$formData}
				onFieldChange={setCommonField}
				error={$errors.city ?? $errors.latitude ?? $errors.longitude}
			/>

			<FormTextarea
				id="depot-editor-description"
				label={m.editor_field_description()}
				rows={4}
				bind:value={$formData.description}
				error={$errors.description}
			/>

			<FormInput
				id="depot-editor-delivery-days"
				label={m.editor_depot_field_delivery_days()}
				bind:value={$formData.deliveryDays}
			/>

			<EditorAccountInfo />
		</div>

		<EditorSaveBar {isSaving} testIdPrefix="depot-editor" onCancel={() => void handleCancel()} />
	</form>
</Sidebar.Content>
