import { z } from 'zod';

export const resetPasswordSchema = z
	.object({
		password: z.string().min(1, 'forms_validation_required').min(8, 'forms_validation_min_length'),
		passwordConfirmation: z.string().min(1, 'forms_validation_required')
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: 'forms_validation_passwords_must_match',
		path: ['passwordConfirmation']
	});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
