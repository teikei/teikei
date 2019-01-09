import { Model, ValidationError, Validator } from 'objection'
import Joi from 'joi'

import { appLogger } from '../hooks/logger'

class JoiValidator extends Validator {
  // eslint-disable-next-line class-methods-use-this
  validate({ model, json, options: { patch } }) {
    if (!model.constructor.joiSchema || patch) {
      return json
    }
    const result = Joi.validate(json, model.constructor.joiSchema)

    if (result.error) {
      appLogger.error(result.error)
      throw new ValidationError(result.error)
    }
    return result.value
  }
}

export default class BaseModel extends Model {
  static createValidator() {
    return new JoiValidator()
  }

  static virtualAttributes = ['type', 'link']
}
