import { Model, ValidationError, Validator } from 'objection'
import { DbErrors } from 'objection-db-errors'
import Joi from 'joi'

import { appLogger } from '../hooks/logger'

class JoiValidator extends Validator {
  // eslint-disable-next-line class-methods-use-this
  validate({ model, json, options: { patch } }) {
    if (!model.constructor.joiSchema || patch) {
      return json
    }
    const result = Joi.validate(json, model.constructor.joiSchema, {
      abortEarly: false,
    })

    if (result.error) {
      appLogger.error(result.error)
      const validationError = new ValidationError(result.error)
      validationError.errors = result.error.details
      throw validationError
    }
    return result.value
  }
}

export default class BaseModel extends DbErrors(Model) {
  static createValidator() {
    return new JoiValidator()
  }

  static virtualAttributes = ['type', 'link']
}
