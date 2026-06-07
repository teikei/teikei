<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import XIcon from '@lucide/svelte/icons/x';
	import { AppButton, IconButton } from '$lib/components/actions';
	import { cn } from '$lib/utils/tailwind';
	import * as m from '$lib/paraglide/messages.js';
	import type {
		AcceptsNewMembers,
		FarmProperties,
		InitiativeProperties,
		MainEntryFeature,
		MainEntryProperties
	} from '$lib/types/entries';
	import { translateMonth } from '$lib/utils/translations';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import FarmDetail from '../farms/FarmDetail.svelte';
	import InitiativeDetail from '../initiatives/InitiativeDetail.svelte';
	import EntryContactForm from './EntryContactForm.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	interface EntryDetailProps {
		entry: MainEntryFeature;
		onClose: () => void;
		onEdit?: () => void;
		canEdit?: boolean;
	}

	let { entry, onClose, onEdit, canEdit = false }: EntryDetailProps = $props();

	const icon = $derived(getPlaceIcon(entry.properties.type));

	// Determine temporal connection word (since/from)
	function getTemporalWord(p: MainEntryProperties): string {
		if (!p.foundedAtYear) return '';
		const foundedAt = new Date(p.foundedAtYear, (p.foundedAtMonth || 1) - 1);
		const today = new Date();
		return foundedAt < today ? m.forms_labels_since() : m.forms_labels_from();
	}

	// Format founded date
	function getFoundedText(p: MainEntryProperties): string {
		if (!p.foundedAtYear) return '';
		const monthText = p.foundedAtMonth ? translateMonth(p.foundedAtMonth) : '';
		const temporalWord = getTemporalWord(p);
		return `${m.page_header_solawi()} ${temporalWord} ${monthText} ${p.foundedAtYear}`.trim();
	}

	// Membership status display, keyed by the "accepts new members" value.
	const MEMBERSHIP_DISPLAY: Record<AcceptsNewMembers, { text: () => string; class: string }> = {
		yes: { text: m.places_details_accepts_new_members_yes, class: 'text-success' },
		no: { text: m.places_details_accepts_new_members_no, class: 'text-destructive' },
		waitlist: { text: m.places_details_accepts_new_members_waitlist, class: 'text-warning' }
	};

	const entryProps = $derived(entry.properties);
	const foundedText = $derived(getFoundedText(entryProps));
	const membership = $derived(
		entryProps.acceptsNewMembers ? MEMBERSHIP_DISPLAY[entryProps.acceptsNewMembers] : undefined
	);
	const membershipText = $derived(membership ? membership.text() : '');
	const membershipClass = $derived(membership ? membership.class : '');
	let showContactForm = $state(false);
</script>

<Sidebar.Header class="border-b">
	<div class="flex items-start justify-between gap-2">
		<div class="flex items-start gap-3">
			<div class="mt-1 shrink-0 text-muted-foreground">
				<img class="size-9 object-contain" src={icon} alt={entryProps.name || entryProps.type} />
			</div>
			<div class="min-w-0 flex-1">
				<h2 class="text-lg leading-tight font-semibold">{entryProps.name}</h2>
				{#if foundedText}
					<p class="text-sm text-muted-foreground">{foundedText}</p>
				{/if}
				<p class="text-sm text-muted-foreground">
					{entryProps.postalcode}
					{entryProps.city}
				</p>
				{#if entryProps.url}
					<a
						href={entryProps.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
					>
						{entryProps.url}
						<ExternalLinkIcon class="size-3" />
					</a>
				{/if}
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-1">
			{#if canEdit && onEdit}
				<AppButton variant="outline" data-testid="entry-detail-edit" onclick={onEdit}>
					{m.map_sidebar_action_edit()}
				</AppButton>
			{/if}
			<IconButton
				class="shrink-0"
				data-testid="entry-detail-close"
				label={m.map_token_feedback_dismiss()}
				onclick={onClose}
			>
				<XIcon />
			</IconButton>
		</div>
	</div>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<div class="flex flex-col gap-4 p-4">
		<!-- Membership status -->
		{#if membershipText}
			<p class={cn('text-sm font-medium', membershipClass)}>{membershipText}</p>
		{/if}

		<!-- Description -->
		{#if entryProps.description}
			<p class="text-sm text-muted-foreground">{entryProps.description}</p>
		{/if}

		<!-- Type-specific content -->
		{#if entryProps.type === 'Farm'}
			<FarmDetail properties={entryProps as FarmProperties} />
		{:else if entryProps.type === 'Initiative'}
			<InitiativeDetail properties={entryProps as InitiativeProperties} />
		{/if}

		<div class="rounded-md border p-3">
			{#if showContactForm}
				<EntryContactForm entryId={entryProps.id} entryType={entryProps.type} />
			{:else}
				<AppButton
					type="button"
					variant="outline"
					data-testid="entry-contact-toggle"
					onclick={() => (showContactForm = true)}
				>
					{m.entry_contact_button()}
				</AppButton>
			{/if}
		</div>
	</div>
</Sidebar.Content>
