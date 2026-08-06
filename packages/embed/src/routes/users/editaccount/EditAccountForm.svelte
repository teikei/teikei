<script lang="ts">
	import { untrack } from 'svelte';
	import * as Field from '$lib/components/ui/field';
	import { Heading, Paragraph } from '$lib/components/typography';
	import { FormInput, FormSelect, FormErrorAlert, FormSubmitButton } from '$lib/components/forms';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages.js';
	import { editAccountSchema, type EditAccountFormData } from './schema';
	import type { CurrentUser } from '$lib/types/user';

	interface Props {
		user: CurrentUser;
		onSubmit: (values: EditAccountFormData) => void;
		error?: string | undefined;
		isLoading?: boolean;
	}

	let { user, onSubmit, isLoading = false, error }: Props = $props();

	// Form initialization intentionally captures the initial user values.
	// The form manages its own state after initialization.
	const form = superForm(
		untrack(() =>
			defaults(
				{
					name: user.name,
					email: user.email,
					phone: user.phone || '',
					locale: user.locale || 'de-DE',
					password: ''
				},
				zod4(editAccountSchema)
			)
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

<div class="flex flex-col gap-8">
	<Heading level={2}>{m.users_account_title()}</Heading>
	<div class="flex flex-col gap-8">
		<FormErrorAlert {error} />

		<form method="POST" use:enhance class="flex flex-col gap-6">
			<Field.Set>
				<Field.Legend class="text-primary">{m.users_account_your_data()}</Field.Legend>
				<Field.Group>
					<FormInput
						id="name"
						type="text"
						name="name"
						autocomplete="name"
						label={m.user_form_name()}
						bind:value={$formData.name}
						error={$errors.name}
					/>

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
						id="phone"
						type="tel"
						name="phone"
						autocomplete="tel"
						label={m.user_form_phone()}
						bind:value={$formData.phone}
						error={$errors.phone}
					/>

					<FormSelect
						id="locale"
						label={m.users_account_locale()}
						bind:value={$formData.locale}
						options={[
							{ value: 'de-DE', label: m.users_account_locale_de_de() },
							{ value: 'de-CH', label: m.users_account_locale_de_ch() },
							{ value: 'fr-CH', label: m.users_account_locale_fr_ch() }
						]}
					/>
				</Field.Group>
			</Field.Set>

			<Field.Set>
				<Field.Legend class="text-primary">{m.users_account_password_section()}</Field.Legend>
				<Field.Group>
					<FormInput
						id="password"
						type="password"
						name="password"
						autocomplete="current-password"
						label={m.users_account_current_password()}
						bind:value={$formData.password}
						error={$errors.password}
					/>
					<Paragraph size="small">{m.users_account_current_password_explanation()}</Paragraph>
				</Field.Group>
			</Field.Set>

			<FormSubmitButton {isLoading} loadingLabel={m.user_form_submitting()}>
				{m.users_account_submit()}
			</FormSubmitButton>
		</form>
	</div>
</div>
