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

<div class="space-y-8">
	<Heading level={2}>{m.user_form_sign_in_title()}</Heading>

	<div class="space-y-8">
		<Paragraph>
			{m.user_form_new()}
			<a href={routeBuilders.auth.signUp()} class="text-primary underline hover:no-underline">
				{m.user_form_sign_up_link()}
			</a>
		</Paragraph>
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

				<FormInput
					id="password"
					type="password"
					label={m.user_form_password()}
					bind:value={$formData.password}
					error={$errors.password}
				>
					{#snippet labelExtra()}
						<a
							href={routeBuilders.auth.recoverPassword()}
							class="text-sm text-muted-foreground hover:text-primary"
						>
							{m.user_form_forgot_password()}
						</a>
					{/snippet}
				</FormInput>
			</Field.Group>

			<Button type="submit" disabled={isLoading}>
				{isLoading ? m.user_form_submitting() : m.user_form_submit()}
			</Button>
		</form>
	</div>
</div>
