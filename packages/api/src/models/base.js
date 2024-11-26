import Joi from 'joi'
import { Model, ValidationError, Validator } from 'objection'
import { DbErrors } from 'objection-db-errors'
import { logger } from '../logger'

class JoiValidator extends Validator {
  // eslint-disable-next-line class-methods-use-this
  validate({ model, json, options: { patch } }) {
    if (!model.constructor.joiSchema || patch) {
      return json
    }
    const result = Joi.object(model.constructor.joiSchema).validate(json, {
      abortEarly: false
    })

    if (result.error) {
      logger.error(result.error)
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
