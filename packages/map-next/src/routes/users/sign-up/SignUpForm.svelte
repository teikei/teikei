<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Button } from '$lib/components/ui/button';
	import { Heading, Paragraph, FormInput } from '$lib/components/shared';
	import { signUpSchema, type SignUpFormData } from './schema';
	import { defaults, superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		onSubmit: (values: SignUpFormData) => void;
		signUpSuccess: boolean;
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false, signUpSuccess = false }: Props = $props();

	const form = superForm(defaults(zod4(signUpSchema)), {
		validators: zod4Client(signUpSchema),
		SPA: true,
		onUpdate: ({ form: f }: { form: SuperValidated<Infer<typeof signUpSchema>> }) => {
			if (f.valid) {
				onSubmit(f.data as SignUpFormData);
			}
		}
	});

	signUpSuccess = true;

	const { form: formData, enhance, errors } = form;
</script>

<div class="space-y-8">
	{#if signUpSuccess}
		<Heading level={2}>{m.users_signup_success_title()}</Heading>
		<Paragraph>{m.users_signup_success_text()}</Paragraph>
		<a
			href="/#/"
			class="inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
		>
			{m.users_signup_back_to_map()}
		</a>
	{:else}
		<Heading level={2}>{m.user_form_sign_up_title()}</Heading>
		<div class="max-w-md space-y-8">
			<Paragraph>
				{m.user_form_existing()}
				<a href="/#/users/sign-in" class="text-primary underline hover:no-underline">
					{m.user_form_sign_in_link()}
				</a>
			</Paragraph>

			<Paragraph size="small">{m.user_form_required_fields()}</Paragraph>

			<form method="POST" use:enhance class="space-y-4">
				<Field.Group>
					<FormInput
						id="name"
						type="text"
						label="{m.user_form_name()} *"
						bind:value={$formData.name}
						error={$errors.name}
					/>

					<FormInput
						id="phone"
						type="text"
						label={m.user_form_phone()}
						bind:value={$formData.phone}
						error={$errors.phone}
					/>

					<FormInput
						id="email"
						type="email"
						label="{m.user_form_email()} *"
						bind:value={$formData.email}
						error={$errors.email}
					/>

					<FormInput
						id="password"
						type="password"
						label="{m.user_form_password()} *"
						bind:value={$formData.password}
						error={$errors.password}
					/>

					<FormInput
						id="passwordConfirmation"
						type="password"
						label="{m.user_form_password_confirmation()} *"
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
					{' / '}
					<a
						href="https://ernte-teilen.org/datenschutz"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary underline hover:no-underline"
					>
						{m.user_form_privacy()}
					</a>
				</Paragraph>

				<Button type="submit" disabled={isLoading}>
					{isLoading ? m.user_form_submitting() : m.user_form_submit_register()}
				</Button>
			</form>
		</div>
	{/if}
</div>
