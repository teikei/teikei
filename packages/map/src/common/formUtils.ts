import _ from 'lodash'
// @ts-ignore
import i18n from 'i18next'
import Joi from 'joi-browser'
import { schemas } from '@/common/validation'

export const dirtyValues = (values, initialValues) =>
  _.transform(values, (result, value, key) => {
    if (!_.isEqual(value, initialValues[key])) {
      result[key] =
        _.isObject(value) && _.isObject(initialValues[key])
          ? dirtyValues(value, initialValues[key])
          : value
    }
  })

const transformJoiValidation = (
  result: { path: string; type: string; context: string }[]
) => {
  return result.reduce((all, cur) => {
    const allErrors = Object.assign({}, all)
    const path = cur.path[cur.path.length - 1]
    const message = i18n.t(`validations:${cur.type}`, {
      ns: 'validations',
      ...cur.context
    })
    if (Object.prototype.hasOwnProperty.call(allErrors, path)) {
      allErrors[path] += `, ${message}`
    } else {
      allErrors[path] = message
    }
    return allErrors
  }, {})
}

export const transformErrorResponse = (response) => {
  if (response.code === 409) {
    // Unique violation error
    return response.errors.reduce((acc, curr) => {
      acc[curr] = i18n.t(
        curr === 'email' ? 'errors.emailunique' : 'errors.unique'
      )
      return acc
    }, {})
  }
  if (response.errors && _.isArray(response.errors)) {
    return transformJoiValidation(response.errors)
  }
  return {}
}

// take a joi schema and create a validator function for redux form
export const validator = (schema: keyof typeof schemas) => (values: object) => {
  const result = Joi.validate(values, schemas[schema], {
    abortEarly: false
  })

  if (result.error === null) {
    return {}
  }

  return transformJoiValidation(result.error.details)
}
