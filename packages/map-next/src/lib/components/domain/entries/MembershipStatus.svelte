<script lang="ts" module>
	import * as m from '$lib/paraglide/messages.js';
	import type { AcceptsNewMembers } from '$lib/types/entries';

	const MEMBERSHIP: Record<
		AcceptsNewMembers,
		{ label: () => string; detailedLabel: () => string; text: string }
	> = {
		yes: {
			label: m.map_card_membership_yes,
			detailedLabel: m.places_details_accepts_new_members_yes,
			text: 'text-success'
		},
		no: {
			label: m.map_card_membership_no,
			detailedLabel: m.places_details_accepts_new_members_no,
			text: 'text-destructive'
		},
		waitlist: {
			label: m.map_card_membership_waitlist,
			detailedLabel: m.places_details_accepts_new_members_waitlist,
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

	const status = $derived(MEMBERSHIP[acceptsNewMembers]);
</script>

{#if status}
	<span
		class={cn('text-md inline-flex items-center gap-1', status.text, className)}
		data-testid="membership-status"
	>
		{detailed ? status.detailedLabel() : status.label()}
	</span>
{/if}
