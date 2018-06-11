/* eslint-disable no-undef,class-methods-use-this */
import { Model, snakeCaseMappers } from 'objection'
import toGeoJson from '../util/geojsonUtils'

export class BaseModel extends Model {
  // TODO enable this after migrating frontend to camel case properties
  // static columnNameMappers = snakeCaseMappers()
}

export class EntryBaseModel extends BaseModel {
  $formatJson(json) {
    return toGeoJson(super.$formatJson(json))
  }
  static virtualAttributes = ['type']
}
