<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Button } from '$lib/components/ui/button';
	import { Heading, Paragraph, FormInput, FormErrorAlert } from '$lib/components/shared';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { editAccountSchema, type EditAccountFormData } from './schema';
	import type { CurrentUser } from '$lib/api/auth';

	interface Props {
		user: CurrentUser;
		onSubmit: (values: EditAccountFormData) => void;
		error?: string | undefined;
		isLoading?: boolean;
	}

	let { user, onSubmit, isLoading = false, error }: Props = $props();

	const form = superForm(
		defaults(
			{
				name: user.name,
				email: user.email,
				phone: user.phone || '',
				locale: user.locale || 'de-DE',
				password: ''
			},
			zod4(editAccountSchema)
		),
		{
			validators: zod4Client(editAccountSchema),
			SPA: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					onSubmit(form.data as EditAccountFormData);
				}
			}
		}
	);

	const { form: formData, enhance, errors } = form;
</script>

<div class="space-y-8">
	<Heading level={2}>{m.users_account_title()}</Heading>
	<div class="space-y-8">
		<FormErrorAlert {error} />

		<form method="POST" use:enhance class="space-y-6">
			<Field.Set>
				<Field.Legend>{m.users_account_your_data()}</Field.Legend>
				<Field.Group>
					<FormInput
						id="name"
						type="text"
						label={m.user_form_name()}
						bind:value={$formData.name}
						error={$errors.name}
					/>

					<FormInput
						id="email"
						type="email"
						label={m.user_form_email()}
						bind:value={$formData.email}
						error={$errors.email}
					/>

					<FormInput
						id="phone"
						type="text"
						label={m.user_form_phone()}
						bind:value={$formData.phone}
						error={$errors.phone}
					/>

					<Field.Field>
						<Field.Label for="locale">{m.users_account_locale()}</Field.Label>
						<select
							id="locale"
							bind:value={$formData.locale}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
						>
							<option value="de-DE">{m.users_account_locale_de_de()}</option>
							<option value="de-CH">{m.users_account_locale_de_ch()}</option>
							<option value="fr-CH">{m.users_account_locale_fr_ch()}</option>
						</select>
					</Field.Field>
				</Field.Group>
			</Field.Set>

			<Field.Set>
				<Field.Legend>{m.users_account_password_section()}</Field.Legend>
				<Field.Group>
					<FormInput
						id="password"
						type="password"
						label={m.users_account_current_password()}
						bind:value={$formData.password}
						error={$errors.password}
					/>
					<Paragraph size="small">{m.users_account_current_password_explanation()}</Paragraph>
				</Field.Group>
			</Field.Set>

			<Button type="submit" disabled={isLoading}>
				{isLoading ? m.user_form_submitting() : m.users_account_submit()}
			</Button>
		</form>
	</div>
</div>
