<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { SidebarScrollArea } from '$lib/components/layout';
	import { IconButton } from '$lib/components/actions';
	import EntryContactForm from './EntryContactForm.svelte';
	import { toastSuccess } from '$lib/utils/toast';
	import type { MainEntryType } from '$lib/types/entries';
	import * as m from '$lib/paraglide/messages.js';

	interface EntryContactViewProps {
		entryId: string;
		entryType: MainEntryType;
		/** Shown in the header so the sender knows which entry they are contacting. */
		entryName: string;
		/** Prefill values (from the authenticated session); fields stay editable. */
		initialName?: string;
		initialEmail?: string;
		/** Return to the profile view (Feature 5: the contact view replaces it). */
		onBack: () => void;
	}

	let {
		entryId,
		entryType,
		entryName,
		initialName = '',
		initialEmail = '',
		onBack
	}: EntryContactViewProps = $props();

	// A successful send returns to the profile with a toast (F5.4); the profile
	// remounts scrolled to the top (top-scroll on return, per plan task 5.1).
	function handleSent() {
		toastSuccess(m.entry_contact_success());
		onBack();
	}
</script>

<Sidebar.Header class="border-b border-separator">
	<div class="flex items-center gap-2">
		<IconButton
			class="shrink-0 max-md:size-11"
			data-testid="entry-contact-back"
			label={m.entry_contact_back()}
			onclick={onBack}
		>
			<ArrowLeftIcon />
		</IconButton>
		<h2 class="min-w-0 flex-1 truncate text-lg leading-tight font-semibold text-foreground">
			{entryName}
		</h2>
	</div>
</Sidebar.Header>

<SidebarScrollArea>
	<div class="p-4">
		<EntryContactForm {entryId} {entryType} {initialName} {initialEmail} onSent={handleSent} />
	</div>
</SidebarScrollArea>
