<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Field from '$lib/components/ui/field';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Spinner } from '$lib/components/ui/spinner';
	import { AppButton } from '$lib/components/actions';
	import { AddressFields, FormInput, FormSelect, FormTextarea } from '$lib/components/forms';
	import type { MainEntryFeature, MainEntryType, Product } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';
	import {
		createFarm,
		createInitiative,
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
	import { createEditorGuard } from '$lib/utils/editor-guard.svelte';
	import { hasTaintedField, toggleSelection, type CommonFormState } from '$lib/utils/editor-form';
	import {
		mainEntryFormFromFeature,
		mainEntryFormSchema,
		mapFarmPayload,
		mapInitiativePayload
	} from '$lib/utils/editor-schema';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';

	interface EntryEditorProps {
		editorData: EntryEditorData;
		entry?: MainEntryFeature;
		onCancel: () => void | Promise<void>;
		onSaved: (entry: MainEntryFeature) => void | Promise<void>;
	}

	let { editorData, entry, onCancel, onSaved }: EntryEditorProps = $props();

	// This component is remounted (via `{#key}` in the parent) whenever the edited
	// entry changes, so form state is initialised directly from props.
	// svelte-ignore state_referenced_locally
	const form = superForm(defaults(mainEntryFormFromFeature(entry), zod4(mainEntryFormSchema)), {
		validators: zod4Client(mainEntryFormSchema),
		SPA: true,
		dataType: 'json'
	});
	const { form: formData, errors, tainted, validateForm } = form;

	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);

	const isFarmEditor = $derived(editorData.entryType === 'Farm');
	const title = $derived(getTitle(editorData.mode, editorData.entryType));
	const hasUnsavedChanges = $derived(hasTaintedField($tainted));

	const guard = createEditorGuard({
		isSaving: () => isSaving,
		hasUnsavedChanges: () => hasUnsavedChanges
	});

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

	function handleProductToggle(productId: string, checked: boolean) {
		$formData.products = toggleSelection($formData.products, productId, checked);
	}

	function handleGoalToggle(goalId: string, checked: boolean) {
		$formData.goals = toggleSelection($formData.goals, goalId, checked);
	}

	function handleFarmBadgeToggle(badgeId: string, checked: boolean) {
		$formData.badges = toggleSelection($formData.badges, badgeId, checked);
	}

	function handleInitiativeBadgeToggle(badgeId: string, checked: boolean) {
		$formData.badges = toggleSelection($formData.badges, badgeId, checked);
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
		errorMessage = null;

		try {
			let saved: MainEntryFeature;
			if (editorData.entryType === 'Farm') {
				const payload = mapFarmPayload(result.data);
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
				const payload = mapInitiativePayload(result.data);
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
				bind:value={$formData.name}
				error={$errors.name}
			/>
			<FormInput id="entry-editor-url" label={m.editor_field_url()} bind:value={$formData.url} />
			<FormTextarea
				id="entry-editor-description"
				label={m.editor_field_description()}
				rows={4}
				bind:value={$formData.description}
			/>
		</div>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<AddressFields
				fields={$formData}
				idPrefix="entry-editor"
				testIdPrefix="editor-input"
				onFieldChange={setCommonField}
				errors={$errors}
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
											checked={$formData.products.includes(String(product.id))}
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
					bind:value={$formData.additionalProductInformation}
				/>

				<Field.Field orientation="horizontal">
					<Checkbox id="acts-ecological" bind:checked={$formData.actsEcological} />
					<Field.Label for="acts-ecological" class="font-normal">
						{m.editor_field_acts_ecological()}
					</Field.Label>
				</Field.Field>

				<FormTextarea
					id="entry-editor-economical-behavior"
					label={m.editor_field_economical_behavior()}
					rows={4}
					bind:value={$formData.economicalBehavior}
				/>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					<FormSelect
						id="entry-editor-founded-year"
						label={m.editor_field_founded_year()}
						options={[
							{ value: '', label: '' },
							...yearOptions.map((year) => ({ value: year, label: year }))
						]}
						bind:value={$formData.foundedAtYear}
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
						bind:value={$formData.foundedAtMonth}
					/>
				</div>

				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_accepts_new_members()}</Field.Legend>
					<RadioGroup.Root
						value={$formData.acceptsNewMembers}
						onValueChange={(value) =>
							($formData.acceptsNewMembers = value as 'yes' | 'no' | 'waitlist')}
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
					bind:value={$formData.maximumMembers}
				/>

				<FormTextarea
					id="entry-editor-participation"
					label={m.editor_field_participation()}
					rows={4}
					bind:value={$formData.participation}
				/>

				<Field.Set>
					<Field.Legend variant="label">{m.editor_field_badges()}</Field.Legend>
					<Field.Group class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each editorData.badges as badge (badge.id)}
							<Field.Field orientation="horizontal">
								<Checkbox
									id={`farm-badge-${badge.id}`}
									checked={$formData.badges.includes(String(badge.id))}
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
									checked={$formData.goals.includes(String(goal.id))}
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
									checked={$formData.badges.includes(String(badge.id))}
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
