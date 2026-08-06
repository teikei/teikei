import { z } from 'zod';

export const signInSchema = z.object({
	email: z.email('forms_validation_email').min(1, 'forms_validation_required'),
	password: z.string().min(1, 'forms_validation_required')
});

export type SignInFormData = z.infer<typeof signInSchema>;
