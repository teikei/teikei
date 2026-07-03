<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Spinner } from '$lib/components/ui/spinner';
	import { AppButton } from '$lib/components/actions';
	import { Paragraph } from '$lib/components/typography';
	import { AddressFields, EditorAccountInfo, FormInput, FormTextarea } from '$lib/components/forms';
	import type { DepotFeature } from '$lib/types/entries';
	import type { DepotEditorData } from '$lib/types/editor';
	import { createDepot, updateDepot } from '$lib/api/entry-mutations';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField, toggleSelection, type CommonFormState } from '$lib/utils/editor-form';
	import { depotFormFromFeature, depotFormSchema, mapDepotPayload } from '$lib/utils/editor-schema';
	import { translateErrors } from '$lib/utils/translate-error';
	import { toastError } from '$lib/utils/toast';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';

	interface DepotEditorProps {
		editorData: DepotEditorData;
		entry?: DepotFeature;
		onCancel: () => void | Promise<void>;
		onSaved: (entry: DepotFeature) => void | Promise<void>;
	}

	let { editorData, entry, onCancel, onSaved }: DepotEditorProps = $props();

	// This component is remounted (via `{#key}` in the parent) whenever the edited
	// depot changes, so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(depotFormFromFeature(entry), zod4(depotFormSchema)), {
		validators: zod4Client(depotFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { form: formData, errors, tainted, validateForm } = form;

	let isSaving = $state(false);
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));
	const farmsError = $derived(translateErrors($errors.farms?._errors));

	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

	const title = $derived(
		editorData.mode === 'create' ? m.editor_create_depot_title() : m.editor_edit_depot_title()
	);

	function toggleFarmSelection(farmId: string, enabled: boolean) {
		$formData.farms = toggleSelection($formData.farms, farmId, enabled);
	}

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

<Sidebar.Header class="border-b">
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-lg font-semibold">{title}</h2>
		<AppButton
			type="button"
			variant="outline"
			data-testid="depot-editor-cancel"
			onclick={() => void handleCancel()}
		>
			{m.editor_cancel()}
		</AppButton>
	</div>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<form
		class="flex flex-col gap-4 p-4 pb-24"
		data-testid="depot-editor"
		onsubmit={handleFormSubmit}
	>
		<Paragraph size="small">{m.user_form_required_fields()}</Paragraph>

		<div class="grid grid-cols-1 gap-3">
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

			<Field.Set class="rounded-md border p-3" data-invalid={!!farmsError}>
				<Field.Legend variant="label">{m.editor_depot_field_farms()}</Field.Legend>
				{#if editorData.farmOptions.length === 0}
					<Field.Description>{m.editor_depot_no_farms_available()}</Field.Description>
				{:else}
					<Field.Group class="max-h-44 gap-2 overflow-y-auto">
						{#each editorData.farmOptions as farmOption (farmOption.id)}
							<Field.Field orientation="horizontal">
								<Checkbox
									id={`depot-farm-${farmOption.id}`}
									checked={$formData.farms.includes(farmOption.id)}
									onCheckedChange={(checked) =>
										toggleFarmSelection(farmOption.id, checked === true)}
								/>
								<Field.Label for={`depot-farm-${farmOption.id}`} class="font-normal">
									{farmOption.name}
								</Field.Label>
							</Field.Field>
						{/each}
					</Field.Group>
				{/if}
				{#if farmsError}
					<Field.Error>{farmsError}</Field.Error>
				{/if}
			</Field.Set>

			<AddressFields
				fields={$formData}
				idPrefix="depot-editor"
				testIdPrefix="depot-input"
				onFieldChange={setCommonField}
				errors={$errors}
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

		<div
			class="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t bg-sidebar/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80"
		>
			<AppButton
				type="button"
				variant="outline"
				data-testid="depot-editor-cancel-footer"
				onclick={() => void handleCancel()}
			>
				{m.editor_cancel()}
			</AppButton>
			<AppButton type="submit" disabled={isSaving} data-testid="depot-editor-save">
				{#if isSaving}
					<Spinner data-icon="inline-start" />
				{/if}
				{isSaving ? m.editor_saving() : m.editor_save()}
			</AppButton>
		</div>
	</form>
</Sidebar.Content>
