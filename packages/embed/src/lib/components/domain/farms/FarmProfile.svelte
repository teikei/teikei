<script lang="ts">
	import { Paragraph } from '$lib/components/typography';
	import { BadgesSection, EntryProfile } from '$lib/components/domain/entries';
	import type { EntryProfileSectionContext } from '$lib/components/domain/entries';
	import { formatFoundedLine } from '$lib/utils/entry-format';
	import {
		FarmProductsSection,
		FarmEconomicBehaviorSection,
		FarmMembershipSection,
		FarmDepotsSection
	} from './sections';
	import * as m from '$lib/paraglide/messages.js';
	import type { DepotFeature, MainEntryFeature, MainEntryProperties } from '$lib/types/entries';
	import type { EntryEditorData } from '$lib/types/editor';

	interface FarmProfileProps {
		/** The farm feature; undefined only when creating a new farm. */
		entry?: MainEntryFeature;
		mode: 'read' | 'edit';
		/** Catalog data (products/badges) — present in edit/create mode. */
		editorData?: EntryEditorData;
		/** Whether the signed-in user owns this farm (Edit action + depot affordances). */
		canEdit?: boolean;
		ownedDepotIds?: ReadonlySet<string>;
		onClose: () => void;
		onEdit?: () => void;
		onCancel?: () => void | Promise<void>;
		onSaved?: (entry: MainEntryFeature) => void | Promise<void>;
		onDepotSelect?: (depot: DepotFeature) => void;
		onDepotEdit?: (depot: DepotFeature) => void;
		onDepotDelete?: (depot: DepotFeature) => void;
		onAddDepot?: () => void;
	}

	let {
		entry,
		mode,
		editorData,
		canEdit = false,
		ownedDepotIds,
		onClose,
		onEdit,
		onCancel,
		onSaved,
		onDepotSelect,
		onDepotEdit,
		onDepotDelete,
		onAddDepot
	}: FarmProfileProps = $props();

	const products = $derived(editorData?.products ?? []);
	const badges = $derived(editorData?.badges ?? []);

	const farmProperties = (properties?: MainEntryProperties) =>
		properties?.type === 'Farm' ? properties : undefined;

	// The membership status chip lives in the Membership section; only the
	// founded line is added to the shared drawer header (F12.1).
	const ownProperties = $derived(farmProperties(entry?.properties));
	const foundedLine = $derived(ownProperties ? formatFoundedLine(ownProperties) : '');

	const errorSections = $derived([
		{ title: m.editor_section_products(), fields: ['additionalProductInformation'] },
		{ title: m.editor_section_economic(), fields: ['economicalBehavior'] },
		{
			title: m.editor_section_membership(),
			fields: ['foundedAtMonth', 'maximumMembers', 'participation']
		}
	]);
</script>

<EntryProfile
	entryType="Farm"
	{entry}
	{mode}
	{canEdit}
	{onClose}
	{onEdit}
	{onCancel}
	{onSaved}
	extraErrorSections={errorSections}
>
	{#snippet headerMeta()}
		{#if foundedLine}
			<Paragraph size="small" muted>{foundedLine}</Paragraph>
		{/if}
	{/snippet}

	{#snippet editSections({ form, properties }: EntryProfileSectionContext)}
		<FarmProductsSection mode="edit" {form} {products} />
		<FarmEconomicBehaviorSection mode="edit" {form} />
		<FarmMembershipSection mode="edit" {form} />
		<BadgesSection mode="edit" {form} {badges} idPrefix="farm-badge" />
		<FarmDepotsSection
			properties={farmProperties(properties)}
			{ownedDepotIds}
			isFarmOwner={canEdit}
			{onDepotSelect}
			{onDepotEdit}
			{onDepotDelete}
			{onAddDepot}
		/>
	{/snippet}

	{#snippet readSections({ form, properties }: EntryProfileSectionContext)}
		<FarmProductsSection mode="read" properties={farmProperties(properties)} {form} />
		<FarmEconomicBehaviorSection mode="read" properties={farmProperties(properties)} {form} />
		<FarmMembershipSection mode="read" properties={farmProperties(properties)} {form} />
		<BadgesSection mode="read" {properties} {form} idPrefix="farm-badge" />
		<FarmDepotsSection
			properties={farmProperties(properties)}
			{ownedDepotIds}
			isFarmOwner={canEdit}
			{onDepotSelect}
			{onDepotEdit}
			{onDepotDelete}
			{onAddDepot}
		/>
	{/snippet}
</EntryProfile>
