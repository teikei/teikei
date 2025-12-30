<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/api/auth';
	import { currentUser, isInitialized, initializeAuth } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as m from '$lib/paraglide/messages.js';
	import { ChevronDown, User, Key, LogOut } from '@lucide/svelte';

	async function handleSignOut() {
		await signOut();
		await goto('/');
	}

	function handleEditAccount() {
		goto('/#/users/editaccount');
	}

	function handleEditPassword() {
		goto('/#/users/editpassword');
	}

	// Initialize auth store if not already done
	$effect(() => {
		if (!$isInitialized) {
			initializeAuth();
		}
	});
</script>

<nav class="user-navigation">
	{#if !$isInitialized}
		<!-- Show nothing while loading to avoid flash -->
	{:else if $currentUser}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="secondary" {...props}>
						{$currentUser.name}
						<ChevronDown class="size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
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
		<Button variant="secondary" href="/#/users/signin">
			{m.nav_edit_entries()}
		</Button>
	{/if}
</nav>

<style>
	.user-navigation {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 10;
	}
</style>
