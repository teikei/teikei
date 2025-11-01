import { zodResolver } from '@hookform/resolvers/zod'
import i18n from 'i18next'
import type { FieldErrors } from 'react-hook-form'
import { z } from 'zod'

// Custom zod resolver that translates error messages
export const createZodResolver = (schema: z.ZodSchema) => {
  const resolver = zodResolver(schema)

  return async (values: any, context: any, options: any) => {
    const result = await resolver(values, context, options)

    if (result.errors && typeof result.errors === 'object') {
      // Translate error messages
      const errors = result.errors as FieldErrors<any>
      Object.keys(errors).forEach((key) => {
        const error = errors[key]
        if (error && error.message) {
          errors[key] = {
            ...error,
            message: i18n.t(error.message)
          }
        }
      })
    }

    return result
  }
}
