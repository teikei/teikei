import _ from 'lodash'
import Ajv from 'ajv'
import compileSchema from 'redux-form-with-ajv'
import entitySchemas from '@teikei/schemas'
import i18n from '../i18n'

const ajv = new Ajv({
  allErrors: true,
  verbose: true
})

const errorMessage = error => i18n.t(`forms.validation.${error.keyword}`)

const validators = _.mapValues(entitySchemas, schema =>
  compileSchema(schema, { ajv, errorMessage })
)

export const validator = name => validators[name]

export const dirtyValues = (values, initialValues) =>
  _.transform(values, (result, value, key) => {
    if (!_.isEqual(value, initialValues[key])) {
      result[key] =
        _.isObject(value) && _.isObject(initialValues[key])
          ? dirtyValues(value, initialValues[key])
          : value
    }
  })
