import { Model } from 'objection'
import GeoJSON from 'geojson'

const toGeoJSON = json =>
  GeoJSON.parse(json, {
    Point: ['latitude', 'longitude'],
    exclude: ['legacy_id', 'address']
  })

export class BaseModel extends Model {
  static virtualAttributes = ['type', 'link']
}

export class EntryBaseModel extends BaseModel {
  $formatJson(json) {
    return toGeoJSON(super.$formatJson(json))
  }
}
