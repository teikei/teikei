<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { TextLink } from '$lib/components/typography';
	import { authStore } from '$lib/stores/auth.svelte';
	import { routeBuilders } from '$lib/utils/routes';
	import * as m from '$lib/paraglide/messages.js';
</script>

{#if authStore.isInitialized && authStore.user}
	<!-- Plain wrapper so parent list rhythms (e.g. `[&>*]:py-*` dividers) pad
	     around the bordered box instead of overriding its own padding. -->
	<div>
		<Field.Set class="rounded-md border p-3">
			<Field.Legend variant="label">{m.editor_account_info_title()}</Field.Legend>
			<Field.Description>
				{m.editor_account_info_email({ email: authStore.user.email })}
			</Field.Description>
			<TextLink href={routeBuilders.auth.editAccount()} target="_blank" rel="noopener noreferrer">
				{m.editor_account_info_edit_link()}
			</TextLink>
		</Field.Set>
	</div>
{/if}
