<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditorAccountInfo from './EditorAccountInfo.svelte';
	import { authStore } from '$lib/stores/auth.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/EditorAccountInfo',
		component: EditorAccountInfo,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Renders nothing unless a user is signed in; stories set the auth store directly.'
				}
			}
		},
		beforeEach: () => {
			authStore.setUser({ id: '1', name: 'Erika Mustermann', email: 'erika@example.org' });
		}
	});
</script>

<Story name="Signed In" asChild>
	<div class="w-sm">
		<EditorAccountInfo />
	</div>
</Story>
