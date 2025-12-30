<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut, getCurrentUser, type CurrentUser } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as m from '$lib/paraglide/messages.js';
	import { ChevronDown, User, Key, LogOut } from '@lucide/svelte';

	let user: CurrentUser | null = $state(null);
	let isLoading = $state(true);

	async function loadUser() {
		isLoading = true;
		user = await getCurrentUser();
		isLoading = false;
	}

	async function handleSignOut() {
		await signOut();
		user = null;
		await goto('/');
	}

	function handleEditAccount() {
		goto('/#/users/editaccount');
	}

	function handleEditPassword() {
		goto('/#/users/editpassword');
	}

	$effect(() => {
		loadUser();
	});
</script>

<nav class="user-navigation">
	{#if isLoading}
		<!-- Show nothing while loading to avoid flash -->
	{:else if user}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="secondary" {...props}>
						{user.name}
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

