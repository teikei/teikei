<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Button } from '$lib/components/ui/button';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import FormInput from '$lib/components/shared/forms/FormInput.svelte';
	import FormErrorAlert from '$lib/components/shared/forms/FormErrorAlert.svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { hashRoutes } from '$lib/utils/routes';
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

<div class="space-y-8">
	{#if success}
		<Heading level={2}>{m.users_reset_password_title()}</Heading>
		<Paragraph>{m.users_reset_password_success()}</Paragraph>
		<a
			href={hashRoutes.auth.signIn}
			class="inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
		>
			{m.user_form_submit()}
		</a>
	{:else}
		<Heading level={2}>{m.users_reset_password_title()}</Heading>
		<div class="space-y-8">
			<FormErrorAlert {error} />

			<form method="POST" use:enhance class="space-y-4">
				<Field.Group>
					<FormInput
						id="password"
						type="password"
						label={m.users_reset_password_new()}
						bind:value={$formData.password}
						error={$errors.password}
					/>

					<FormInput
						id="passwordConfirmation"
						type="password"
						label={m.users_reset_password_confirm()}
						bind:value={$formData.passwordConfirmation}
						error={$errors.passwordConfirmation}
					/>
				</Field.Group>

				<Button type="submit" disabled={isLoading}>
					{isLoading ? m.user_form_submitting() : m.users_reset_password_submit()}
				</Button>
			</form>
		</div>
	{/if}
</div>
