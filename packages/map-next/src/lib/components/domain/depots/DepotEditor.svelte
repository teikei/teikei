<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Spinner } from '$lib/components/ui/spinner';
	import { AppButton } from '$lib/components/actions';
	import { AddressFields, FormInput, FormTextarea } from '$lib/components/forms';
	import type { DepotFeature } from '$lib/types/entries';
	import type { DepotEditorData } from '$lib/types/editor';
	import { createDepot, type DepotMutationPayload, updateDepot } from '$lib/api/entry-mutations';
	import {
		hasUnsavedSnapshotChanges,
		serializeFormSnapshot
	} from '$lib/utils/unsaved-changes-guard';
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import {
		type CommonFormState,
		createEmptyCommonForm,
		mapCommonAddressPayload,
		nullIfEmpty,
		parseRelationId,
		toCommonFormState,
		toggleSelection
	} from '$lib/utils/editor-form';
	import * as m from '$lib/paraglide/messages.js';

	interface DepotEditorProps {
		editorData: DepotEditorData;
		entry?: DepotFeature;
		onCancel: () => void | Promise<void>;
		onSaved: (entry: DepotFeature) => void | Promise<void>;
	}

	interface DepotFormState extends CommonFormState {
		deliveryDays: string;
		farms: string[];
	}

	let { editorData, entry, onCancel, onSaved }: DepotEditorProps = $props();

	// This component is remounted (via `{#key}` in the parent) whenever the edited
	// depot changes, so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const initialForm = toDepotFormState(entry);
	const initialFormSnapshot = serializeFormSnapshot(initialForm);

	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);
	let form = $state<DepotFormState>(initialForm);
	const hasUnsavedChanges = $derived(hasUnsavedSnapshotChanges(form, initialFormSnapshot));

	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

	const title = $derived(
		editorData.mode === 'create' ? m.editor_create_depot_title() : m.editor_edit_depot_title()
	);

	function createEmptyForm(): DepotFormState {
		return {
			...createEmptyCommonForm(),
			deliveryDays: '',
			farms: []
		};
	}

	function toDepotFormState(depot: DepotFeature | undefined): DepotFormState {
		const base = createEmptyForm();
		if (!depot) {
			return base;
		}

		const props = depot.properties;
		return {
			...base,
			...toCommonFormState(depot),
			deliveryDays: props.deliveryDays ?? '',
			farms: (props.farms?.features ?? []).map((farm) => String(farm.properties.id))
		};
	}

	function mapDepotPayload(nextForm: DepotFormState): DepotMutationPayload {
		return {
			...mapCommonAddressPayload(nextForm),
			deliveryDays: nullIfEmpty(nextForm.deliveryDays),
			farms: nextForm.farms.map(parseRelationId)
		};
	}

	function toggleFarmSelection(farmId: string, enabled: boolean) {
		form.farms = toggleSelection(form.farms, farmId, enabled);
	}

	function setCommonField(field: keyof CommonFormState, value: string) {
		form[field] = value;
	}

	async function handleSubmit() {
		if (isSaving) {
			return;
		}

		if (form.farms.length === 0) {
			errorMessage = m.editor_depot_error_missing_farm();
			return;
		}

		isSaving = true;
		errorMessage = null;

		try {
			const payload = mapDepotPayload(form);
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
			errorMessage = error instanceof Error ? error.message : m.editor_save_failed();
		} finally {
			isSaving = false;
		}
	}

	async function handleCancel() {
		if (guard.shouldBlockNavigation && !guard.confirmDiscardChanges()) {
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
	{#if errorMessage}
		<p class="mt-2 text-sm text-destructive">{errorMessage}</p>
	{/if}
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<form
		class="flex flex-col gap-4 p-4 pb-24"
		data-testid="depot-editor"
		onsubmit={handleFormSubmit}
	>
		<div class="grid grid-cols-1 gap-3">
			<FormInput
				id="depot-editor-name"
				data-testid="depot-input-name"
				label={m.editor_field_name()}
				bind:value={form.name}
			/>

			<FormInput id="depot-editor-url" label={m.editor_field_url()} bind:value={form.url} />

			<Field.Set class="rounded-md border p-3">
				<Field.Legend variant="label">{m.editor_depot_field_farms()}</Field.Legend>
				{#if editorData.farmOptions.length === 0}
					<Field.Description>{m.editor_depot_no_farms_available()}</Field.Description>
				{:else}
					<Field.Group class="max-h-44 gap-2 overflow-y-auto">
						{#each editorData.farmOptions as farmOption (farmOption.id)}
							<Field.Field orientation="horizontal">
								<Checkbox
									id={`depot-farm-${farmOption.id}`}
									checked={form.farms.includes(farmOption.id)}
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
			</Field.Set>

			<AddressFields
				fields={form}
				idPrefix="depot-editor"
				testIdPrefix="depot-input"
				onFieldChange={setCommonField}
			/>

			<FormTextarea
				id="depot-editor-description"
				label={m.editor_field_description()}
				rows={4}
				bind:value={form.description}
			/>

			<FormInput
				id="depot-editor-delivery-days"
				label={m.editor_depot_field_delivery_days()}
				bind:value={form.deliveryDays}
			/>
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
