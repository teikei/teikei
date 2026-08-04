<script lang="ts">
	import { recoverPassword } from '$lib/api/auth';
	import { AuthDialog } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import RecoverPasswordForm from './RecoverPasswordForm.svelte';
	import type { RecoverPasswordFormData } from './schema';

	let isLoading = $state(false);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: RecoverPasswordFormData) {
		isLoading = true;
		error = undefined;

		try {
			await recoverPassword({ email: values.email });
			success = true;
		} catch (err) {
			error = resolveApiErrorMessage(err, m.errors_recover_password_failed());
		} finally {
			isLoading = false;
		}
	}
</script>

<AuthDialog title={m.users_recover_password_title()} variant="plain">
	<RecoverPasswordForm onSubmit={handleSubmit} {success} {isLoading} {error} />
</AuthDialog>
