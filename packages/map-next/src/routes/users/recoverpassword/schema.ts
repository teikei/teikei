import { z } from 'zod';

export const recoverPasswordSchema = z.object({
	email: z.string().min(1, 'forms_validation_required').email('forms_validation_email')
});

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;
