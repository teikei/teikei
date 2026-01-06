<script lang="ts">
	import { X, ExternalLink } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import type {
		PlaceDetailFeature,
		PlaceDetailProperties,
		FarmDetailProperties,
		InitiativeDetailProperties
	} from '$lib/types/place-details';
	import { translateMonth } from '$lib/utils/translations';
	import { getEntryIcon } from '$lib/utils/entries';
	import FarmDetail from './FarmDetail.svelte';
	import InitiativeDetail from './InitiativeDetail.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	interface EntryDetailProps {
		entry: PlaceDetailFeature;
		onClose: () => void;
	}

	let { entry, onClose }: EntryDetailProps = $props();

	const Icon = $derived(getEntryIcon(entry.properties.type));

	// Determine temporal connection word (since/from)
	function getTemporalWord(p: PlaceDetailProperties): string {
		if (!p.foundedAtYear) return '';
		const foundedAt = new Date(p.foundedAtYear, (p.foundedAtMonth || 1) - 1);
		const today = new Date();
		return foundedAt < today ? m.forms_labels_since() : m.forms_labels_from();
	}

	// Format founded date
	function getFoundedText(p: PlaceDetailProperties): string {
		if (!p.foundedAtYear) return '';
		const monthText = p.foundedAtMonth ? translateMonth(p.foundedAtMonth) : '';
		const temporalWord = getTemporalWord(p);
		return `${m.page_header_solawi()} ${temporalWord} ${monthText} ${p.foundedAtYear}`.trim();
	}

	// Membership status
	function getMembershipText(p: PlaceDetailProperties): string {
		switch (p.acceptsNewMembers) {
			case 'yes':
				return m.places_details_accepts_new_members_yes();
			case 'no':
				return m.places_details_accepts_new_members_no();
			case 'waitlist':
				return m.places_details_accepts_new_members_waitlist();
			default:
				return '';
		}
	}

	function getMembershipClass(p: PlaceDetailProperties): string {
		switch (p.acceptsNewMembers) {
			case 'yes':
				return 'text-green-600';
			case 'no':
				return 'text-red-600';
			case 'waitlist':
				return 'text-yellow-600';
			default:
				return '';
		}
	}

	const entryProps = entry.properties;
	const foundedText = getFoundedText(entryProps);
	const membershipText = getMembershipText(entryProps);
	const membershipClass = getMembershipClass(entryProps);
</script>

<Sidebar.Header class="border-b">
	<div class="flex items-start justify-between gap-2">
		<div class="flex items-start gap-3">
			<div class="mt-1 shrink-0 text-muted-foreground">
				<Icon class="size-5" />
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
						<ExternalLink class="size-3" />
					</a>
				{/if}
			</div>
		</div>
		<Button variant="ghost" size="icon" class="size-8 shrink-0" onclick={onClose}>
			<X class="size-4" />
			<span class="sr-only">Close</span>
		</Button>
	</div>
</Sidebar.Header>

<Sidebar.Content class="overflow-y-auto">
	<div class="space-y-4 p-4">
		<!-- Membership status -->
		{#if membershipText}
			<p class="text-sm font-medium {membershipClass}">{membershipText}</p>
		{/if}

		<!-- Description -->
		{#if entryProps.description}
			<p class="text-sm text-muted-foreground">{entryProps.description}</p>
		{/if}

		<!-- Type-specific content -->
		{#if entryProps.type === 'Farm'}
			<FarmDetail properties={entryProps as FarmDetailProperties} />
		{:else if entryProps.type === 'Initiative'}
			<InitiativeDetail properties={entryProps as InitiativeDetailProperties} />
		{/if}
	</div>
</Sidebar.Content>
