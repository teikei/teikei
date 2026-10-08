<script lang="ts">
	import { goto } from '$app/navigation';
	import { updateUser } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { toastSuccess } from '$lib/utils/toast';
	import { AuthDialog } from '$lib/components/domain/auth';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import EditAccountForm from './EditAccountForm.svelte';
	import type { EditAccountFormData } from './schema';
	import type { PageData } from './$types';
	import { routeBuilders } from '$lib/utils/routes';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: EditAccountFormData) {
		isLoading = true;
		error = undefined;

		try {
			const response = await updateUser({
				id: data.user.id,
				name: values.name,
				email: values.email,
				phone: values.phone,
				locale: values.locale,
				password: values.password
			});

			if (response.id === data.user.id) {
				// Keep the session in sync: the password change flow identifies the
				// user by the cached email, so a stale one fails with USER_NOT_FOUND.
				authStore.setUser({
					...data.user,
					name: values.name,
					email: values.email,
					phone: values.phone,
					locale: values.locale
				});
				toastSuccess(m.users_account_update_success());
				goto(routeBuilders.home());
			} else {
				throw new Error(m.errors_account_update_failed());
			}
		} catch (err) {
			error = resolveApiErrorMessage(err, m.errors_account_update_failed());
		} finally {
			isLoading = false;
		}
	}
</script>

<AuthDialog title={m.users_account_title()} variant="plain">
	<EditAccountForm user={data.user} onSubmit={handleSubmit} {isLoading} {error} />
</AuthDialog>
