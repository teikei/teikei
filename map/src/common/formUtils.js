import _ from 'lodash'
import Joi from 'joi-browser'
import { schemas } from './validation'
import i18n from '../i18n'

export const dirtyValues = (values, initialValues) =>
  _.transform(values, (result, value, key) => {
    if (!_.isEqual(value, initialValues[key])) {
      result[key] =
        _.isObject(value) && _.isObject(initialValues[key])
          ? dirtyValues(value, initialValues[key])
          : value
    }
  })

// take a joi schema and create a validator function for redux form
export const validator = schema => {
  return values => {
    const result = Joi.validate(values, schemas[schema], {
      abortEarly: false
    })

    if (result.error === null) {
      return {}
    }

    return result.error.details.reduce((all, cur) => {
      const allErrors = Object.assign({}, all)
      const path = cur.path[cur.path.length - 1]
      const message = i18n.t(`joi.${cur.type}`, cur.context)
      if (Object.prototype.hasOwnProperty.call(allErrors, path)) {
        allErrors[path] += `, ${message}`
      } else {
        allErrors[path] = message
      }
      return allErrors
    }, {})
  }
}
