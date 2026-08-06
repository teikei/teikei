<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { TextLink } from '$lib/components/typography';
	import { authStore } from '$lib/stores/auth.svelte';
	import { routeBuilders } from '$lib/utils/routes';
	import * as m from '$lib/paraglide/messages.js';
	import ProfileSection from '$lib/components/domain/entries/sections/ProfileSection.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';
</script>

{#if authStore.isInitialized && authStore.user}
	<ProfileSection testId="profile-section-account-info" title={m.editor_account_info_title()}>
		<Paragraph class="text-sm text-foreground">
			{m.editor_account_info_email({ email: authStore.user.email })}
		</Paragraph>

		<TextLink href={routeBuilders.auth.editAccount()} target="_blank" rel="noopener noreferrer">
			{m.editor_account_info_edit_link()}
		</TextLink>
	</ProfileSection>
{/if}
