import { Model } from 'objection'
import { toGeoJSON } from '../util/jsonUtils'

export class BaseModel extends Model {}

export class EntryBaseModel extends BaseModel {
  $formatJson(json) {
    return toGeoJSON(super.$formatJson(json))
  }

  static virtualAttributes = ['type']
}
