<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProfileSkeleton from './ProfileSkeleton.svelte';

	const { Story } = defineMeta({
		title: 'App/Entry Profile/ProfileSkeleton',
		component: ProfileSkeleton,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<div class="w-sm">
		<ProfileSkeleton />
	</div>
</Story>
