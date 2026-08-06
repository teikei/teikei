import { z } from 'zod';

export const signUpSchema = z
	.object({
		name: z.string().min(1, 'forms_validation_required').min(2, 'forms_validation_min_length'),
		phone: z.string().optional(),
		email: z.string().min(1, 'forms_validation_required').email('forms_validation_email'),
		password: z.string().min(1, 'forms_validation_required').min(8, 'forms_validation_min_length'),
		passwordConfirmation: z.string().min(1, 'forms_validation_required')
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: 'forms_validation_passwords_must_match',
		path: ['passwordConfirmation']
	});

export type SignUpFormData = z.infer<typeof signUpSchema>;
