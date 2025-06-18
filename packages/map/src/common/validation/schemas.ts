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

// Shared schemas for common form elements
export const addressSchema = z.object({
  city: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  address: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(255, { message: 'forms.validation.maxLength' }),
  latitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-90, { message: 'forms.validation.invalidLatitude' })
    .max(90, { message: 'forms.validation.invalidLatitude' }),
  longitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-180, { message: 'forms.validation.invalidLongitude' })
    .max(180, { message: 'forms.validation.invalidLongitude' })
})

export const acceptsNewMembersSchema = z.enum(['yes', 'no', 'waitlist'], {
  message: 'forms.validation.required'
})

// Farm form schema
export const farmSchema = z.object({
  // Basic information
  name: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  url: z
    .string()
    .max(100, { message: 'forms.validation.maxLength' })
    .url({ message: 'forms.validation.invalidUrl' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(1000, { message: 'forms.validation.maxLength' }),

  // Address and location
  city: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  address: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(255, { message: 'forms.validation.maxLength' }),
  latitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-90, { message: 'forms.validation.invalidLatitude' })
    .max(90, { message: 'forms.validation.invalidLatitude' }),
  longitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-180, { message: 'forms.validation.invalidLongitude' })
    .max(180, { message: 'forms.validation.invalidLongitude' }),

  // Products
  products: z
    .array(z.string())
    .min(1, { message: 'forms.validation.selectAtLeastOne' }),
  additionalProductInformation: z
    .string()
    .max(1000, { message: 'forms.validation.maxLength' })
    .optional()
    .or(z.literal('')),

  // Economic behavior
  actsEcological: z.boolean().optional(),
  economicalBehavior: z
    .string()
    .max(1000, { message: 'forms.validation.maxLength' })
    .optional()
    .or(z.literal('')),
  foundedAtYear: z
    .number({ message: 'forms.validation.invalidNumber' })
    .int({ message: 'forms.validation.invalidInteger' })
    .min(1900, { message: 'forms.validation.invalidYear' })
    .max(new Date().getFullYear(), { message: 'forms.validation.futureYear' })
    .optional(),
  foundedAtMonth: z
    .number({ message: 'forms.validation.invalidNumber' })
    .int({ message: 'forms.validation.invalidInteger' })
    .min(1, { message: 'forms.validation.invalidMonth' })
    .max(12, { message: 'forms.validation.invalidMonth' })
    .optional(),

  // Certifications/Badges
  badges: z.array(z.string()).optional().default([]),

  // Membership
  acceptsNewMembers: acceptsNewMembersSchema.optional(),
  maximumMembers: z
    .number({ message: 'forms.validation.invalidNumber' })
    .int({ message: 'forms.validation.invalidInteger' })
    .min(1, { message: 'forms.validation.minimumMembers' })
    .optional(),
  participation: z
    .string()
    .max(1000, { message: 'forms.validation.maxLength' })
    .optional()
    .or(z.literal(''))
})

// Initiative form schema
export const initiativeSchema = z.object({
  // Basic information
  name: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  url: z
    .string()
    .max(100, { message: 'forms.validation.maxLength' })
    .url({ message: 'forms.validation.invalidUrl' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(1000, { message: 'forms.validation.maxLength' }),

  // Address and location
  city: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  address: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(255, { message: 'forms.validation.maxLength' }),
  latitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-90, { message: 'forms.validation.invalidLatitude' })
    .max(90, { message: 'forms.validation.invalidLatitude' }),
  longitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-180, { message: 'forms.validation.invalidLongitude' })
    .max(180, { message: 'forms.validation.invalidLongitude' }),

  // Goals and objectives
  goals: z
    .array(z.string())
    .min(1, { message: 'forms.validation.selectAtLeastOne' }),

  // Certifications/Badges
  badges: z.array(z.string()).optional().default([])
})

// Depot form schema
export const depotSchema = z.object({
  // Basic information
  name: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  url: z
    .string()
    .max(100, { message: 'forms.validation.maxLength' })
    .url({ message: 'forms.validation.invalidUrl' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(1000, { message: 'forms.validation.maxLength' }),

  // Address and location
  city: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(100, { message: 'forms.validation.maxLength' }),
  address: z
    .string()
    .min(1, { message: 'forms.validation.required' })
    .max(255, { message: 'forms.validation.maxLength' }),
  latitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-90, { message: 'forms.validation.invalidLatitude' })
    .max(90, { message: 'forms.validation.invalidLatitude' }),
  longitude: z
    .number({ message: 'forms.validation.invalidNumber' })
    .min(-180, { message: 'forms.validation.invalidLongitude' })
    .max(180, { message: 'forms.validation.invalidLongitude' }),

  // Farm association
  farms: z
    .array(z.string())
    .min(1, { message: 'forms.validation.selectAtLeastOne' }),

  // Details
  deliveryDays: z
    .string()
    .max(100, { message: 'forms.validation.maxLength' })
    .optional()
    .or(z.literal(''))
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type EditAccountFormData = z.infer<typeof editAccountSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type FarmFormData = z.infer<typeof farmSchema>
export type InitiativeFormData = z.infer<typeof initiativeSchema>
export type DepotFormData = z.infer<typeof depotSchema>
