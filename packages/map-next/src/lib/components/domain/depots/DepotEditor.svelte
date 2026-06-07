<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Spinner } from '$lib/components/ui/spinner';
	import { AppButton } from '$lib/components/actions';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import type { DepotFeature } from '$lib/types/entries';
	import type { DepotEditorData } from '$lib/types/editor';
	import { createDepot, type DepotMutationPayload, updateDepot } from '$lib/api/entry-mutations';
	import {
		hasUnsavedSnapshotChanges,
		serializeFormSnapshot,
		setupUnsavedChangesGuard,
		shouldBlockUnsavedNavigation
	} from '$lib/utils/unsaved-changes-guard';
	import * as m from '$lib/paraglide/messages.js';

	interface DepotEditorProps {
		editorData: DepotEditorData;
		entry?: DepotFeature;
		onCancel: () => void | Promise<void>;
		onSaved: (entry: DepotFeature) => void | Promise<void>;
	}

	interface DepotFormState {
		name: string;
		url: string;
		description: string;
		address: string;
		street: string;
		housenumber: string;
		postalcode: string;
		city: string;
		state: string;
		country: string;
		latitude: string;
		longitude: string;
		deliveryDays: string;
		farms: string[];
	}

	let { editorData, entry, onCancel, onSaved }: DepotEditorProps = $props();

	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);
	let form = $state<DepotFormState>(createEmptyForm());
	let lastFormKey = $state('');
	let initialFormSnapshot = $state('');
	let allowNavigationWithoutGuard = $state(false);
	const hasUnsavedChanges = $derived(hasUnsavedSnapshotChanges(form, initialFormSnapshot));
	const shouldBlockNavigation = $derived(
		shouldBlockUnsavedNavigation({
			allowNavigationWithoutGuard,
			isSaving,
			hasUnsavedChanges
		})
	);

	const title = $derived(
		editorData.mode === 'create' ? m.editor_create_depot_title() : m.editor_edit_depot_title()
	);

	$effect(() => {
		const nextKey = `${editorData.mode}:${entry?.properties.id ?? 'new'}`;
		if (nextKey === lastFormKey) {
			return;
		}

		lastFormKey = nextKey;
		errorMessage = null;
		allowNavigationWithoutGuard = false;
		const nextFormState = toDepotFormState(entry);
		form = nextFormState;
		initialFormSnapshot = serializeFormSnapshot(nextFormState);
	});

	function createEmptyForm(): DepotFormState {
		return {
			name: '',
			url: '',
			description: '',
			address: '',
			street: '',
			housenumber: '',
			postalcode: '',
			city: '',
			state: '',
			country: '',
			latitude: '',
			longitude: '',
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
		const coordinates = depot.geometry?.coordinates ?? [null, null];
		return {
			...base,
			name: props.name ?? '',
			url: props.url ?? '',
			description: props.description ?? '',
			address: props.address ?? '',
			street: props.street ?? '',
			housenumber: props.housenumber ?? '',
			postalcode: props.postalcode ?? '',
			city: props.city ?? '',
			state: props.state ?? '',
			country: props.country ?? '',
			latitude: coordinates[1] != null ? String(coordinates[1]) : '',
			longitude: coordinates[0] != null ? String(coordinates[0]) : '',
			deliveryDays: props.deliveryDays ?? '',
			farms: (props.farms?.features ?? []).map((farm) => String(farm.properties.id))
		};
	}

	function nullIfEmpty(value: string): string | null {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}

	function stringOrUndefined(value: string): string | undefined {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	function parseRequiredNumber(value: string): number {
		const trimmed = value.trim();
		if (!trimmed) {
			throw new Error(m.editor_error_invalid_coordinates());
		}

		const parsed = Number(trimmed);
		if (!Number.isFinite(parsed)) {
			throw new Error(m.editor_error_invalid_coordinates());
		}
		return parsed;
	}

	function parseRelationId(value: string): string | number {
		const parsed = Number(value);
		if (Number.isInteger(parsed) && String(parsed) === value) {
			return parsed;
		}
		return value;
	}

	function confirmDiscardChanges(): boolean {
		return window.confirm(m.editor_unsaved_changes_confirm());
	}

	function allowOneNavigationWithoutGuard() {
		allowNavigationWithoutGuard = true;
		setTimeout(() => {
			allowNavigationWithoutGuard = false;
		}, 0);
	}

	setupUnsavedChangesGuard({
		shouldBlockNavigation: () => shouldBlockNavigation,
		confirmDiscardChanges,
		onNavigationConfirmed: allowOneNavigationWithoutGuard
	});

	function mapDepotPayload(nextForm: DepotFormState): DepotMutationPayload {
		const street = stringOrUndefined(nextForm.street);
		const country = stringOrUndefined(nextForm.country);
		const state = stringOrUndefined(nextForm.state);
		const postalcode = stringOrUndefined(nextForm.postalcode);

		return {
			name: nextForm.name.trim(),
			city: nextForm.city.trim(),
			latitude: parseRequiredNumber(nextForm.latitude),
			longitude: parseRequiredNumber(nextForm.longitude),
			address: nullIfEmpty(nextForm.address),
			housenumber: nullIfEmpty(nextForm.housenumber),
			description: nullIfEmpty(nextForm.description),
			url: nullIfEmpty(nextForm.url),
			deliveryDays: nullIfEmpty(nextForm.deliveryDays),
			farms: nextForm.farms.map(parseRelationId),
			...(street !== undefined ? { street } : {}),
			...(country !== undefined ? { country } : {}),
			...(state !== undefined ? { state } : {}),
			...(postalcode !== undefined ? { postalcode } : {})
		};
	}

	function toggleFarmSelection(farmId: string, enabled: boolean) {
		if (enabled) {
			form.farms = form.farms.includes(farmId) ? form.farms : [...form.farms, farmId];
			return;
		}
		form.farms = form.farms.filter((value) => value !== farmId);
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

			allowNavigationWithoutGuard = true;
			await onSaved(saved);
		} catch (error) {
			allowNavigationWithoutGuard = false;
			errorMessage = error instanceof Error ? error.message : m.editor_save_failed();
		} finally {
			isSaving = false;
		}
	}

	async function handleCancel() {
		if (shouldBlockNavigation && !confirmDiscardChanges()) {
			return;
		}

		allowNavigationWithoutGuard = true;
		try {
			await onCancel();
		} catch (error) {
			allowNavigationWithoutGuard = false;
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
	<form class="space-y-4 p-4 pb-24" data-testid="depot-editor" onsubmit={handleFormSubmit}>
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

			<FormInput
				id="depot-editor-city"
				data-testid="depot-input-city"
				label={m.editor_field_city()}
				bind:value={form.city}
			/>

			<FormInput
				id="depot-editor-postalcode"
				label={m.editor_field_postalcode()}
				bind:value={form.postalcode}
			/>

			<FormInput
				id="depot-editor-country"
				label={m.editor_field_country()}
				bind:value={form.country}
			/>

			<FormInput id="depot-editor-region" label={m.editor_field_region()} bind:value={form.state} />

			<FormInput
				id="depot-editor-address"
				label={m.editor_field_address()}
				bind:value={form.address}
			/>

			<FormInput
				id="depot-editor-street"
				label={m.editor_field_street()}
				bind:value={form.street}
			/>

			<FormInput
				id="depot-editor-housenumber"
				label={m.editor_field_housenumber()}
				bind:value={form.housenumber}
			/>

			<FormInput
				id="depot-editor-latitude"
				data-testid="depot-input-latitude"
				label={m.editor_field_latitude()}
				bind:value={form.latitude}
			/>

			<FormInput
				id="depot-editor-longitude"
				data-testid="depot-input-longitude"
				label={m.editor_field_longitude()}
				bind:value={form.longitude}
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
