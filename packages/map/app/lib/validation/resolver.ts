import { zodResolver } from '@hookform/resolvers/zod'
import i18n from 'i18next'
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

// Custom zod resolver that translates error messages
export const createZodResolver = <T extends z.ZodType<any, any, any>>(
  schema: T
): Resolver<z.infer<T>> => {
  const resolver = zodResolver(schema)

  return async (values, context, options) => {
    const result = await resolver(values, context, options)

    if (result.errors && typeof result.errors === 'object') {
      // Translate error messages
      const errors = result.errors as FieldErrors<FieldValues>
      Object.keys(errors).forEach((key) => {
        const error = errors[key]
        if (
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
        ) {
          const translatedMessage = i18n.t(error.message) as string
          ;(errors as any)[key] = {
            ...error,
            message: translatedMessage
          }
        }
      })
    }

    return result
  }
}
