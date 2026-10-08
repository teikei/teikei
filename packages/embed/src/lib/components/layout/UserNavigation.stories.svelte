<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UserNavigation from './UserNavigation.svelte';
	import { authStore } from '$lib/stores/auth.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Layout/UserNavigation',
		component: UserNavigation,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component: 'Positioned absolutely at the top right. Stories set the auth store directly.'
				}
			}
		}
	});
</script>

<Story name="Signed Out" asChild beforeEach={() => authStore.setUser(null)}>
	<div class="relative h-40">
		<UserNavigation />
	</div>
</Story>

<Story
	name="Signed In"
	asChild
	beforeEach={() =>
		authStore.setUser({ id: '1', name: 'Erika Mustermann', email: 'erika@example.org' })}
>
	<div class="relative h-40">
		<UserNavigation />
	</div>
</Story>
