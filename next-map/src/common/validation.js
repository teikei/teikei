import _ from 'lodash'
import Ajv from 'ajv'
import compileSchema from 'redux-form-with-ajv'
import entitySchemas from '../schemas/entities'
import i18n from '../i18n'

const ajv = new Ajv({
  allErrors: true,
  verbose: true
})

const errorMessage = error => i18n.t(`forms.validation.${error.keyword}`)

const validators = _.mapValues(entitySchemas, schema =>
  compileSchema(schema, { ajv, errorMessage })
)

export default name => validators[name]
