<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Field from '$lib/components/ui/field';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Spinner } from '$lib/components/ui/spinner';
	import { AppButton } from '$lib/components/actions';
	import { FormInput, FormSelect, FormTextarea } from '$lib/components/forms';
	import type {
		FarmFeature,
		InitiativeFeature,
		MainEntryFeature,
		MainEntryType,
		Product
	} from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';
	import {
		createFarm,
		createInitiative,
		type FarmMutationPayload,
		type InitiativeMutationPayload,
		updateFarm,
		updateInitiative
	} from '$lib/api/entry-mutations';
	import * as m from '$lib/paraglide/messages.js';
	import {
		translateCategory,
		translateGoal,
		translateMonth,
		translateProduct
	} from '$lib/utils/translations';
	import {
		hasUnsavedSnapshotChanges,
		serializeFormSnapshot,
		setupUnsavedChangesGuard,
		shouldBlockUnsavedNavigation
	} from '$lib/utils/unsaved-changes-guard';

	interface EntryEditorProps {
		editorData: EntryEditorData;
		entry?: MainEntryFeature;
		onCancel: () => void | Promise<void>;
		onSaved: (entry: MainEntryFeature) => void | Promise<void>;
	}

	interface CommonFormState {
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
	}

	interface FarmFormState extends CommonFormState {
		products: string[];
		badges: string[];
		additionalProductInformation: string;
		actsEcological: boolean;
		economicalBehavior: string;
		foundedAtYear: string;
		foundedAtMonth: string;
		acceptsNewMembers: 'yes' | 'no' | 'waitlist';
		maximumMembers: string;
		participation: string;
	}

	interface InitiativeFormState extends CommonFormState {
		goals: string[];
		badges: string[];
	}

	let { editorData, entry, onCancel, onSaved }: EntryEditorProps = $props();

	// This component is remounted (via `{#key}` in the parent) whenever the edited
	// entry changes, so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const initialFarmForm =
		editorData.entryType === 'Farm'
			? toFarmFormState(entry as FarmFeature | undefined)
			: createEmptyFarmForm();
	// svelte-ignore state_referenced_locally
	const initialInitiativeForm =
		editorData.entryType === 'Initiative'
			? toInitiativeFormState(entry as InitiativeFeature | undefined)
			: createEmptyInitiativeForm();
	const initialFarmFormSnapshot = serializeFormSnapshot(initialFarmForm);
	const initialInitiativeFormSnapshot = serializeFormSnapshot(initialInitiativeForm);

	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);
	let farmForm = $state<FarmFormState>(initialFarmForm);
	let initiativeForm = $state<InitiativeFormState>(initialInitiativeForm);
	let allowNavigationWithoutGuard = $state(false);

	const isFarmEditor = $derived(editorData.entryType === 'Farm');
	const title = $derived(getTitle(editorData.mode, editorData.entryType));
	const hasUnsavedChanges = $derived.by(() => {
		if (editorData.entryType === 'Farm') {
			return hasUnsavedSnapshotChanges(farmForm, initialFarmFormSnapshot);
		}
		return hasUnsavedSnapshotChanges(initiativeForm, initialInitiativeFormSnapshot);
	});
	const shouldBlockNavigation = $derived(
		shouldBlockUnsavedNavigation({
			allowNavigationWithoutGuard,
			isSaving,
			hasUnsavedChanges
		})
	);

	const productsByCategory = $derived.by(() => {
		const grouped: Record<string, Product[]> = {};
		for (const product of editorData.products) {
			if (!grouped[product.category]) {
				grouped[product.category] = [];
			}
			grouped[product.category].push(product);
		}
		return grouped;
	});
	const productCategories = $derived(Object.keys(productsByCategory));
	const yearOptions = $derived(
		Array.from({ length: 101 }, (_, index) => String(new Date().getFullYear() - index))
	);
	const monthOptions = $derived(Array.from({ length: 12 }, (_, index) => index + 1));

	function getTitle(mode: EntryEditorData['mode'], entryType: MainEntryType): string {
		if (entryType === 'Farm') {
			return mode === 'create' ? m.editor_create_farm_title() : m.editor_edit_farm_title();
		}
		return mode === 'create'
			? m.editor_create_initiative_title()
			: m.editor_edit_initiative_title();
	}

	function createEmptyCommonForm(): CommonFormState {
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
			longitude: ''
		};
	}

	function createEmptyFarmForm(): FarmFormState {
		return {
			...createEmptyCommonForm(),
			products: [],
			badges: [],
			additionalProductInformation: '',
			actsEcological: false,
			economicalBehavior: '',
			foundedAtYear: '',
			foundedAtMonth: '',
			acceptsNewMembers: 'yes',
			maximumMembers: '',
			participation: ''
		};
	}

	function createEmptyInitiativeForm(): InitiativeFormState {
		return {
			...createEmptyCommonForm(),
			goals: [],
			badges: []
		};
	}

	function toCommonFormState(entryFeature: MainEntryFeature | undefined): CommonFormState {
		const props = entryFeature?.properties;
		const coordinates = entryFeature?.geometry?.coordinates ?? [null, null];
		return {
			name: props?.name ?? '',
			url: props?.url ?? '',
			description: props?.description ?? '',
			address: props?.address ?? '',
			street: props?.street ?? '',
			housenumber: props?.housenumber ?? '',
			postalcode: props?.postalcode ?? '',
			city: props?.city ?? '',
			state: props?.state ?? '',
			country: props?.country ?? '',
			latitude: coordinates[1] != null ? String(coordinates[1]) : '',
			longitude: coordinates[0] != null ? String(coordinates[0]) : ''
		};
	}

	function toFarmFormState(entryFeature: FarmFeature | undefined): FarmFormState {
		const base = createEmptyFarmForm();
		if (!entryFeature) {
			return base;
		}

		const props = entryFeature.properties;
		return {
			...base,
			...toCommonFormState(entryFeature),
			products: (props.products ?? []).map((product) => String(product.id)),
			badges: (props.badges ?? []).map((badge) => String(badge.id)),
			additionalProductInformation: props.additionalProductInformation ?? '',
			actsEcological: !!props.actsEcological,
			economicalBehavior: props.economicalBehavior ?? '',
			foundedAtYear: props.foundedAtYear != null ? String(props.foundedAtYear) : '',
			foundedAtMonth: props.foundedAtMonth != null ? String(props.foundedAtMonth) : '',
			acceptsNewMembers: props.acceptsNewMembers ?? 'yes',
			maximumMembers: props.maximumMembers != null ? String(props.maximumMembers) : '',
			participation: props.participation ?? ''
		};
	}

	function toInitiativeFormState(entryFeature: InitiativeFeature | undefined): InitiativeFormState {
		const base = createEmptyInitiativeForm();
		if (!entryFeature) {
			return base;
		}

		return {
			...base,
			...toCommonFormState(entryFeature),
			goals: (entryFeature.properties.goals ?? []).map((goal) => String(goal.id)),
			badges: (entryFeature.properties.badges ?? []).map((badge) => String(badge.id))
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

	function parseNumberOrNull(value: string): number | null {
		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
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

	function mapCommonPayload(common: CommonFormState) {
		const street = stringOrUndefined(common.street);
		const country = stringOrUndefined(common.country);
		const state = stringOrUndefined(common.state);
		const postalcode = stringOrUndefined(common.postalcode);

		return {
			name: common.name.trim(),
			city: common.city.trim(),
			latitude: parseRequiredNumber(common.latitude),
			longitude: parseRequiredNumber(common.longitude),
			address: nullIfEmpty(common.address),
			housenumber: nullIfEmpty(common.housenumber),
			description: nullIfEmpty(common.description),
			url: nullIfEmpty(common.url),
			...(street !== undefined ? { street } : {}),
			...(country !== undefined ? { country } : {}),
			...(state !== undefined ? { state } : {}),
			...(postalcode !== undefined ? { postalcode } : {})
		};
	}

	function mapFarmPayload(form: FarmFormState): FarmMutationPayload {
		return {
			...mapCommonPayload(form),
			acceptsNewMembers: form.acceptsNewMembers,
			foundedAtYear: parseNumberOrNull(form.foundedAtYear),
			foundedAtMonth: parseNumberOrNull(form.foundedAtMonth),
			maximumMembers: parseNumberOrNull(form.maximumMembers),
			additionalProductInformation: nullIfEmpty(form.additionalProductInformation),
			participation: nullIfEmpty(form.participation),
			actsEcological: form.actsEcological,
			economicalBehavior: nullIfEmpty(form.economicalBehavior),
			products: form.products.map(parseRelationId),
			badges: form.badges.map(parseRelationId)
		};
	}

	function mapInitiativePayload(form: InitiativeFormState): InitiativeMutationPayload {
		return {
			...mapCommonPayload(form),
			goals: form.goals.map(parseRelationId),
			badges: form.badges.map(parseRelationId)
		};
	}

	function toggleSelection(values: string[], value: string, enabled: boolean): string[] {
		if (enabled) {
			return values.includes(value) ? values : [...values, value];
		}
		return values.filter((current) => current !== value);
	}

	function handleProductToggle(productId: string, checked: boolean) {
		farmForm.products = toggleSelection(farmForm.products, productId, checked);
	}

	function handleGoalToggle(goalId: string, checked: boolean) {
		initiativeForm.goals = toggleSelection(initiativeForm.goals, goalId, checked);
	}

	function handleFarmBadgeToggle(badgeId: string, checked: boolean) {
		farmForm.badges = toggleSelection(farmForm.badges, badgeId, checked);
	}

	function handleInitiativeBadgeToggle(badgeId: string, checked: boolean) {
		initiativeForm.badges = toggleSelection(initiativeForm.badges, badgeId, checked);
	}

	function getCommonField(field: keyof CommonFormState): string {
		return editorData.entryType === 'Farm' ? farmForm[field] : initiativeForm[field];
	}

	function setCommonField(field: keyof CommonFormState, value: string) {
		if (editorData.entryType === 'Farm') {
			farmForm = { ...farmForm, [field]: value };
			return;
		}
		initiativeForm = { ...initiativeForm, [field]: value };
	}

	async function handleSubmit() {
		if (isSaving) {
			return;
		}

		isSaving = true;
		errorMessage = null;

		try {
			let saved: MainEntryFeature;
			if (editorData.entryType === 'Farm') {
				const payload = mapFarmPayload(farmForm);
				if (editorData.mode === 'create') {
					saved = await createFarm(payload);
				} else {
					const id = entry?.properties.id;
					if (!id) {
						throw new Error(m.editor_error_missing_entry_id());
					}
					saved = await updateFarm(id, payload);
				}
			} else {
				const payload = mapInitiativePayload(initiativeForm);
				if (editorData.mode === 'create') {
					saved = await createInitiative(payload);
				} else {
					const id = entry?.properties.id;
					if (!id) {
						throw new Error(m.editor_error_missing_entry_id());
					}
					saved = await updateInitiative(id, payload);
				}
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
			data-testid="entry-editor-cancel"
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
		data-testid="entry-editor"
		onsubmit={handleFormSubmit}
	>
		<div class="grid grid-cols-1 gap-3">
			<FormInput
				id="entry-editor-name"
				data-testid="editor-input-name"
				label={m.editor_field_name()}
				value={getCommonField('name')}
				oninput={(event) => setCommonField('name', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-url"
				label={m.editor_field_url()}
				value={getCommonField('url')}
				oninput={(event) => setCommonField('url', event.currentTarget.value)}
			/>
			<FormTextarea
				id="entry-editor-description"
				label={m.editor_field_description()}
				rows={4}
				value={getCommonField('description')}
				oninput={(event) => setCommonField('description', event.currentTarget.value)}
			/>
		</div>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<FormInput
				id="entry-editor-city"
				data-testid="editor-input-city"
				label={m.editor_field_city()}
				value={getCommonField('city')}
				oninput={(event) => setCommonField('city', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-postalcode"
				label={m.editor_field_postalcode()}
				value={getCommonField('postalcode')}
				oninput={(event) => setCommonField('postalcode', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-country"
				label={m.editor_field_country()}
				value={getCommonField('country')}
				oninput={(event) => setCommonField('country', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-region"
				label={m.editor_field_region()}
				value={getCommonField('state')}
				oninput={(event) => setCommonField('state', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-address"
				label={m.editor_field_address()}
				value={getCommonField('address')}
				oninput={(event) => setCommonField('address', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-street"
				label={m.editor_field_street()}
				value={getCommonField('street')}
				oninput={(event) => setCommonField('street', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-housenumber"
				label={m.editor_field_housenumber()}
				value={getCommonField('housenumber')}
				oninput={(event) => setCommonField('housenumber', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-latitude"
				data-testid="editor-input-latitude"
				label={m.editor_field_latitude()}
				value={getCommonField('latitude')}
				oninput={(event) => setCommonField('latitude', event.currentTarget.value)}
			/>
			<FormInput
				id="entry-editor-longitude"
				data-testid="editor-input-longitude"
				label={m.editor_field_longitude()}
				value={getCommonField('longitude')}
				oninput={(event) => setCommonField('longitude', event.currentTarget.value)}
			/>
		</div>

		{#if isFarmEditor}
			<div class="flex flex-col gap-4">
				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_products()}</Field.Legend>
					{#each productCategories as category (category)}
						<div class="flex flex-col gap-1">
							<p class="text-sm text-muted-foreground">{translateCategory(category)}</p>
							<Field.Group class="grid grid-cols-1 gap-2 md:grid-cols-2">
								{#each productsByCategory[category] as product (product.id)}
									<Field.Field orientation="horizontal">
										<Checkbox
											id={`product-${product.id}`}
											checked={farmForm.products.includes(String(product.id))}
											onCheckedChange={(checked) =>
												handleProductToggle(String(product.id), checked === true)}
										/>
										<Field.Label for={`product-${product.id}`} class="font-normal">
											{translateProduct(product.name)}
										</Field.Label>
									</Field.Field>
								{/each}
							</Field.Group>
						</div>
					{/each}
				</Field.Set>

				<FormTextarea
					id="entry-editor-additional-product-information"
					label={m.editor_field_additional_product_information()}
					rows={4}
					bind:value={farmForm.additionalProductInformation}
				/>

				<Field.Field orientation="horizontal">
					<Checkbox id="acts-ecological" bind:checked={farmForm.actsEcological} />
					<Field.Label for="acts-ecological" class="font-normal">
						{m.editor_field_acts_ecological()}
					</Field.Label>
				</Field.Field>

				<FormTextarea
					id="entry-editor-economical-behavior"
					label={m.editor_field_economical_behavior()}
					rows={4}
					bind:value={farmForm.economicalBehavior}
				/>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					<FormSelect
						id="entry-editor-founded-year"
						label={m.editor_field_founded_year()}
						options={[
							{ value: '', label: '' },
							...yearOptions.map((year) => ({ value: year, label: year }))
						]}
						bind:value={farmForm.foundedAtYear}
					/>
					<FormSelect
						id="entry-editor-founded-month"
						label={m.editor_field_founded_month()}
						options={[
							{ value: '', label: '' },
							...monthOptions.map((month) => ({
								value: String(month),
								label: translateMonth(month)
							}))
						]}
						bind:value={farmForm.foundedAtMonth}
					/>
				</div>

				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_accepts_new_members()}</Field.Legend>
					<RadioGroup.Root
						value={farmForm.acceptsNewMembers}
						onValueChange={(value) =>
							(farmForm.acceptsNewMembers = value as FarmFormState['acceptsNewMembers'])}
					>
						<Field.Field orientation="horizontal">
							<RadioGroup.Item value="yes" id="accepts-yes" />
							<Field.Label for="accepts-yes" class="font-normal"
								>{m.editor_accepts_yes()}</Field.Label
							>
						</Field.Field>
						<Field.Field orientation="horizontal">
							<RadioGroup.Item value="no" id="accepts-no" />
							<Field.Label for="accepts-no" class="font-normal">{m.editor_accepts_no()}</Field.Label
							>
						</Field.Field>
						<Field.Field orientation="horizontal">
							<RadioGroup.Item value="waitlist" id="accepts-waitlist" />
							<Field.Label for="accepts-waitlist" class="font-normal">
								{m.editor_accepts_waitlist()}
							</Field.Label>
						</Field.Field>
					</RadioGroup.Root>
				</Field.Set>

				<FormInput
					id="entry-editor-maximum-members"
					label={m.editor_field_maximum_members()}
					bind:value={farmForm.maximumMembers}
				/>

				<FormTextarea
					id="entry-editor-participation"
					label={m.editor_field_participation()}
					rows={4}
					bind:value={farmForm.participation}
				/>

				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_badges()}</Field.Legend>
					<Field.Group class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each editorData.badges as badge (badge.id)}
							<Field.Field orientation="horizontal">
								<Checkbox
									id={`farm-badge-${badge.id}`}
									checked={farmForm.badges.includes(String(badge.id))}
									onCheckedChange={(checked) =>
										handleFarmBadgeToggle(String(badge.id), checked === true)}
								/>
								<Field.Label for={`farm-badge-${badge.id}`} class="font-normal">
									{badge.name}
								</Field.Label>
							</Field.Field>
						{/each}
					</Field.Group>
				</Field.Set>
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_goals()}</Field.Legend>
					<Field.Group class="gap-2">
						{#each editorData.goals as goal (goal.id)}
							<Field.Field orientation="horizontal">
								<Checkbox
									id={`goal-${goal.id}`}
									checked={initiativeForm.goals.includes(String(goal.id))}
									onCheckedChange={(checked) => handleGoalToggle(String(goal.id), checked === true)}
								/>
								<Field.Label for={`goal-${goal.id}`} class="font-normal">
									{translateGoal(goal.name)}
								</Field.Label>
							</Field.Field>
						{/each}
					</Field.Group>
				</Field.Set>

				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_badges()}</Field.Legend>
					<Field.Group class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each editorData.badges as badge (badge.id)}
							<Field.Field orientation="horizontal">
								<Checkbox
									id={`initiative-badge-${badge.id}`}
									checked={initiativeForm.badges.includes(String(badge.id))}
									onCheckedChange={(checked) =>
										handleInitiativeBadgeToggle(String(badge.id), checked === true)}
								/>
								<Field.Label for={`initiative-badge-${badge.id}`} class="font-normal">
									{badge.name}
								</Field.Label>
							</Field.Field>
						{/each}
					</Field.Group>
				</Field.Set>
			</div>
		{/if}

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
</Sidebar.Content>
