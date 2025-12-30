import { z } from 'zod';

export const editPasswordSchema = z.object({
	oldPassword: z.string().min(1, 'forms_validation_required'),
	password: z.string().min(1, 'forms_validation_required').min(8, 'forms_validation_min_length')
});

export type EditPasswordFormData = z.infer<typeof editPasswordSchema>;
