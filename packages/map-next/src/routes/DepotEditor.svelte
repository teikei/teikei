<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button';
	import type { DepotFeature } from '$lib/types/entries';
	import type { DepotEditorData } from '$lib/types/editor';
	import { createDepot, type DepotMutationPayload, updateDepot } from '$lib/api/place-editor';
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
		form = toDepotFormState(entry);
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

			await onSaved(saved);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : m.editor_save_failed();
		} finally {
			isSaving = false;
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
		<Button
			type="button"
			variant="outline"
			size="sm"
			data-testid="depot-editor-cancel"
			onclick={() => void onCancel()}
		>
			{m.editor_cancel()}
		</Button>
	</div>
	{#if errorMessage}
		<p class="mt-2 text-sm text-destructive">{errorMessage}</p>
	{/if}
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<form class="space-y-4 p-4" data-testid="depot-editor" onsubmit={handleFormSubmit}>
		<div class="grid grid-cols-1 gap-3">
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_name()}</span>
				<input
					data-testid="depot-input-name"
					class="w-full rounded-md border px-3 py-2"
					value={form.name}
					oninput={(event) => (form.name = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_url()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.url}
					oninput={(event) => (form.url = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<div class="space-y-2 rounded-md border p-3">
				<p class="text-sm font-medium">{m.editor_depot_field_farms()}</p>
				{#if editorData.farmOptions.length === 0}
					<p class="text-sm text-muted-foreground">{m.editor_depot_no_farms_available()}</p>
				{:else}
					<div class="max-h-44 space-y-2 overflow-y-auto">
						{#each editorData.farmOptions as farmOption (farmOption.id)}
							<label class="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={form.farms.includes(farmOption.id)}
									onchange={(event) =>
										toggleFarmSelection(
											farmOption.id,
											(event.currentTarget as HTMLInputElement).checked
										)}
								/>
								<span>{farmOption.name}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_city()}</span>
				<input
					data-testid="depot-input-city"
					class="w-full rounded-md border px-3 py-2"
					value={form.city}
					oninput={(event) => (form.city = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_postalcode()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.postalcode}
					oninput={(event) => (form.postalcode = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_country()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.country}
					oninput={(event) => (form.country = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_region()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.state}
					oninput={(event) => (form.state = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_address()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.address}
					oninput={(event) => (form.address = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_street()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.street}
					oninput={(event) => (form.street = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_housenumber()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.housenumber}
					oninput={(event) => (form.housenumber = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_latitude()}</span>
				<input
					data-testid="depot-input-latitude"
					class="w-full rounded-md border px-3 py-2"
					value={form.latitude}
					oninput={(event) => (form.latitude = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_longitude()}</span>
				<input
					data-testid="depot-input-longitude"
					class="w-full rounded-md border px-3 py-2"
					value={form.longitude}
					oninput={(event) => (form.longitude = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_field_description()}</span>
				<textarea
					class="w-full rounded-md border px-3 py-2"
					rows="4"
					value={form.description}
					oninput={(event) =>
						(form.description = (event.currentTarget as HTMLTextAreaElement).value)}
				></textarea>
			</label>

			<label class="space-y-1 text-sm">
				<span>{m.editor_depot_field_delivery_days()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={form.deliveryDays}
					oninput={(event) => (form.deliveryDays = (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
		</div>

		<div class="sticky bottom-0 flex justify-end border-t bg-sidebar py-3">
			<Button type="submit" disabled={isSaving} data-testid="depot-editor-save">
				{isSaving ? m.editor_saving() : m.editor_save()}
			</Button>
		</div>
	</form>
</Sidebar.Content>
