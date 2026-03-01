<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button';
	import type {
		Badge,
		FarmFeature,
		Goal,
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
	} from '$lib/api/place-editor';
	import * as m from '$lib/paraglide/messages.js';
	import {
		translateCategory,
		translateGoal,
		translateMonth,
		translateProduct
	} from '$lib/utils/translations';

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

	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);
	let farmForm = $state<FarmFormState>(createEmptyFarmForm());
	let initiativeForm = $state<InitiativeFormState>(createEmptyInitiativeForm());
	let lastFormKey = $state('');

	const isFarmEditor = $derived(editorData.entryType === 'Farm');
	const title = $derived(getTitle(editorData.mode, editorData.entryType));

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

	$effect(() => {
		const nextKey = `${editorData.mode}:${editorData.entryType}:${entry?.properties.id ?? 'new'}`;
		if (nextKey === lastFormKey) {
			return;
		}

		lastFormKey = nextKey;
		errorMessage = null;

		if (editorData.entryType === 'Farm') {
			farmForm = toFarmFormState(entry as FarmFeature | undefined);
			return;
		}

		initiativeForm = toInitiativeFormState(entry as InitiativeFeature | undefined);
	});

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

	function parseNumberOrNull(value: string): number | null {
		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
	}

	function parseRequiredNumber(value: string): number {
		const parsed = Number(value.trim());
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

	function mapCommonPayload(common: CommonFormState) {
		return {
			name: common.name.trim(),
			city: common.city.trim(),
			latitude: parseRequiredNumber(common.latitude),
			longitude: parseRequiredNumber(common.longitude),
			address: nullIfEmpty(common.address),
			street: nullIfEmpty(common.street),
			housenumber: nullIfEmpty(common.housenumber),
			description: nullIfEmpty(common.description),
			url: nullIfEmpty(common.url),
			country: nullIfEmpty(common.country),
			state: nullIfEmpty(common.state),
			postalcode: nullIfEmpty(common.postalcode)
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
			data-testid="entry-editor-cancel"
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
	<form class="space-y-4 p-4" data-testid="entry-editor" onsubmit={handleFormSubmit}>
		<div class="grid grid-cols-1 gap-3">
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_name()}</span>
				<input
					data-testid="editor-input-name"
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('name')}
					oninput={(event) =>
						setCommonField('name', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_url()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('url')}
					oninput={(event) =>
						setCommonField('url', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_description()}</span>
				<textarea
					class="w-full rounded-md border px-3 py-2"
					rows="4"
					value={getCommonField('description')}
					oninput={(event) =>
						setCommonField('description', (event.currentTarget as HTMLTextAreaElement).value)}
				></textarea>
			</label>
		</div>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_city()}</span>
				<input
					data-testid="editor-input-city"
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('city')}
					oninput={(event) =>
						setCommonField('city', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_postalcode()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('postalcode')}
					oninput={(event) =>
						setCommonField('postalcode', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_country()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('country')}
					oninput={(event) =>
						setCommonField('country', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_region()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('state')}
					oninput={(event) =>
						setCommonField('state', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_address()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('address')}
					oninput={(event) =>
						setCommonField('address', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_street()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('street')}
					oninput={(event) =>
						setCommonField('street', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_housenumber()}</span>
				<input
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('housenumber')}
					oninput={(event) =>
						setCommonField('housenumber', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_latitude()}</span>
				<input
					data-testid="editor-input-latitude"
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('latitude')}
					oninput={(event) =>
						setCommonField('latitude', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="space-y-1 text-sm">
				<span>{m.editor_field_longitude()}</span>
				<input
					data-testid="editor-input-longitude"
					class="w-full rounded-md border px-3 py-2"
					value={getCommonField('longitude')}
					oninput={(event) =>
						setCommonField('longitude', (event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
		</div>

		{#if isFarmEditor}
			<div class="space-y-4">
				<section class="space-y-2">
					<h3 class="text-sm font-semibold">{m.editor_field_products()}</h3>
					{#each productCategories as category (category)}
						<div class="space-y-1">
							<p class="text-sm text-muted-foreground">{translateCategory(category)}</p>
							<div class="grid grid-cols-1 gap-1 md:grid-cols-2">
								{#each productsByCategory[category] as product (product.id)}
									<label class="inline-flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={farmForm.products.includes(String(product.id))}
											onchange={(event) =>
												handleProductToggle(String(product.id), event.currentTarget.checked)}
										/>
										<span>{translateProduct(product.name)}</span>
									</label>
								{/each}
							</div>
						</div>
					{/each}
				</section>

				<label class="space-y-1 text-sm">
					<span>{m.editor_field_additional_product_information()}</span>
					<textarea
						class="w-full rounded-md border px-3 py-2"
						rows="4"
						bind:value={farmForm.additionalProductInformation}
					></textarea>
				</label>

				<label class="inline-flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={farmForm.actsEcological} />
					<span>{m.editor_field_acts_ecological()}</span>
				</label>

				<label class="space-y-1 text-sm">
					<span>{m.editor_field_economical_behavior()}</span>
					<textarea
						class="w-full rounded-md border px-3 py-2"
						rows="4"
						bind:value={farmForm.economicalBehavior}
					></textarea>
				</label>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					<label class="space-y-1 text-sm">
						<span>{m.editor_field_founded_year()}</span>
						<select class="w-full rounded-md border px-3 py-2" bind:value={farmForm.foundedAtYear}>
							<option value=""></option>
							{#each yearOptions as year (year)}
								<option value={year}>{year}</option>
							{/each}
						</select>
					</label>
					<label class="space-y-1 text-sm">
						<span>{m.editor_field_founded_month()}</span>
						<select class="w-full rounded-md border px-3 py-2" bind:value={farmForm.foundedAtMonth}>
							<option value=""></option>
							{#each monthOptions as month (month)}
								<option value={month}>{translateMonth(month)}</option>
							{/each}
						</select>
					</label>
				</div>

				<fieldset class="space-y-2">
					<legend class="text-sm font-semibold">{m.editor_field_accepts_new_members()}</legend>
					<label class="inline-flex items-center gap-2 text-sm">
						<input type="radio" value="yes" bind:group={farmForm.acceptsNewMembers} />
						<span>{m.editor_accepts_yes()}</span>
					</label>
					<label class="inline-flex items-center gap-2 text-sm">
						<input type="radio" value="no" bind:group={farmForm.acceptsNewMembers} />
						<span>{m.editor_accepts_no()}</span>
					</label>
					<label class="inline-flex items-center gap-2 text-sm">
						<input type="radio" value="waitlist" bind:group={farmForm.acceptsNewMembers} />
						<span>{m.editor_accepts_waitlist()}</span>
					</label>
				</fieldset>

				<label class="space-y-1 text-sm">
					<span>{m.editor_field_maximum_members()}</span>
					<input class="w-full rounded-md border px-3 py-2" bind:value={farmForm.maximumMembers} />
				</label>

				<label class="space-y-1 text-sm">
					<span>{m.editor_field_participation()}</span>
					<textarea
						class="w-full rounded-md border px-3 py-2"
						rows="4"
						bind:value={farmForm.participation}
					></textarea>
				</label>

				<section class="space-y-2">
					<h3 class="text-sm font-semibold">{m.editor_field_badges()}</h3>
					<div class="grid grid-cols-1 gap-1 md:grid-cols-2">
						{#each editorData.badges as badge (badge.id)}
							<label class="inline-flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={farmForm.badges.includes(String(badge.id))}
									onchange={(event) =>
										handleFarmBadgeToggle(String(badge.id), event.currentTarget.checked)}
								/>
								<span>{badge.name}</span>
							</label>
						{/each}
					</div>
				</section>
			</div>
		{:else}
			<div class="space-y-4">
				<section class="space-y-2">
					<h3 class="text-sm font-semibold">{m.editor_field_goals()}</h3>
					<div class="grid grid-cols-1 gap-1">
						{#each editorData.goals as goal (goal.id)}
							<label class="inline-flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={initiativeForm.goals.includes(String(goal.id))}
									onchange={(event) =>
										handleGoalToggle(String(goal.id), event.currentTarget.checked)}
								/>
								<span>{translateGoal(goal.name)}</span>
							</label>
						{/each}
					</div>
				</section>

				<section class="space-y-2">
					<h3 class="text-sm font-semibold">{m.editor_field_badges()}</h3>
					<div class="grid grid-cols-1 gap-1 md:grid-cols-2">
						{#each editorData.badges as badge (badge.id)}
							<label class="inline-flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={initiativeForm.badges.includes(String(badge.id))}
									onchange={(event) =>
										handleInitiativeBadgeToggle(String(badge.id), event.currentTarget.checked)}
								/>
								<span>{badge.name}</span>
							</label>
						{/each}
					</div>
				</section>
			</div>
		{/if}

		<div class="flex items-center justify-end gap-2 border-t pt-4">
			<Button type="button" variant="outline" onclick={() => void onCancel()}>
				{m.editor_cancel()}
			</Button>
			<Button type="submit" data-testid="entry-editor-save" disabled={isSaving}>
				{isSaving ? m.editor_saving() : m.editor_save()}
			</Button>
		</div>
	</form>
</Sidebar.Content>
