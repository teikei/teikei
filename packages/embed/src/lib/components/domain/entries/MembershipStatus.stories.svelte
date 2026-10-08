<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MembershipStatus from './MembershipStatus.svelte';

	const { Story } = defineMeta({
		title: 'App/Entry Profile/MembershipStatus',
		component: MembershipStatus,
		tags: ['autodocs'],
		argTypes: {
			acceptsNewMembers: { control: 'inline-radio', options: ['yes', 'waitlist', 'no'] },
			detailed: { control: 'boolean' }
		}
	});
</script>

<Story name="Yes" args={{ acceptsNewMembers: 'yes' }} />
<Story name="Waitlist" args={{ acceptsNewMembers: 'waitlist' }} />
<Story name="No" args={{ acceptsNewMembers: 'no' }} />
<Story name="Detailed" args={{ acceptsNewMembers: 'yes', detailed: true }} />
