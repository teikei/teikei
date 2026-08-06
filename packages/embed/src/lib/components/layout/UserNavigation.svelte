<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { AppButton } from '$lib/components/actions';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { toastSuccess } from '$lib/utils/toast';
	import * as m from '$lib/paraglide/messages.js';
	import { ChevronDown, User, Key, LogOut, List, CircleHelp } from '@lucide/svelte';
	import { routeBuilders } from '$lib/utils/routes';
	import config from '$lib/config/app-configuration';

	async function handleSignOut() {
		await signOut();
		toastSuccess(m.user_onboarding_sign_out_success());
		await goto(routeBuilders.home());
	}

	function handleEditAccount() {
		goto(routeBuilders.auth.editAccount());
	}

	function handleEditPassword() {
		goto(routeBuilders.auth.editPassword());
	}

	function handleManageEntries() {
		goto(routeBuilders.myEntries());
	}
</script>

<nav class="user-navigation">
	{#if config.externalHelpUrl}
		<AppButton
			variant="outline"
			class="shadow-md"
			href={config.externalHelpUrl}
			target="_blank"
			rel="noopener noreferrer"
		>
			<CircleHelp class="size-4" />
			{m.nav_help()}
		</AppButton>
	{/if}
	{#if !authStore.isInitialized}
		<!-- Show nothing while loading to avoid flash -->
	{:else if authStore.user}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<AppButton variant="outline" class="shadow-md" {...props}>
						{authStore.user?.name}
						<ChevronDown class="size-4" />
					</AppButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item onclick={handleManageEntries}>
					<List class="size-4" />
					{m.nav_my_entries()}
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleEditAccount}>
					<User class="size-4" />
					{m.nav_edit_account()}
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={handleEditPassword}>
					<Key class="size-4" />
					{m.nav_edit_password()}
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleSignOut}>
					<LogOut class="size-4" />
					{m.nav_logout()}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{:else}
		<AppButton variant="outline" class="shadow-md" href={routeBuilders.auth.signIn()}>
			{m.nav_edit_entries()}
		</AppButton>
	{/if}
</nav>

<style>
	.user-navigation {
		position: absolute;
		top: 18px;
		right: 10px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
