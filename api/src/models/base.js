import { Model, ValidationError, Validator } from 'objection'
import GeoJSON from 'geojson'
import Joi from 'joi'

import { appLogger } from '../hooks/logger'

const toGeoJSON = json =>
  GeoJSON.parse(json, {
    Point: ['latitude', 'longitude']
  })

class JoiValidator extends Validator {
  // eslint-disable-next-line class-methods-use-this
  validate({ model, json }) {
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

export class EntryBaseModel extends BaseModel {
  $formatJson(json) {
    return toGeoJSON(super.$formatJson(json))
  }
}
