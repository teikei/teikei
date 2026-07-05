<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { AppButton } from '$lib/components/actions';
	import { Heading, Paragraph } from '$lib/components/typography';
	import { FormInput, FormErrorAlert, FormSubmitButton } from '$lib/components/forms';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { routeBuilders } from '$lib/utils/routes';
	import { resetPasswordSchema, type ResetPasswordFormData } from './schema';

	interface Props {
		onSubmit: (values: ResetPasswordFormData) => void;
		success: boolean;
		error?: string | undefined;
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false, success = false, error }: Props = $props();

	const form = superForm(defaults(zod4(resetPasswordSchema)), {
		validators: zod4Client(resetPasswordSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				onSubmit(form.data as ResetPasswordFormData);
			}
		}
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="flex flex-col gap-8">
	{#if success}
		<Heading level={2}>{m.users_reset_password_title()}</Heading>
		<Paragraph>{m.users_reset_password_success()}</Paragraph>
		<AppButton href={routeBuilders.auth.signIn()}>
			{m.user_form_submit()}
		</AppButton>
	{:else}
		<Heading level={2}>{m.users_reset_password_title()}</Heading>
		<div class="flex flex-col gap-8">
			<FormErrorAlert {error} />

			<form method="POST" use:enhance class="flex flex-col gap-4">
				<Field.Group>
					<FormInput
						id="password"
						type="password"
						name="password"
						autocomplete="new-password"
						label={m.users_reset_password_new()}
						bind:value={$formData.password}
						error={$errors.password}
					/>

					<FormInput
						id="passwordConfirmation"
						type="password"
						name="passwordConfirmation"
						autocomplete="new-password"
						label={m.users_reset_password_confirm()}
						bind:value={$formData.passwordConfirmation}
						error={$errors.passwordConfirmation}
					/>
				</Field.Group>

				<FormSubmitButton {isLoading} loadingLabel={m.user_form_submitting()}>
					{m.users_reset_password_submit()}
				</FormSubmitButton>
			</form>
		</div>
	{/if}
</div>
