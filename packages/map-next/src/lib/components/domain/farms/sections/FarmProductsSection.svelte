<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';
	import * as Field from '$lib/components/ui/field';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { FormTextarea } from '$lib/components/forms';
	import { translateCategory, translateProduct } from '$lib/utils/translations';
	import { toggleSelection } from '$lib/utils/editor-form';
	import type { MainEntryFormData } from '$lib/utils/editor-schema';
	import type { FarmProperties, Product } from '$lib/types/entries';
	import ProfileSection from '../../entries/sections/ProfileSection.svelte';

	interface Props {
		mode: 'read' | 'edit';
		properties?: FarmProperties;
		form: SuperForm<MainEntryFormData>;
		products?: Product[];
	}

	let { mode, properties, form, products = [] }: Props = $props();

	const formData = $derived(form.form);
	const errors = $derived(form.errors);

	const readByCategory = $derived.by(() => {
		const grouped: Record<string, { name: string }[]> = {};
		for (const product of properties?.products ?? []) {
			(grouped[product.category] ??= []).push({ name: product.name });
		}
		return grouped;
	});
	const readCategories = $derived(Object.keys(readByCategory));

	const editByCategory = $derived.by(() => {
		const grouped: Record<string, Product[]> = {};
		for (const product of products) {
			(grouped[product.category] ??= []).push(product);
		}
		return grouped;
	});
	const editCategories = $derived(Object.keys(editByCategory));

	function handleProductToggle(productId: string, checked: boolean) {
		$formData.products = toggleSelection($formData.products, productId, checked);
	}
</script>

{#if mode === 'edit'}
	<ProfileSection testId="profile-section-products">
		<Field.Set>
			<Field.Legend variant="label">{m.editor_field_products()}</Field.Legend>
			{#each editCategories as category (category)}
				<div class="flex flex-col gap-1">
					<p class="text-sm text-muted-foreground">{translateCategory(category)}</p>
					<Field.Group class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each editByCategory[category] as product (product.id)}
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
			error={$errors.additionalProductInformation}
		/>
	</ProfileSection>
{:else if properties}
	{#if readCategories.length > 0 || properties.additionalProductInformation}
		<ProfileSection testId="profile-section-products">
			{#each readCategories as category (category)}
				<div class="flex flex-col gap-1">
					<h4 class="text-sm font-semibold">{translateCategory(category)}</h4>
					<ul class="list-inside list-disc text-sm text-muted-foreground">
						{#each readByCategory[category] as product (product.name)}
							<li>{translateProduct(product.name)}</li>
						{/each}
					</ul>
				</div>
			{/each}

			{#if properties.additionalProductInformation}
				<div class="flex flex-col gap-1">
					<h4 class="text-sm font-semibold">{m.places_farmdescription_additionalinfo()}</h4>
					<p class="text-sm text-muted-foreground">{properties.additionalProductInformation}</p>
				</div>
			{/if}
		</ProfileSection>
	{/if}
{/if}
