<script lang="ts" module>
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import CircleXIcon from '@lucide/svelte/icons/circle-x';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import * as m from '$lib/paraglide/messages.js';
	import type { ChipTint } from '$lib/components/display';
	import type { AcceptsNewMembers } from '$lib/types/entries';

	const MEMBERSHIP: Record<
		AcceptsNewMembers,
		{
			label: () => string;
			detailedLabel: () => string;
			tint: ChipTint;
			icon: typeof CircleCheckIcon;
		}
	> = {
		yes: {
			label: m.map_card_membership_yes,
			detailedLabel: m.places_details_accepts_new_members_yes,
			tint: 'success',
			icon: CircleCheckIcon
		},
		no: {
			label: m.map_card_membership_no,
			detailedLabel: m.places_details_accepts_new_members_no,
			tint: 'destructive',
			icon: CircleXIcon
		},
		waitlist: {
			label: m.map_card_membership_waitlist,
			detailedLabel: m.places_details_accepts_new_members_waitlist,
			tint: 'warning',
			icon: ClockIcon
		}
	};
</script>

<script lang="ts">
	import { Chip } from '$lib/components/display';
	import { cn } from '$lib/utils/tailwind';

	interface Props {
		acceptsNewMembers: AcceptsNewMembers;
		/** Use the verbose profile wording instead of the terse card label. */
		detailed?: boolean;
		class?: string;
	}

	let { acceptsNewMembers, detailed = false, class: className }: Props = $props();

	const status = $derived(MEMBERSHIP[acceptsNewMembers]);
	const StatusIcon = $derived(status?.icon);
</script>

{#if status}
	<Chip
		tint={status.tint}
		class={cn(!detailed && 'px-2 py-0.5 text-xs [&>svg]:size-3', className)}
		data-testid="membership-status"
	>
		<StatusIcon />
		{detailed ? status.detailedLabel() : status.label()}
	</Chip>
{/if}
