import { z } from 'zod';

export const editAccountSchema = z.object({
	name: z.string().min(1, 'forms_validation_required').min(2, 'forms_validation_min_length'),
	email: z.string().min(1, 'forms_validation_required').email('forms_validation_email'),
	phone: z.string().optional(),
	locale: z.string().optional(),
	password: z.string().min(1, 'forms_validation_required')
});

export type EditAccountFormData = z.infer<typeof editAccountSchema>;
