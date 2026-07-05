<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Heading, Paragraph, TextLink } from '$lib/components/typography';
	import { FormInput, FormErrorAlert, FormSubmitButton } from '$lib/components/forms';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { routeBuilders } from '$lib/utils/routes';

	import { signInSchema, type SignInFormData } from './schema';

	interface Props {
		error?: string | undefined;
		onSubmit: (values: SignInFormData) => void;
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false, error }: Props = $props();

	const form = superForm(defaults(zod4(signInSchema)), {
		validators: zod4Client(signInSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				onSubmit(form.data);
			}
		}
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="flex flex-col gap-8">
	<Heading level={2}>{m.user_form_sign_in_title()}</Heading>

	<div class="flex flex-col gap-8">
		<Paragraph>
			{m.user_form_new()}
			<TextLink href={routeBuilders.auth.signUp()}>
				{m.user_form_sign_up_link()}
			</TextLink>
		</Paragraph>
		<FormErrorAlert {error} />

		<form method="POST" use:enhance class="flex flex-col gap-4">
			<Field.Group>
				<FormInput
					id="email"
					type="email"
					name="email"
					autocomplete="email"
					label={m.user_form_email()}
					bind:value={$formData.email}
					error={$errors.email}
				/>

				<FormInput
					id="password"
					type="password"
					name="password"
					autocomplete="current-password"
					label={m.user_form_password()}
					bind:value={$formData.password}
					error={$errors.password}
				>
					{#snippet labelExtra()}
						<TextLink variant="muted" class="text-sm" href={routeBuilders.auth.recoverPassword()}>
							{m.user_form_forgot_password()}
						</TextLink>
					{/snippet}
				</FormInput>
			</Field.Group>

			<FormSubmitButton {isLoading} loadingLabel={m.user_form_submitting()}>
				{m.user_form_submit()}
			</FormSubmitButton>
		</form>
	</div>
</div>
