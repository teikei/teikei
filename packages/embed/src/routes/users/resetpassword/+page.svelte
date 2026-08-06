<script lang="ts">
	import { resetPassword } from '$lib/api/auth';
	import { AuthDialog } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';
	import ResetPasswordForm from './ResetPasswordForm.svelte';
	import type { ResetPasswordFormData } from './schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isLoading = $state(false);
	let success = $state(false);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(values: ResetPasswordFormData) {
		isLoading = true;
		error = undefined;

		try {
			await resetPassword({
				resetPasswordToken: data.resetToken,
				password: values.password
			});
			success = true;
		} catch (err) {
			error = resolveApiErrorMessage(err, m.errors_reset_password_failed());
		} finally {
			isLoading = false;
		}
	}
</script>

<AuthDialog title={m.users_reset_password_title()} variant="plain">
	<ResetPasswordForm onSubmit={handleSubmit} {success} {isLoading} {error} />
</AuthDialog>
