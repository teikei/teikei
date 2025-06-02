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

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .email({ message: 'forms.validation.email' })
})

export const resetPasswordSchema = z
  .object({
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

export const editAccountSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  email: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .email({ message: 'forms.validation.email' })
    .max(100, { message: 'forms.validation.maxLength' }),
  phone: z
    .string()
    .max(100, { message: 'forms.validation.maxLength' })
    .optional()
    .or(z.literal('')),
  locale: z.enum(['de-DE', 'de-CH', 'fr-CH']),
  password: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' })
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type EditAccountFormData = z.infer<typeof editAccountSchema>
