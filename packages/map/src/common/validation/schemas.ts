import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .email({ message: 'forms.validation.email' }),
  password: z.string().min(1, { message: 'forms.validation.required' })
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'forms.validation.required' })
      .max(255, { message: 'forms.validation.maxLength' }),
    email: z
      .string()
      .min(1, { message: 'forms.validation.required' })
      .email({ message: 'forms.validation.email' })
      .max(255, { message: 'forms.validation.maxLength' }),
    phone: z
      .string()
      .max(255, { message: 'forms.validation.maxLength' })
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(1, { message: 'forms.validation.required' })
      .max(255, { message: 'forms.validation.maxLength' }),
    passwordConfirmation: z
      .string()
      .min(1, { message: 'forms.validation.required' })
      .max(255, { message: 'forms.validation.maxLength' })
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'forms.validation.passwordMatch',
    path: ['passwordConfirmation']
  })

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
