import { Model, ValidationError, Validator } from 'objection'
import Joi from 'joi'

import { appLogger } from '../hooks/logger'

class JoiValidator extends Validator {
  // eslint-disable-next-line class-methods-use-this
  validate({ model, json }) {
    if (!model.constructor.jsonSchema) {
      appLogger.warn('skipping validation for model ', model)
      return json
    }
    const result = Joi.validate(json, model.constructor.jsonSchema)

    if (result.error) {
      appLogger.error(result.error)
      throw new ValidationError(result.error)
    }
    return result.value
  }
}

export class BaseModel extends Model {
  static createValidator() {
    return new JoiValidator()
  }

  static virtualAttributes = ['type', 'link']
}

