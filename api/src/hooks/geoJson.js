import GeoJSON from 'geojson'
import _ from 'lodash'

const parse = obj =>
  GeoJSON.parse(obj, {
    Point: ['latitude', 'longitude']
  })

const parseRelations = (obj, relations = []) => {
  const rel = _.isArray(relations) ? relations : [relations]
  const result = obj
  rel.forEach(r => {
    if (obj[r]) {
      result[r] = parse(obj[r].map(o => o.toJSON()))
    }
  })
  return result
}

const toGeoJSON = relations => ctx => {
  ctx.result = parse(
    ctx.result.toJSON
      ? parseRelations(ctx.result.toJSON(), relations)
      : ctx.result.map(o => parseRelations(o.toJSON(), relations))
  )
  return ctx
}

export default toGeoJSON
