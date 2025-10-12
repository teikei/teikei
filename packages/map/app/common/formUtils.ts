// @ts-ignore
import i18n from 'i18next'
import Joi from 'joi-browser'
import _ from 'lodash'

import { schemas } from '~/common/validation'

type PlainObject = Record<string, unknown>

type JoiValidationDetail = {
  path: Array<string | number>
  type: string
  context?: Record<string, unknown>
}

type JoiValidationResult = {
  error: null | { details: JoiValidationDetail[] }
}

const isPlainObject = (value: unknown): value is PlainObject =>
  _.isPlainObject(value)

export const dirtyValues = (
  values: PlainObject,
  initialValues: PlainObject
): PlainObject => {
  return Object.keys(values).reduce<PlainObject>((acc, key) => {
    const value = values[key]
    const initialValue = initialValues[key]

    if (!_.isEqual(value, initialValue)) {
      if (isPlainObject(value) && isPlainObject(initialValue)) {
        acc[key] = dirtyValues(value, initialValue)
      } else {
        acc[key] = value
      }
    }

    return acc
  }, {})
}

const transformJoiValidation = (
  details: JoiValidationDetail[]
): Record<string, string> => {
  return details.reduce<Record<string, string>>((allErrors, current) => {
    const nextErrors = { ...allErrors }
    const path = current.path[current.path.length - 1]
    const message = i18n.t(`validations:${current.type}`, {
      ns: 'validations',
      ...current.context
    })
    if (Object.prototype.hasOwnProperty.call(nextErrors, path)) {
      nextErrors[path] = `${nextErrors[path]}, ${message}`
    } else {
      nextErrors[path] = message
    }
    return nextErrors
  }, {})
}

type ApiErrorResponse =
  | {
      code: 409
      errors: string[]
    }
  | {
      code?: number
      errors?: unknown
    }

export const transformErrorResponse = (
  response: ApiErrorResponse
): Record<string, string> => {
  if (response.code === 409 && Array.isArray(response.errors)) {
    return response.errors.reduce<Record<string, string>>((acc, field) => {
      acc[field] = i18n.t(
        field === 'email' ? 'errors.emailunique' : 'errors.unique'
      )
      return acc
    }, {})
  }

  if (Array.isArray(response.errors)) {
    return transformJoiValidation(
      response.errors as JoiValidationDetail[]
    )
  }

  return {}
}

// take a joi schema and create a validator function for redux form
export const validator =
  (schema: keyof typeof schemas) =>
  (values: PlainObject): Record<string, string> => {
    const result = Joi.validate(values, schemas[schema], {
      abortEarly: false
    }) as JoiValidationResult

    if (result.error === null) {
      return {}
    }

    return transformJoiValidation(result.error.details)
  }
