<script lang="ts">
	import { goto } from '$app/navigation';
	import { updatePassword } from '$lib/api/auth';
	import { AuthDialog } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import EditPasswordForm from './EditPasswordForm.svelte';
	import type { EditPasswordFormData } from './schema';
	import type { PageData } from './$types';
	import { routeBuilders } from '$lib/utils/routes';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: EditPasswordFormData) {
		isLoading = true;
		error = undefined;

		try {
			await updatePassword({
				oldPassword: values.oldPassword,
				password: values.password,
				email: data.user.email
			});
			goto(routeBuilders.home());
		} catch (err) {
			error = resolveApiErrorMessage(err, m.errors_password_change_failed());
		} finally {
			isLoading = false;
		}
	}
</script>

<AuthDialog title={m.users_password_change_title()} variant="plain">
	<EditPasswordForm onSubmit={handleSubmit} {isLoading} {error} />
</AuthDialog>
