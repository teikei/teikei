import { Model, snakeCaseMappers } from 'objection'
import { toGeoJSON } from '../util/jsonUtils'

export class BaseModel extends Model {
  static columnNameMappers = snakeCaseMappers()
}

export class EntryBaseModel extends BaseModel {
  $formatJson(json) {
    return toGeoJSON(super.$formatJson(json))
  }

  static virtualAttributes = ['type']
}
