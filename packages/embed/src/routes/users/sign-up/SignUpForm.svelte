<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { AppButton } from '$lib/components/actions';
	import { Heading, Paragraph, TextLink } from '$lib/components/typography';
	import { FormInput, FormErrorAlert, FormSubmitButton } from '$lib/components/forms';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { routeBuilders } from '$lib/utils/routes';
	import { signUpSchema, type SignUpFormData } from './schema';

	interface Props {
		onSubmit: (values: SignUpFormData) => void;
		signUpSuccess: boolean;
		error?: string | undefined;
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false, signUpSuccess = false, error }: Props = $props();

	const form = superForm(defaults(zod4(signUpSchema)), {
		validators: zod4Client(signUpSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				onSubmit(form.data as SignUpFormData);
			}
		}
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="flex flex-col gap-8">
	{#if signUpSuccess}
		<Heading level={2}>{m.users_signup_success_title()}</Heading>
		<Paragraph>{m.users_signup_success_text()}</Paragraph>
		<AppButton href={routeBuilders.home()}>
			{m.users_signup_back_to_map()}
		</AppButton>
	{:else}
		<Heading level={2}>{m.user_form_sign_up_title()}</Heading>
		<div class="flex flex-col gap-8">
			<Paragraph>
				{m.user_form_existing()}
				<TextLink href={routeBuilders.auth.signIn()}>
					{m.user_form_sign_in_link()}
				</TextLink>
			</Paragraph>

			<Paragraph size="small">{m.user_form_required_fields()}</Paragraph>

			<FormErrorAlert {error} />

			<form method="POST" use:enhance class="flex flex-col gap-4">
				<Field.Group>
					<FormInput
						id="name"
						type="text"
						name="name"
						autocomplete="name"
						required
						label={m.user_form_name()}
						bind:value={$formData.name}
						error={$errors.name}
					/>

					<FormInput
						id="phone"
						type="tel"
						name="phone"
						autocomplete="tel"
						label={m.user_form_phone()}
						bind:value={$formData.phone}
						error={$errors.phone}
					/>

					<FormInput
						id="email"
						type="email"
						name="email"
						autocomplete="email"
						required
						label={m.user_form_email()}
						bind:value={$formData.email}
						error={$errors.email}
					/>

					<FormInput
						id="password"
						type="password"
						name="password"
						autocomplete="new-password"
						required
						label={m.user_form_password()}
						bind:value={$formData.password}
						error={$errors.password}
					/>

					<FormInput
						id="passwordConfirmation"
						type="password"
						name="passwordConfirmation"
						autocomplete="new-password"
						required
						label={m.user_form_password_confirmation()}
						bind:value={$formData.passwordConfirmation}
						error={$errors.passwordConfirmation}
					/>
				</Field.Group>

				<Paragraph size="small">
					{m.user_form_confirmation()}
					<a
						href="https://ernte-teilen.org/nutzungsbedingungen"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary underline hover:no-underline"
					>
						{m.user_form_terms()}
					</a>
					/
					<a
						href="https://ernte-teilen.org/datenschutz"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary underline hover:no-underline"
					>
						{m.user_form_privacy()}
					</a>
				</Paragraph>

				<FormSubmitButton {isLoading} loadingLabel={m.user_form_submitting()}>
					{m.user_form_submit_register()}
				</FormSubmitButton>
			</form>
		</div>
	{/if}
</div>
