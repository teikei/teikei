<script lang="ts" module>
	import * as m from '$lib/paraglide/messages.js';
	import type { AcceptsNewMembers } from '$lib/types/entries';

	// Membership status is a farm-only concept, shown as a colored dot + label.
	// Shared between the entry card and the profile header so both read
	// identically (spec F12.1: "colored chip consistent with card styling"). The
	// card uses the terse label; the profile header opts into the verbose
	// sentence (legacy profile wording) via `detailed`.
	const MEMBERSHIP: Record<
		AcceptsNewMembers,
		{ label: () => string; detailedLabel: () => string; dot: string; text: string }
	> = {
		yes: {
			label: m.map_card_membership_yes,
			detailedLabel: m.places_details_accepts_new_members_yes,
			dot: 'bg-success',
			text: 'text-success'
		},
		no: {
			label: m.map_card_membership_no,
			detailedLabel: m.places_details_accepts_new_members_no,
			dot: 'bg-destructive',
			text: 'text-destructive'
		},
		waitlist: {
			label: m.map_card_membership_waitlist,
			detailedLabel: m.places_details_accepts_new_members_waitlist,
			dot: 'bg-warning',
			text: 'text-warning'
		}
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils/tailwind';

	interface Props {
		acceptsNewMembers: AcceptsNewMembers;
		/** Use the verbose profile wording instead of the terse card label. */
		detailed?: boolean;
		class?: string;
	}

	let { acceptsNewMembers, detailed = false, class: className }: Props = $props();

	// Guard against out-of-union data: the type is compile-time only, so unexpected
	// API values render nothing rather than crashing on an undefined lookup.
	const status = $derived(MEMBERSHIP[acceptsNewMembers]);
</script>

{#if status}
	<span
		class={cn('inline-flex items-center gap-1 text-xs', status.text, className)}
		data-testid="membership-status"
	>
		<span class={cn('size-2 shrink-0 rounded-full', status.dot)}></span>
		{detailed ? status.detailedLabel() : status.label()}
	</span>
{/if}
