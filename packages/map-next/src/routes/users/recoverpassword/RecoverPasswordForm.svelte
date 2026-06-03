<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { AppButton } from '$lib/components/actions';
	import Heading from '$lib/components/typography/Heading.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import FormErrorAlert from '$lib/components/forms/FormErrorAlert.svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { routeBuilders } from '$lib/utils/routes';
	import { recoverPasswordSchema, type RecoverPasswordFormData } from './schema';

	interface Props {
		onSubmit: (values: RecoverPasswordFormData) => void;
		success: boolean;
		error?: string | undefined;
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false, success = false, error }: Props = $props();

	const form = superForm(defaults(zod4(recoverPasswordSchema)), {
		validators: zod4Client(recoverPasswordSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				onSubmit(form.data as RecoverPasswordFormData);
			}
		}
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="space-y-8">
	{#if success}
		<Heading level={2}>{m.users_recover_password_title()}</Heading>
		<Paragraph>{m.users_recover_password_success()}</Paragraph>
		<AppButton href={routeBuilders.home()}>
			{m.users_signup_back_to_map()}
		</AppButton>
	{:else}
		<Heading level={2}>{m.users_recover_password_title()}</Heading>
		<div class="space-y-8">
			<Paragraph>{m.users_recover_password_explanation()}</Paragraph>

			<FormErrorAlert {error} />

			<form method="POST" use:enhance class="space-y-4">
				<Field.Group>
					<FormInput
						id="email"
						type="email"
						label={m.user_form_email()}
						bind:value={$formData.email}
						error={$errors.email}
					/>
				</Field.Group>

				<AppButton type="submit" disabled={isLoading}>
					{isLoading ? m.user_form_submitting() : m.users_recover_password_submit()}
				</AppButton>
			</form>
		</div>
	{/if}
</div>
