<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Heading } from '$lib/components/typography';
	import { FormInput, FormErrorAlert, FormSubmitButton } from '$lib/components/forms';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { editPasswordSchema, type EditPasswordFormData } from './schema';

	interface Props {
		onSubmit: (values: EditPasswordFormData) => void;
		error?: string | undefined;
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false, error }: Props = $props();

	const form = superForm(defaults(zod4(editPasswordSchema)), {
		validators: zod4Client(editPasswordSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				onSubmit(form.data as EditPasswordFormData);
			}
		}
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="flex flex-col gap-8">
	<Heading level={2}>{m.users_password_change_title()}</Heading>
	<div class="flex flex-col gap-8">
		<FormErrorAlert {error} />

		<form method="POST" use:enhance class="flex flex-col gap-4">
			<Field.Group>
				<FormInput
					id="oldPassword"
					type="password"
					name="oldPassword"
					autocomplete="current-password"
					label={m.users_password_current()}
					bind:value={$formData.oldPassword}
					error={$errors.oldPassword}
				/>

				<FormInput
					id="password"
					type="password"
					name="password"
					autocomplete="new-password"
					label={m.users_password_new()}
					bind:value={$formData.password}
					error={$errors.password}
				/>
			</Field.Group>

			<FormSubmitButton {isLoading} loadingLabel={m.user_form_submitting()}>
				{m.users_password_submit()}
			</FormSubmitButton>
		</form>
	</div>
</div>
